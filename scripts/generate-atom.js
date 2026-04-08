import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://pan.devmini.space'
const FEED_PATH = path.resolve(process.cwd(), 'docs/public/atom.xml')
const DOCS_DIR = path.resolve(process.cwd(), 'docs')

const CATEGORY_LABELS = {
  AIknowledge: 'AI 知识',
  auto: '汽车',
  book: '书籍资料',
  'chinese-traditional': '传统文化',
  'cross-border': '跨境电商',
  curriculum: '课程资料',
  'edu-knowlege': '教育知识',
  healthy: '健康养生',
  movies: '影视媒体',
  'self-media': '自媒体',
  tools: '工具合集',
}

function escapeXml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function readMarkdownSummary(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.startsWith('#'))
    .filter(line => !line.startsWith('---'))
    .filter(line => !line.startsWith('!['))

  const summary = lines[0] || '资源更新'
  return summary.replace(/[`*_>#-]/g, '').slice(0, 180)
}

function collectEntries() {
  const entries = []

  for (const [dirName, label] of Object.entries(CATEGORY_LABELS)) {
    const dirPath = path.join(DOCS_DIR, dirName)
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      continue
    }

    const files = fs.readdirSync(dirPath)
      .filter(file => /^20\d{4}\.md$/.test(file))

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)
      const slug = file.replace(/\.md$/, '')
      const url = `${SITE_URL}/${dirName}/${slug}`
      const updatedAt = stat.mtime.toISOString()
      const summary = readMarkdownSummary(filePath)

      entries.push({
        id: `tag:pan.devmini.space,${updatedAt.slice(0, 10)}:${dirName}/${slug}`,
        title: `${label} ${slug} 更新`,
        url,
        updatedAt,
        summary,
        category: label,
      })
    }
  }

  return entries
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 30)
}

function buildFeed(entries) {
  const updated = entries[0]?.updatedAt || new Date().toISOString()
  const entryXml = entries.map(entry => `
  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="${escapeXml(entry.url)}" />
    <id>${escapeXml(entry.id)}</id>
    <updated>${escapeXml(entry.updatedAt)}</updated>
    <category term="${escapeXml(entry.category)}" />
    <summary>${escapeXml(entry.summary)}</summary>
  </entry>`).join('')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>xi7ang 资源收集站更新订阅</title>
  <subtitle>最近资源更新与分类内容变更</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" />
  <link href="${SITE_URL}/" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <author>
    <name>xi7ang</name>
  </author>${entryXml}
</feed>
`
}

const entries = collectEntries()
const atom = buildFeed(entries)
fs.writeFileSync(FEED_PATH, atom, 'utf8')
console.log(`Generated Atom feed with ${entries.length} entries at ${FEED_PATH}`)
