<template>
  <Teleport to="body">
    <div v-if="isOpen" class="search-overlay" @click.self="close">
      <div class="search-modal" role="dialog" aria-modal="true">
        <!-- 搜索框 -->
        <div class="search-header">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="搜索资源名称、分类、平台..."
            class="search-input"
            @keydown.escape="close"
            @keydown.down.prevent="moveSelection(1)"
            @keydown.up.prevent="moveSelection(-1)"
            @keydown.enter.prevent="openSelected"
          />
          <button class="close-btn" @click="close">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 快捷筛选 -->
        <div class="filter-row">
          <button
            v-for="plat in PLATFORMS"
            :key="plat.value"
            :class="['filter-chip', { active: activePlatform === plat.value }]"
            @click="togglePlatform(plat.value)"
          >
            <span class="chip-dot" :style="{ background: plat.color }"></span>
            {{ plat.label }}
          </button>
          <span class="filter-sep">|</span>
          <button
            v-for="cat in CATEGORIES"
            :key="cat.value"
            :class="['filter-chip', { active: activeCategory === cat.value }]"
            @click="toggleCategory(cat.value)"
          >
            <span class="chip-dot" :style="{ background: cat.color }"></span>
            {{ cat.label }}
          </button>
        </div>

        <!-- 结果区 -->
        <div class="results" ref="resultsEl">
          <div v-if="!query && !activePlatform && !activeCategory" class="search-hint">
            <div class="hint-shortcuts">
              <span><kbd>/</kbd> 快速搜索</span>
              <span><kbd>↑</kbd><kbd>↓</kbd> 移动</span>
              <span><kbd>Enter</kbd> 打开</span>
              <span><kbd>Esc</kbd> 关闭</span>
            </div>
          </div>

          <div v-else-if="results.length === 0" class="no-results">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
            </svg>
            <p>未找到「{{ query }}」相关资源</p>
          </div>

          <template v-else>
            <div class="results-meta">
              找到 {{ results.length }} 条结果
            </div>
            <div
              v-for="(item, idx) in results"
              :key="item.id"
              :class="['result-item', { selected: selectedIndex === idx }]"
              @click="openItem(item)"
              @mouseenter="selectedIndex = idx"
            >
              <div class="result-left">
                <span class="result-platform-dot" :style="{ background: platformColor(item.platform) }"></span>
                <div class="result-info">
                  <div class="result-title" v-html="highlight(item.title, query)"></div>
                  <div class="result-tags">
                    <span class="result-tag">{{ item.categoryLabel }}</span>
                    <span class="result-tag">{{ item.platformLabel }}</span>
                    <span v-if="item.pwd" class="result-tag pwd">取码: {{ item.pwd }}</span>
                  </div>
                </div>
              </div>
              <button class="cat-btn" @click.stop="openCategory(item)">查看分类</button>
              <svg class="result-arrow" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
  { value: 'quark',  label: '夸克', color: '#7c3aed' },
  { value: 'baidu',  label: '百度', color: '#1d4ed8' },
  { value: 'aliyun', label: '阿里', color: '#0891b2' },
  { value: 'xunlei', label: '迅雷', color: '#d97706' },
]

const CATEGORIES = [
  { value: 'games',        label: '游戏',   color: '#ea580c' },
  { value: 'book',         label: '书籍',   color: '#2563eb' },
  { value: 'movies',       label: '影视',   color: '#db2777' },
  { value: 'tools',        label: '工具',   color: '#475569' },
  { value: 'curriculum',   label: '课程',   color: '#16a34a' },
  { value: 'self-media',   label: '自媒体', color: '#ca8a04' },
]

interface SearchItem {
  id: string; title: string; category: string; categoryLabel: string
  platform: string; platformLabel: string; month: string; monthLabel: string
  url: string; pwd: string
}

const isOpen = ref(false)
const query = ref('')
const searchIndex = ref<SearchItem[]>([])
const results = ref<SearchItem[]>([])
const selectedIndex = ref(0)
const activePlatform = ref('')
const activeCategory = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const resultsEl = ref<HTMLElement | null>(null)

function platformColor(p: string) {
  return PLATFORMS.find(x => x.value === p)?.color ?? '#64748b'
}

function doSearch() {
  const q = query.value.trim()
  if (!q && !activePlatform.value && !activeCategory.value) { results.value = []; return }

  let list = searchIndex.value
  if (activePlatform.value) list = list.filter(i => i.platform === activePlatform.value)
  if (activeCategory.value) list = list.filter(i => i.category === activeCategory.value)
  if (q) {
    const ql = q.toLowerCase()
    list = list.filter(i =>
      i.title.toLowerCase().includes(ql) ||
      i.categoryLabel.toLowerCase().includes(ql) ||
      i.platformLabel.toLowerCase().includes(ql)
    )
  }
  results.value = list.slice(0, 60)
  selectedIndex.value = 0
}

function togglePlatform(v: string) {
  activePlatform.value = activePlatform.value === v ? '' : v
  doSearch()
}
function toggleCategory(v: string) {
  activeCategory.value = activeCategory.value === v ? '' : v
  doSearch()
}

function moveSelection(dir: number) {
  const max = results.value.length - 1
  selectedIndex.value = Math.max(0, Math.min(max, selectedIndex.value + dir))
  nextTick(() => resultsEl.value?.querySelector('.result-item.selected')?.scrollIntoView({ block: 'nearest' }))
}

function openSelected() {
  const item = results.value[selectedIndex.value]
  if (item) openItem(item)
}

function openItem(item: SearchItem) {
  if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
}

function openCategory(item: SearchItem) {
  window.location.href = `/${item.category}/`
  close()
}

function highlight(text: string, q: string): string {
  if (!q || !q.trim()) return text
  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`)
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
    .then((data: SearchItem[]) => { searchIndex.value = data })
    .catch(() => {})
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !isOpen.value && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
    e.preventDefault(); open()
  }
  if (e.key === 'Escape' && isOpen.value) close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

defineExpose({ open })
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 100%;
  max-width: 640px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* 搜索框 */
.search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.search-icon { width: 18px; height: 18px; color: var(--vp-c-text-3); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--vp-c-text-1);
  outline: none;
  min-width: 0;
}
.search-input::placeholder { color: var(--vp-c-text-3); }

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s;
}
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }

/* 筛选行 */
.filter-row {
  display: flex;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-bottom: 1px solid var(--vp-c-border);
  flex-wrap: wrap;
  align-items: center;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.filter-chip:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.filter-chip.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-sep { color: var(--vp-c-border); font-size: 0.9rem; padding: 0 0.1rem; }

/* 结果 */
.results {
  overflow-y: auto;
  flex: 1;
  max-height: 55vh;
}
.results::-webkit-scrollbar { width: 5px; }
.results::-webkit-scrollbar-thumb { background: var(--vp-c-border); border-radius: 3px; }

.search-hint { padding: 2rem 1.5rem; text-align: center; }

.hint-shortcuts {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.4rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.72rem;
  font-family: monospace;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  color: var(--vp-c-text-3);
  gap: 0.75rem;
  text-align: center;
}
.no-results svg { width: 48px; height: 48px; opacity: 0.5; }
.no-results p { font-size: 0.95rem; margin: 0; }

.results-meta {
  padding: 0.5rem 1.1rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  border-bottom: 1px solid var(--vp-c-border-soft);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--vp-c-border-soft);
  transition: background 0.1s;
}
.result-item:last-child { border-bottom: none; }
.result-item:hover, .result-item.selected { background: var(--vp-c-brand-soft); }

.result-left {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  flex: 1;
  min-width: 0;
}

.result-platform-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.result-info { flex: 1; min-width: 0; }

.result-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.3rem;
}

.result-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.result-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.08rem 0.4rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

.result-tag.pwd { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }

.result-arrow { width: 16px; height: 16px; color: var(--vp-c-text-3); flex-shrink: 0; }

.result-title :deep(mark) {
  background: rgba(255, 200, 0, 0.3);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}

.cat-btn {
  padding: 0.2rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}
.cat-btn:hover { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); }

/* Mobile */
@media (max-width: 640px) {
  .search-overlay { padding-top: 0; align-items: flex-end; }
  .search-modal { border-radius: 14px 14px 0 0; max-height: 92vh; }
  .filter-row { overflow-x: auto; flex-wrap: nowrap; }
}
</style>
