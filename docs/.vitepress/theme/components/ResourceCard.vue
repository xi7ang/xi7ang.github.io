<template>
  <div class="card" :class="`plat-${resource.platform}`">
    <div class="card-left-bar"></div>
    <div class="card-body">
      <div class="card-top">
        <span class="plat-tag" :style="{ color: platColor, borderColor: platColor + '33', background: platColor + '11' }">
          {{ platLabel }}
        </span>
        <span v-if="resource.pwd" class="pwd-label">取码 {{ resource.pwd }}</span>
      </div>
      <h3 class="card-title" :title="resource.title">{{ resource.title }}</h3>
      <div class="card-footer">
        <span class="card-meta">{{ catLabel }} · {{ monthStr }}</span>
        <div class="card-actions">
          <button class="btn-copy" @click="copy">
            <svg viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            {{ copied ? '已复制' : '复制' }}
          </button>
          <a v-if="resource.url" :href="resource.url" target="_blank" rel="noopener" class="btn-jump">
            跳转
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Resource {
  title: string; url: string | null; pwd: string | null
  platform: string; category: string; month: string
}

const props = defineProps<{ resource: Resource }>()
const copied = ref(false)

const PLATFORMS: Record<string, { label: string; color: string }> = {
  quark:   { label: '夸克', color: '#4F46E5' },
  baidu:   { label: '百度', color: '#2563EB' },
  xunlei:  { label: '迅雷', color: '#D97706' },
  aliyun:  { label: '阿里', color: '#0891B2' },
  unknown: { label: '其他', color: '#6B7280' },
}

const CAT_LABELS: Record<string, string> = {
  AIknowledge: 'AI', book: '书籍', 'chinese-traditional': '文化', 'cross-border': '跨境',
  curriculum: '课程', 'edu-knowlege': '教育', games: '游戏', healthy: '健康',
  movies: '影视', 'self-media': '自媒体', tools: '工具', auto: '自动化',
}

const platColor = computed(() => PLATFORMS[props.resource.platform]?.color || '#6B7280')
const platLabel = computed(() => PLATFORMS[props.resource.platform]?.label || '其他')
const catLabel = computed(() => CAT_LABELS[props.resource.category] || props.resource.category)
const monthStr = computed(() => {
  const m = props.resource.month
  return m?.length === 6 ? `${m.slice(0, 4)}.${m.slice(4, 6)}` : m || ''
})

async function copy() {
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
    document.body.appendChild(ta); ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.card {
  display: flex;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.card-left-bar { width: 3px; flex-shrink: 0; align-self: stretch; }
.plat-quark   .card-left-bar { background: #4F46E5; }
.plat-baidu   .card-left-bar { background: #2563EB; }
.plat-xunlei  .card-left-bar { background: #D97706; }
.plat-aliyun .card-left-bar { background: #0891B2; }
.plat-unknown .card-left-bar { background: #6B7280; }

.card-body {
  flex: 1;
  padding: 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plat-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid;
  letter-spacing: 0.03em;
}

.pwd-label {
  font-size: 0.68rem;
  color: #9CA3AF;
  font-family: 'SF Mono', 'Fira Mono', monospace;
}

.card-title {
  font-size: 0.825rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.card-meta {
  font-size: 0.7rem;
  color: #9CA3AF;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-copy, .btn-jump {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.12s;
  font-family: inherit;
  border: none;
}

.btn-copy {
  background: #F3F4F6;
  color: #374151;
}
.btn-copy:hover { background: #E5E7EB; }

.btn-jump {
  background: #111827;
  color: #fff;
}
.btn-jump:hover { background: #374151; }

.btn-copy svg, .btn-jump svg { width: 11px; height: 11px; }

@media (max-width: 640px) {
  .card-footer { flex-direction: column; align-items: flex-end; }
  .card-actions { width: 100%; justify-content: flex-end; }
}
</style>
