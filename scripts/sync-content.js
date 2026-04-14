/**
 * scripts/sync-content.js
 * 从内容仓库（/root/.openclaw/workspace/mswnlz/{category}/）同步年月 .md 资源文件到 docs/{category}/
 * 运行方式: node scripts/sync-content.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 内容仓库根目录: /root/.openclaw/workspace/mswnlz/ (内容仓库和 xi7ang.github.io 同级)
const CONTENT_BASE = path.join(__dirname, '../..')
const DOCS_DIR = path.join(__dirname, '../docs')

const CATEGORIES = [
  'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
  'curriculum', 'edu-knowlege', 'games', 'healthy',
  'movies', 'self-media', 'tools', 'auto',
]

function md5(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex')
}

function syncCategory(cat) {
  const srcBase = path.join(CONTENT_BASE, cat)
  const dstDir = path.join(DOCS_DIR, cat)

  if (!fs.existsSync(srcBase)) {
    console.log(`  ⚠️  内容仓库不存在: ${srcBase}`)
    return { copied: 0, skipped: 0 }
  }

  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true })
  }

  // 优先同步年月文件（20*.md），若无则同步所有非 index 的 .md（如 AIknowledge.md）
  let srcFiles = fs.readdirSync(srcBase)
    .filter(f => f.endsWith('.md') && !f.startsWith('index'))
    .filter(f => /^20\d{4}\.md$/.test(f) || true)  // 暂时取所有 .md
    .sort()

  // 如果有 20*.md，只同步年月文件；否则同步全部非 index .md
  const yearMonthFiles = srcFiles.filter(f => /^20\d{4}\.md$/.test(f))
  const syncFiles = yearMonthFiles.length > 0 ? yearMonthFiles : srcFiles

  const dstFiles = new Set(
    fs.existsSync(dstDir)
      ? fs.readdirSync(dstDir).filter(f => /^20\d{4}\.md$/.test(f))
      : []
  )

  let copied = 0, skipped = 0

  for (const file of syncFiles) {
    const src = path.join(srcBase, file)
    const dst = path.join(dstDir, file)

    if (!dstFiles.has(file)) {
      fs.copyFileSync(src, dst)
      console.log(`  + 新增: ${cat}/${file}`)
      copied++
    } else {
      try {
        if (md5(src) !== md5(dst)) {
          fs.copyFileSync(src, dst)
          console.log(`  ~ 更新: ${cat}/${file}`)
          copied++
        } else {
          skipped++
        }
      } catch {
        skipped++
      }
    }
  }

  return { copied, skipped }
}

function runScript(scriptPath, label) {
  console.log(`\n${label} ...`)
  const result = spawnSync('node', [scriptPath], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    console.error(`✗ ${label} 失败，exit code ${result.status}`)
    return false
  }
  return true
}

function main() {
  console.log('=== 同步内容仓库 → docs 目录 ===\n')
  console.log(`内容仓库: ${CONTENT_BASE}`)
  console.log(`目标目录: ${DOCS_DIR}\n`)

  let totalCopied = 0, totalSkipped = 0

  for (const cat of CATEGORIES) {
    const srcBase = path.join(CONTENT_BASE, cat)
    if (!fs.existsSync(srcBase)) {
      console.log(`📁 ${cat}: 内容仓库不存在，跳过`)
      continue
    }
    const { copied, skipped } = syncCategory(cat)
    totalCopied += copied
    totalSkipped += skipped
  }

  console.log(`\n=== 同步完成 ===`)
  console.log(`新增/更新: ${totalCopied} 个文件`)
  console.log(`无需更新: ${totalSkipped} 个文件`)

  if (totalCopied > 0) {
    runScript(path.join(__dirname, 'parse-resources.js'), '生成 resources.json')
    runScript(path.join(__dirname, 'build-search-index.js'), '生成 search-index.json')
    console.log('\n✅ 全部完成')
  } else {
    console.log('\n内容无变化，跳过重新生成')
  }
}

main()
