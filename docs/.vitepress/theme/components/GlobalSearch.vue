<template>
  <Teleport to="body">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <div class="modal" role="dialog">
        <!-- Input -->
        <div class="input-row">
          <svg class="si" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="搜索资源..."
            class="input"
            @keydown.escape="close"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="openSelected"
          />
          <button class="close-btn" @click="close">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Platform filters -->
        <div class="filters">
          <button
            v-for="p in PLATFORMS"
            :key="p.value"
            :class="['f-btn', { active: activePlatform === p.value }]"
            :style="activePlatform === p.value ? { background: p.color, borderColor: p.color } : {}"
            @click="activePlatform = activePlatform === p.value ? '' : p.value"
          >
            <span class="f-dot" :style="{ background: p.color }"></span>
            {{ p.label }}
          </button>
          <span class="f-sep">|</span>
          <button
            v-for="c in CATS"
            :key="c.value"
            :class="['f-btn', { active: activeCategory === c.value }]"
            @click="activeCategory = activeCategory === c.value ? '' : c.value"
          >{{ c.label }}</button>
        </div>

        <!-- Results -->
        <div class="results" ref="resultsEl">
          <div v-if="!query && !activePlatform && !activeCategory" class="hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> 移动</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>

          <div v-else-if="results.length === 0" class="no-results">
            <p>未找到「{{ query }}」相关资源</p>
          </div>

          <template v-else>
            <div class="results-meta">
              {{ results.length }} 条结果
            </div>
            <div
              v-for="(item, idx) in results"
              :key="item.id"
              :class="['result-item', { selected: idx === selectedIndex }]"
              @click="openItem(item)"
              @mouseenter="selectedIndex = idx"
            >
              <span class="r-dot" :style="{ background: platColor(item.platform) }"></span>
              <div class="r-info">
                <span class="r-title" v-html="highlight(item.title, query)"></span>
                <span class="r-meta">{{ item.categoryLabel }} · {{ item.platformLabel }}</span>
              </div>
              <button class="r-cat-btn" @click.stop="openCategory(item)">分类</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const PLATFORMS = [
  { value: 'quark',  label: '夸克', color: '#4F46E5' },
  { value: 'baidu',  label: '百度', color: '#2563EB' },
  { value: 'aliyun', label: '阿里', color: '#0891B2' },
  { value: 'xunlei', label: '迅雷', color: '#D97706' },
]

const CATS = [
  { value: 'games', label: '游戏' },
  { value: 'book', label: '书籍' },
  { value: 'movies', label: '影视' },
  { value: 'tools', label: '工具' },
  { value: 'curriculum', label: '课程' },
  { value: 'self-media', label: '自媒体' },
]

interface Item {
  id: string; title: string; category: string; categoryLabel: string
  platform: string; platformLabel: string; url: string; pwd: string
}

const isOpen = ref(false)
const query = ref('')
const searchIndex = ref<Item[]>([])
const results = ref<Item[]>([])
const selectedIndex = ref(0)
const activePlatform = ref('')
const activeCategory = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const resultsEl = ref<HTMLElement | null>(null)

function platColor(p: string) {
  return PLATFORMS.find(x => x.value === p)?.color || '#6B7280'
}

function doSearch() {
  if (!query.value.trim() && !activePlatform.value && !activeCategory.value) {
    results.value = []; return
  }
  const q = query.value.trim().toLowerCase()
  let list = searchIndex.value
  if (activePlatform.value) list = list.filter(i => i.platform === activePlatform.value)
  if (activeCategory.value) list = list.filter(i => i.category === activeCategory.value)
  if (q) list = list.filter(i =>
    i.title.toLowerCase().includes(q) || i.categoryLabel.toLowerCase().includes(q)
  )
  results.value = list.slice(0, 60)
  selectedIndex.value = 0
}

function move(dir: number) {
  const max = results.value.length - 1
  selectedIndex.value = Math.max(0, Math.min(max, selectedIndex.value + dir))
  nextTick(() => resultsEl.value?.querySelector('.selected')?.scrollIntoView({ block: 'nearest' }))
}

function openSelected() {
  const item = results.value[selectedIndex.value]
  if (item) openItem(item)
}

function openItem(item: Item) {
  if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  close()
}

function openCategory(item: Item) {
  window.location.href = `/${item.category}/`
  close()
}

function highlight(text: string, q: string): string {
  if (!q?.trim()) return text
  const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>')
}

function close() {
  isOpen.value = false; query.value = ''; results.value = []
  activePlatform.value = ''; activeCategory.value = ''; selectedIndex.value = 0
}

function open() {
  isOpen.value = true
  nextTick(() => inputEl.value?.focus())
  if (!searchIndex.value.length) loadIndex()
}

function loadIndex() {
  fetch('/data/search-index.json')
    .then(r => r.json())
    .then((data: Item[]) => { searchIndex.value = data })
    .catch(() => {})
}

function onKey(e: KeyboardEvent) {
  if (e.key === '/' && !isOpen.value && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
    e.preventDefault(); open()
  }
  if (e.key === 'Escape' && isOpen.value) close()
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

defineExpose({ open })
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
  backdrop-filter: blur(3px);
}

.modal {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Input row */
.input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.si { width: 18px; height: 18px; color: #9CA3AF; flex-shrink: 0; }

.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #111827;
  outline: none;
  font-family: inherit;
}

.input::placeholder { color: #9CA3AF; }

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  cursor: pointer;
  color: #6B7280;
  flex-shrink: 0;
  padding: 0;
  transition: all 0.12s;
}
.close-btn svg { width: 13px; height: 13px; }
.close-btn:hover { border-color: #111; color: #111; }

/* Filters */
.filters {
  display: flex;
  gap: 0.375rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #E5E7EB;
  flex-wrap: wrap;
  align-items: center;
}

.f-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  color: #6B7280;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
  white-space: nowrap;
}
.f-btn:hover { border-color: #111; color: #111; }
.f-btn.active { color: #fff; font-weight: 600; }

.f-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.f-sep { color: #E5E7EB; font-size: 0.9rem; padding: 0 0.1rem; }

/* Results */
.results {
  overflow-y: auto;
  flex: 1;
  max-height: 55vh;
}

.results::-webkit-scrollbar { width: 5px; }
.results::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }

.hint {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  padding: 2rem;
  font-size: 0.8rem;
  color: #9CA3AF;
}

kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: 'SF Mono', monospace;
  margin-right: 0.25rem;
}

.no-results {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.9rem;
}

.results-meta {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: #9CA3AF;
  border-bottom: 1px solid #F3F4F6;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #F9FAFB;
  cursor: pointer;
  transition: background 0.1s;
}
.result-item:last-child { border-bottom: none; }
.result-item:hover, .result-item.selected { background: #F9FAFB; }

.r-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.r-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }

.r-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.r-title :deep(mark) {
  background: rgba(255, 200, 0, 0.35);
  border-radius: 2px;
  padding: 0 1px;
}

.r-meta { font-size: 0.7rem; color: #9CA3AF; }

.r-cat-btn {
  padding: 0.2rem 0.5rem;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4F46E5;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.12s;
}
.r-cat-btn:hover { background: #EEF2FF; border-color: #4F46E5; }

/* Mobile */
@media (max-width: 640px) {
  .overlay { padding-top: 0; align-items: flex-end; }
  .modal { border-radius: 12px 12px 0 0; max-height: 92vh; }
}
</style>
