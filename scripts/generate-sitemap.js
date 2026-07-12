/**
 * scripts/generate-sitemap.js
 *
 * 构建后生成完整的 sitemap.xml，包含：
 *   1. 所有静态页面（来自 .md 文件）
 *   2. 所有资源详情页（来自 resources.json，每个资源独立 URL）
 *
 * 覆盖 VitePress 自动生成的 dist/sitemap.xml
 *
 * 运行时机：package.json postbuild
 * 依赖：同级目录下 docs/.vitepress/dist/ 已构建完成
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const DIST_DIR = path.join(DOCS_DIR, '.vitepress', 'dist')
const RESOURCES_FILE = path.join(DOCS_DIR, 'public', 'data', 'resources.json')
const OUTPUT = path.join(DIST_DIR, 'sitemap.xml')

const HOSTNAME = 'https://pan.devmini.space'

// ── 页面优先级 & 更新频率 ──
// ── 页面优先级 & 更新频率 ──
// 注意顺序：精确匹配靠前，泛匹配靠后

function getPriority(url) {
  // 首页
  if (url === '/') return 1.0
  // 分类主页
  if (/^\/(AIknowledge|book|chinese-traditional|cross-border|curriculum|edu-knowlege|games|healthy|movies|self-media|tools|auto)\/$/.test(url)) return 0.9
  // 静态页面（免责、支持、资源入口页等）
  if (url === '/disclaimer' || url === '/support') return 0.3
  if (url === '/resource') return 0.5  // 资源入口页（不带参数）
  // 资源详情页（带 query string）
  if (/^\/resource\?/.test(url)) return 0.6
  // 月度资源列表页（如 /games/202607）
  if (/^\/[a-z-]+\/20\d{4}$/.test(url)) return 0.7
  // 其他页面
  return 0.5
}

function getChangefreq(url) {
  if (url === '/') return 'daily'
  if (/^\/resource\?/.test(url)) return 'weekly'
  if (/^\/[a-z-]+\/20\d{4}$/.test(url)) return 'daily'
  return 'weekly'
}

// ── 收集静态页面 ──
function collectStaticPages() {
  const pages = []

  // 扫描 docs/ 下所有 .md 文件（排除 index.md 和 public/）
  function scanDir(dir, prefix) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        // 跳过 public/ 目录（它只是资源文件，不是页面路由）
        if (entry.name === 'public') continue
        // 跳过 .vitepress
        if (entry.name === '.vitepress') continue
        scanDir(full, prefix + entry.name + '/')
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const name = entry.name.slice(0, -3) // remove .md
        // index.md → 目录页
        const url = name === 'index' ? prefix : prefix + name
        pages.push(url)
      }
    }
  }

  scanDir(DOCS_DIR, '/')
  return [...new Set(pages)].sort()
}

// ── 收集资源详情页 ──
function collectResourcePages() {
  if (!fs.existsSync(RESOURCES_FILE)) {
    console.warn('  ⚠ resources.json 不存在，跳过资源详情页')
    return []
  }

  const resources = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf-8'))
  if (!Array.isArray(resources)) return []

  const pages = resources
    .filter(r => r.id !== undefined && r.id !== null)
    .map(r => `/resource?c=${encodeURIComponent(r.category)}&id=${r.id}`)

  console.log(`  ✓ 资源详情页: ${pages.length} 条`)
  return pages
}

// ── 获取 lastmod ──
function getLastmod() {
  // 使用资源文件 mtime 作为整体更新时间
  try {
    const stat = fs.statSync(RESOURCES_FILE)
    return new Date(stat.mtimeMs).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist 目录不存在 → 请先执行 npm run build')
    process.exit(1)
  }

  console.log('📄 生成 sitemap.xml...')

  const lastmod = getLastmod()

  // 1. 静态页面
  const staticPages = collectStaticPages()
  console.log(`  ✓ 静态页面: ${staticPages.length} 条`)

  // 2. 资源详情页
  const resourcePages = collectResourcePages()

  // 3. 合并去重
  const allUrls = [...new Set([...staticPages, ...resourcePages])]
  console.log(`  ✓ 总计: ${allUrls.length} 条 URL`)

  // 4. 生成 XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  for (const url of allUrls) {
    const loc = `${HOSTNAME}${url}`
    // 对有 query string 的 URL 做 XML 转义
    const escapedLoc = loc
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    const priority = getPriority(url)
    const changefreq = getChangefreq(url)

    xml += `  <url>
    <loc>${escapedLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>
`
  }

  xml += `</urlset>
`

  // 5. 写入
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, xml, 'utf-8')
  console.log(`\n✅ sitemap.xml 已生成：${OUTPUT}`)
  console.log(`   文件大小: ${(Buffer.byteLength(xml) / 1024).toFixed(1)} KB`)
  console.log(`   总 URL 数: ${allUrls.length}`)
}

main()
