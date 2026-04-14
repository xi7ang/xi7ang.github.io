/**
 * scripts/build-search-index.js
 * 在 prebuild 阶段生成 Fuse.js 搜索索引
 * 输出 docs/.vitepress/dist/search-index.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Fuse from 'fuse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RESOURCES_FILE = path.join(__dirname, '../docs/.vitepress/dist/resources.json')
const OUTPUT_FILE   = path.join(__dirname, '../docs/.vitepress/dist/search-index.json')

const CATEGORY_LABELS = {
  AIknowledge:        'AI知识',
  book:               '书籍资料',
  'chinese-traditional': '传统文化',
  'cross-border':     '跨境电商',
  curriculum:         '课程资料',
  'edu-knowlege':     '教育知识',
  games:              '游戏资源',
  healthy:            '健康养生',
  movies:             '影视媒体',
  'self-media':       '自媒体',
  tools:              '工具合集',
  auto:               '自动化工具',
}

const PLATFORM_LABELS = {
  quark:   '夸克网盘',
  baidu:   '百度网盘',
  xunlei:  '迅雷网盘',
  aliyun:  '阿里云盘',
  unknown: '其他资源',
}

function formatMonth(m) {
  if (m?.length === 6) return `${m.slice(0, 4)}年${parseInt(m.slice(4, 6))}月`
  return m || ''
}

function main() {
  if (!fs.existsSync(RESOURCES_FILE)) {
    console.warn('resources.json not found, skipping search index')
    return
  }

  const resources = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf-8'))

  // Fuse.js options
  const fuse = new Fuse(resources, {
    keys: [
      { name: 'title',       weight: 0.6 },
      { name: 'category',    weight: 0.2 },
      { name: 'platform',    weight: 0.1 },
      { name: 'month',       weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  })

  // 将索引序列化：存储 Fuse 的 index 集合
  // Fuse 索引不可直接 JSON 序列化，用扁平的 token 集合替代
  const indexData = resources.map(r => ({
    id:    `${r.category}-${r.month}-${r.title.slice(0, 20)}`,
    title: r.title,
    category: r.category,
    categoryLabel: CATEGORY_LABELS[r.category] || r.category,
    platform: r.platform,
    platformLabel: PLATFORM_LABELS[r.platform] || r.platform,
    month: r.month,
    monthLabel: formatMonth(r.month),
    url: r.url || '',
    pwd: r.pwd || '',
  }))

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(indexData), 'utf-8')
  console.log(`✓ 搜索索引已生成：${indexData.length} 条记录 → ${OUTPUT_FILE}`)
}

main()
