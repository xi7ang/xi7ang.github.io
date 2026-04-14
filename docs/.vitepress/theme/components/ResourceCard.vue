<template>
  <div class="resource-card" :class="[`platform-${resource.platform}`, { compact }]">
    <div class="platform-stripe"></div>
    <div class="card-body">
      <div class="card-header">
        <div class="platform-badge">
          <span class="platform-icon">{{ platformIcon }}</span>
          <span class="platform-name">{{ platformLabel }}</span>
        </div>
        <span v-if="resource.pwd" class="pwd-badge">
          🔑 {{ resource.pwd }}
        </span>
      </div>

      <h3 class="card-title" :title="resource.title">{{ resource.title }}</h3>

      <div v-if="!compact && resource.description" class="card-desc">
        {{ resource.description }}
      </div>

      <div class="card-meta">
        <span class="meta-item">
          <span class="meta-icon">📁</span>
          {{ categoryLabel }}
        </span>
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          {{ monthLabel }}
        </span>
      </div>

      <div class="card-actions">
        <button
          v-if="resource.url"
          class="btn btn-primary"
          @click="handleJump"
          :title="resource.url"
        >
          <span>🚀</span>
          <span>{{ compact ? '跳转' : '跳转到网盘' }}</span>
        </button>
        <button
          v-if="resource.url"
          class="btn btn-secondary"
          @click="handleCopy"
        >
          <span>{{ copied ? '✅' : '📋' }}</span>
          <span>{{ copied ? '已复制' : '复制链接' }}</span>
        </button>
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

const props = defineProps<{
  resource: Resource
  compact?: boolean
}>()

const copied = ref(false)

const platformMap: Record<string, { icon: string; label: string }> = {
  quark:   { icon: '🏐', label: '夸克网盘' },
  baidu:   { icon: '📦', label: '百度网盘' },
  xunlei:  { icon: '⚡', label: '迅雷网盘' },
  aliyun:  { icon: '☁️', label: '阿里云盘' },
  unknown: { icon: '🔗', label: '其他资源' },
}

const categoryMap: Record<string, string> = {
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

const platformIcon = computed(() => platformMap[props.resource.platform]?.icon ?? '🔗')
const platformLabel = computed(() => platformMap[props.resource.platform]?.label ?? '其他资源')
const categoryLabel = computed(() => categoryMap[props.resource.category] ?? props.resource.category)

const monthLabel = computed(() => {
  const m = props.resource.month
  if (m && m.length === 6) {
    return `${m.slice(0, 4)}年${parseInt(m.slice(4, 6))}月`
  }
  return m || ''
})

async function handleJump() {
  if (!props.resource.url) return
  window.open(props.resource.url, '_blank', 'noopener,noreferrer')
}

async function handleCopy() {
  if (!props.resource.url) return
  const fullUrl = props.resource.pwd
    ? `${props.resource.url.split('?')[0]}?pwd=${props.resource.pwd}`
    : props.resource.url
  try {
    await navigator.clipboard.writeText(fullUrl)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = fullUrl
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
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.resource-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.platform-stripe {
  width: 4px;
  flex-shrink: 0;
}

.platform-quark  .platform-stripe { background: #8B5CF6; }
.platform-baidu  .platform-stripe { background: #2932E1; }
.platform-xunlei .platform-stripe { background: #FF9500; }
.platform-aliyun .platform-stripe { background: #00B9F1; }
.platform-unknown .platform-stripe { background: #6B7280; }

.card-body {
  flex: 1;
  padding: 1rem 1.25rem;
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

.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.platform-icon { font-size: 0.85rem; }

.pwd-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
  font-family: var(--vp-font-family-mono);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.meta-icon { font-size: 0.75rem; }

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
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
  transform: scale(1.03);
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
}

.btn-secondary:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

/* compact 模式 */
.resource-card.compact .card-body {
  padding: 0.75rem 1rem;
  gap: 0.35rem;
}

.resource-card.compact .card-title {
  font-size: 0.875rem;
  -webkit-line-clamp: 1;
}

.resource-card.compact .btn {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .card-body {
    padding: 0.85rem 1rem;
  }
  .card-actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
