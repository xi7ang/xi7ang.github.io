/**
 * scripts/parse-resources.js
 * 扫描 docs/{category}/ 下所有 .md 文件，解析为统一 JSON
 * 202*.md 文件：从文件名提取月份
 * 其他 .md 文件（如 AIknowledge.md）：解析内容中的年月标记，或用当前月份
 * 过滤掉 url === null 的无效条目
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '../docs')
const OUTPUT_FILE = path.join(__dirname, '../docs/public/data/resources.json')

// 当前年月（用于无法从文件名/内容提取月份的情况）
const now = new Date()
const CURRENT_MONTH = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

function detectPlatform(url) {
  if (!url) return 'unknown'
  if (url.includes('pan.quark.cn') || url.includes('quark.cn')) return 'quark'
  if (url.includes('pan.baidu.com') || url.includes('baidu.com')) return 'baidu'
  if (url.includes('pan.xunlei.cn') || url.includes('xunlei.cn')) return 'xunlei'
  if (url.includes('alipan.com') || url.includes('aliyundrive.com') || url.includes('www.alipan.com')) return 'aliyun'
  return 'unknown'
}

function extractPwd(url) {
  if (!url) return null
  const match = url.match(/[?&]pwd=([^&\s]+)/)
  return match ? match[1] : null
}

function cleanTitle(s) {
  return s.replace(/^\s*[-·*]\s*/, '').trim()
}

// 解析一行资源，返回 { title, url, pwd, platform } 或 null
function parseLine(line, lines, idx) {
  const raw = line.trim()
  if (!raw || raw.startsWith('#') || raw.startsWith('---') || raw.startsWith('```')) return null

  // 格式A: "标题 | https://..."
  const pipeA = raw.match(/^[-]?\s*(.+?)\s*\|\s*(https?:\/\/\S+)/)
  if (pipeA) {
    const fullUrl = pipeA[2]
    return {
      title: cleanTitle(pipeA[1]),
      url: fullUrl,
      pwd: extractPwd(fullUrl),
      platform: detectPlatform(fullUrl)
    }
  }

  // 格式B: "- **标题** — 描述"（games 格式）
  const boldMatch = raw.match(/^-\s*\*\*([^*]+)\*\*(?:\s*[—\-]\s*(.+))?$/)
  if (boldMatch) {
    const title = cleanTitle(boldMatch[1])
    for (let i = 1; i <= 3 && idx + i < lines.length; i++) {
      const next = lines[idx + i].trim()
      if (!next || next.startsWith('- **') || next.startsWith('#') || next.startsWith('---')) break
      const urlMatch = next.match(/(https?:\/\/\S+)/)
      if (urlMatch) {
        return { title, url: urlMatch[1], pwd: extractPwd(urlMatch[1]), platform: detectPlatform(urlMatch[1]) }
      }
    }
    return { title, url: null, pwd: null, platform: 'unknown' }
  }

  // 格式C: 纯 URL 行
  const pureUrl = raw.match(/^(https?:\/\/\S+)$/)
  if (pureUrl) {
    return { title: '点击访问资源', url: pureUrl[1], pwd: extractPwd(pureUrl[1]), platform: detectPlatform(pureUrl[1]) }
  }

  // 格式D: "标题 https://..."（同行空格分隔）
  const sameLine = raw.match(/^(.+?)\s+(https?:\/\/\S+)$/)
  if (sameLine) {
    const t = cleanTitle(sameLine[1])
    if (!/^\d+$/.test(t) && t.length > 2) {
      return { title: t, url: sameLine[2], pwd: extractPwd(sameLine[2]), platform: detectPlatform(sameLine[2]) }
    }
  }

  return null
}

// 从文件内容中提取年月（如 "2026/04"、"2026-04"）
function extractMonthFromContent(content) {
  const match = content.match(/\b(20\d{2}[-/]\d{2})\b/)
  if (match) return match[1].replace('/', '')
  return null
}

// 过滤掉明显是文档/注释而非资源条目的解析结果
const TITLE_SKIP_PATTERNS = [
  /^[\d]+\s+保持资源名称/i,
  /Keep resource titles clean/i,
  /^[\d]+\s+提交仓库的版本说明/i,
  /提交仓库的版本说明/i,
]

function looksLikeResource(entry) {
  if (!entry.title || entry.title.length < 4) return false
  for (const pat of TITLE_SKIP_PATTERNS) {
    if (pat.test(entry.title)) return false
  }
  return true
}

// 扫描一个类目目录
function scanCategory(catDir, category) {
  const entries = []
  if (!fs.existsSync(catDir)) return entries

  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && !f.startsWith('index'))

  for (const file of files) {
    const monthFromFile = file.match(/^(\d{6})\.md$/)
    const month = monthFromFile ? monthFromFile[1] : null

    const filePath = path.join(catDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // 如果文件本身月份不明确，从内容提取年月
    const monthFromContent = month || extractMonthFromContent(content) || CURRENT_MONTH

    for (let i = 0; i < lines.length; i++) {
      const parsed = parseLine(lines[i], lines, i)
      if (parsed) {
        entries.push({ ...parsed, category, month: monthFromContent })
      }
    }
  }

  return entries
}

function main() {
  const categories = [
    'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
    'curriculum', 'edu-knowlege', 'games', 'healthy',
    'movies', 'self-media', 'tools', 'auto',
  ]

  let allResources = []
  const stats = {}

  for (const cat of categories) {
    const dir = path.join(DOCS_DIR, cat)
    const entries = scanCategory(dir, cat)
    allResources.push(...entries)
    stats[cat] = entries.length
  }

  // 过滤掉无 URL 的无效条目
  const before = allResources.length
  allResources = allResources.filter(r => r.url !== null)
  const filtered = before - allResources.length

  const outDir = path.dirname(OUTPUT_FILE)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResources, null, 2), 'utf-8')

  for (const [cat, n] of Object.entries(stats)) {
    if (n > 0) console.log(`  ✓ ${cat}: ${n} 条资源`)
  }
  if (filtered > 0) console.log(`  (过滤 ${filtered} 条无 URL 的无效条目)`)
  console.log(`\n共解析 ${allResources.length} 条资源，已写入 ${OUTPUT_FILE}`)
}

main()
