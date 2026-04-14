<template>
  <div class="resource-card" :class="[`platform-${resource.platform}`, { compact }]">
    <div class="platform-stripe"></div>
    <div class="card-body">
      <div class="card-header">
        <span class="platform-tag" :style="{ background: platformColor(resource.platform) }">
          {{ platformLabel }}
        </span>
        <span v-if="resource.pwd" class="pwd-tag">取码: {{ resource.pwd }}</span>
      </div>

      <h3 class="card-title" :title="resource.title">{{ resource.title }}</h3>

      <div class="card-meta">
        <span class="meta-chip">{{ categoryLabel }}</span>
        <span class="meta-chip">{{ monthLabel }}</span>
      </div>

      <div class="card-actions">
        <button v-if="resource.url" class="btn btn-ghost" @click="handleCopy">
          <svg viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 11V3h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          {{ copied ? '已复制' : '复制链接' }}
        </button>
        <a v-if="resource.url" :href="resource.url" target="_blank" rel="noopener" class="btn btn-primary">
          跳转网盘
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Resource {
  title: string
  url: string | null
  pwd: string | null
  platform: string
  category: string
  month: string
  description?: string
}

const props = defineProps<{ resource: Resource; compact?: boolean }>()
const copied = ref(false)

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  quark:   { label: '夸克网盘', color: '#7c3aed' },
  baidu:   { label: '百度网盘', color: '#1d4ed8' },
  xunlei:  { label: '迅雷网盘', color: '#d97706' },
  aliyun:  { label: '阿里云盘', color: '#0891b2' },
  unknown: { label: '其他', color: '#64748b' },
}

const CATEGORY_LABELS: Record<string, string> = {
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

function platformColor(p: string) {
  return PLATFORM_META[p]?.color || '#64748b'
}

const platformLabel = computed(() => PLATFORM_META[props.resource.platform]?.label ?? '其他')
const categoryLabel = computed(() => CATEGORY_LABELS[props.resource.category] ?? props.resource.category)

const monthLabel = computed(() => {
  const m = props.resource.month
  if (m?.length === 6) return `${m.slice(0, 4)}/${m.slice(4, 6)}`
  return m || ''
})

async function handleCopy() {
  if (!props.resource.url) return
  const url = props.resource.pwd
    ? `${props.resource.url.split('?')[0]}?pwd=${props.resource.pwd}`
    : props.resource.url
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = url
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.resource-card {
  position: relative;
  display: flex;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand-1);
}

/* 左侧色条 */
.platform-stripe { width: 3px; flex-shrink: 0; }
.platform-quark  .platform-stripe { background: #7c3aed; }
.platform-baidu  .platform-stripe { background: #1d4ed8; }
.platform-xunlei .platform-stripe { background: #d97706; }
.platform-aliyun .platform-stripe { background: #0891b2; }
.platform-unknown .platform-stripe { background: #64748b; }

.card-body {
  flex: 1;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.platform-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.pwd-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.02em;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-meta {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.45rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn svg { width: 12px; height: 12px; flex-shrink: 0; }

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.btn-primary:hover { background: var(--vp-c-brand-2); }

.btn-ghost {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
}
.btn-ghost:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

/* compact 模式 */
.resource-card.compact .card-body { padding: 0.7rem 0.875rem; gap: 0.4rem; }
.resource-card.compact .card-title { -webkit-line-clamp: 1; font-size: 0.825rem; }
.resource-card.compact .btn { padding: 0.28rem 0.6rem; font-size: 0.73rem; }

/* Mobile */
@media (max-width: 640px) {
  .card-actions { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
  .resource-card.compact .card-actions { flex-direction: row; }
  .resource-card.compact .btn { width: auto; }
}
</style>
