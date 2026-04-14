/**
 * scripts/parse-resources.js
 * 扫描 docs/{category}/ 下所有月份资源文件，解析为统一 JSON
 * 运行方式: node scripts/parse-resources.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '../docs')
const OUTPUT_FILE = path.join(__dirname, '../docs/.vitepress/dist/resources.json')

// 平台识别
function detectPlatform(url) {
  if (!url) return 'unknown'
  if (url.includes('pan.quark.cn') || url.includes('quark.cn')) return 'quark'
  if (url.includes('pan.baidu.com') || url.includes('baidu.com')) return 'baidu'
  if (url.includes('pan.xunlei.cn') || url.includes('xunlei.cn')) return 'xunlei'
  if (url.includes('alipan.com') || url.includes('aliyundrive.com') || url.includes('www.alipan.com')) return 'aliyun'
  return 'unknown'
}

// 提取密码
function extractPwd(url) {
  if (!url) return null
  const match = url.match(/[?&]pwd=([^&\s]+)/)
  return match ? match[1] : null
}

// 清理标题
function cleanTitle(s) {
  return s.replace(/^\s*[-·*]\s*/, '').trim()
}

// 解析一行资源
// 返回 { title, url, pwd, platform } 或 null
function parseResourceLine(line, lines, idx) {
  const raw = line.trim()
  if (!raw || raw.startsWith('#') || raw.startsWith('---') || raw.startsWith('```')) return null

  // 格式A: "标题 | https://..."
  const pipeA = raw.match(/^[-]?\s*(.+?)\s*\|\s*(https?:\/\/\S+)/)
  if (pipeA) {
    const url = pipeA[2].split('?')[0] + (pipeA[2].includes('?') ? '?' + pipeA[2].split('?').slice(1).join('?') : '')
    // rebuild full URL with all params
    const fullUrl = pipeA[2]
    return {
      title: cleanTitle(pipeA[1]),
      url: fullUrl,
      pwd: extractPwd(fullUrl),
      platform: detectPlatform(fullUrl)
    }
  }

  // 格式B: "- **标题** — 描述" （games 格式）
  const boldMatch = raw.match(/^-\s*\*\*([^*]+)\*\*(?:\s*[—\-]\s*(.+))?$/)
  if (boldMatch) {
    // 标题已找到，但 URL 在后续行
    const title = cleanTitle(boldMatch[1])
    // 往后最多3行找 URL
    for (let i = 1; i <= 3 && idx + i < lines.length; i++) {
      const next = lines[idx + i].trim()
      if (!next || next.startsWith('- **') || next.startsWith('#') || next.startsWith('---')) break
      const urlMatch = next.match(/(https?:\/\/\S+)/)
      if (urlMatch) {
        return {
          title,
          url: urlMatch[1],
          pwd: extractPwd(urlMatch[1]),
          platform: detectPlatform(urlMatch[1])
        }
      }
    }
    // 没找到 URL，记录无链接条目
    return {
      title,
      url: null,
      pwd: null,
      platform: 'unknown'
    }
  }

  // 格式C: 纯 URL 行
  const pureUrl = raw.match(/^(https?:\/\/\S+)$/)
  if (pureUrl) {
    return {
      title: '点击访问资源',
      url: pureUrl[1],
      pwd: extractPwd(pureUrl[1]),
      platform: detectPlatform(pureUrl[1])
    }
  }

  // 格式D: "标题 https://..."（标题和 URL 在同一行，空格分隔）
  const sameLine = raw.match(/^(.+?)\s+(https?:\/\/\S+)$/)
  if (sameLine) {
    const t = cleanTitle(sameLine[1])
    // 排除纯数字序号行
    if (!/^\d+$/.test(t) && t.length > 2) {
      return {
        title: t,
        url: sameLine[2],
        pwd: extractPwd(sameLine[2]),
        platform: detectPlatform(sameLine[2])
      }
    }
  }

  return null
}

// 扫描一个类目目录
function scanCategory(categoryDir, category) {
  const entries = []

  if (!fs.existsSync(categoryDir)) return entries

  const files = fs.readdirSync(categoryDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('index'))

  for (const file of files) {
    // 从文件名提取月份，如 202604.md
    const monthMatch = file.match(/^(\d{6})\.md$/)
    if (!monthMatch) continue
    const month = monthMatch[1]

    const filePath = path.join(categoryDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const parsed = parseResourceLine(lines[i], lines, i)
      if (parsed) {
        entries.push({
          ...parsed,
          category,
          month
        })
      }
    }
  }

  return entries
}

// 主函数
function main() {
  const categories = [
    'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
    'curriculum', 'edu-knowlege', 'games', 'healthy',
    'movies', 'self-media', 'tools', 'auto'
  ]

  const allResources = []
  const stats = {}

  for (const cat of categories) {
    const dir = path.join(DOCS_DIR, cat)
    if (!fs.existsSync(dir)) continue

    const entries = scanCategory(dir, cat)
    allResources.push(...entries)
    stats[cat] = entries.length
    console.log(`  ✓ ${cat}: ${entries.length} 条资源`)
  }

  // 确保输出目录存在
  const outDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResources, null, 2), 'utf-8')
  console.log(`\n共解析 ${allResources.length} 条资源，已写入 ${OUTPUT_FILE}`)
}

main()
