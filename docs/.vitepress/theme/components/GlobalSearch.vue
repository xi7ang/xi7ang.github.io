<template>
  <Teleport to="body">
    <div v-if="isOpen" class="search-overlay" @click.self="close">
      <div class="search-modal" role="dialog" aria-modal="true">
        <!-- 搜索框 -->
        <div class="search-header">
          <span class="search-icon-lg">🔍</span>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="搜索资源名称、分类、平台..."
            class="search-input-lg"
            @keydown.escape="close"
            @keydown.down.prevent="moveSelection(1)"
            @keydown.up.prevent="moveSelection(-1)"
            @keydown.enter.prevent="openSelected"
          />
          <button class="close-btn" @click="close">✕</button>
        </div>

        <!-- 快捷筛选 -->
        <div class="filter-row">
          <button
            v-for="plat in PLATFORM_FILTERS"
            :key="plat.value"
            :class="['filter-chip', { active: activePlatform === plat.value }]"
            @click="togglePlatform(plat.value)"
          >
            {{ plat.icon }} {{ plat.label }}
          </button>
          <span class="filter-divider">|</span>
          <button
            v-for="cat in CATEGORY_FILTERS"
            :key="cat.value"
            :class="['filter-chip', { active: activeCategory === cat.value }]"
            @click="toggleCategory(cat.value)"
          >
            {{ cat.icon }} {{ cat.label }}
          </button>
        </div>

        <!-- 结果 -->
        <div class="search-results" ref="resultsEl">
          <div v-if="query.length < 1 && !activePlatform && !activeCategory" class="search-hint">
            <p>输入关键词搜索，或使用快捷键筛选</p>
            <div class="shortcut-hints">
              <span><kbd>/</kbd> 快速呼出</span>
              <span><kbd>↑↓</kbd> 移动选择</span>
              <span><kbd>Enter</kbd> 打开</span>
              <span><kbd>Esc</kbd> 关闭</span>
            </div>
          </div>

          <div v-else-if="results.length === 0" class="no-results">
            <div class="no-results-icon">🔍</div>
            <p>未找到"{{ query }}"相关资源</p>
          </div>

          <template v-else>
            <div class="results-meta">
              找到 {{ filteredResults.length }} 条结果
              <span v-if="activePlatform || activeCategory">（已应用筛选）</span>
            </div>
            <div
              v-for="(item, idx) in filteredResults"
              :key="item.id"
              :class="['result-item', { selected: selectedIndex === idx }]"
              @click="openItem(item)"
              @mouseenter="selectedIndex = idx"
            >
              <div class="result-left">
                <span class="result-platform-icon">{{ platformIcon(item.platform) }}</span>
                <div class="result-info">
                  <div class="result-title">{{ item.title }}</div>
                  <div class="result-meta">
                    <span class="meta-chip">{{ item.categoryLabel }}</span>
                    <span class="meta-chip">{{ item.platformLabel }}</span>
                    <span class="meta-chip">{{ item.monthLabel }}</span>
                    <span v-if="item.pwd" class="meta-chip pwd">🔑 {{ item.pwd }}</span>
                  </div>
                </div>
              </div>
              <div class="result-arrow">›</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const PLATFORM_FILTERS = [
  { value: 'quark',  label: '夸克', icon: '🏐' },
  { value: 'baidu',  label: '百度', icon: '📦' },
  { value: 'aliyun', label: '阿里', icon: '☁️' },
  { value: 'xunlei', label: '迅雷', icon: '⚡' },
]

const CATEGORY_FILTERS = [
  { value: 'games',   label: '游戏',   icon: '🎮' },
  { value: 'book',    label: '书籍',   icon: '📖' },
  { value: 'movies',  label: '影视',   icon: '🎬' },
  { value: 'tools',   label: '工具',   icon: '🔧' },
  { value: 'curriculum', label: '课程', icon: '📝' },
  { value: 'self-media', label: '自媒体', icon: '📱' },
]

interface SearchItem {
  id: string
  title: string
  category: string
  categoryLabel: string
  platform: string
  platformLabel: string
  month: string
  monthLabel: string
  url: string
  pwd: string
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

// 简易 fuzzy search（不用 Fuse.js 依赖，纯字符串匹配）
function fuzzyMatch(text: string, q: string): boolean {
  if (!q) return true
  const t = text.toLowerCase()
  const qs = q.toLowerCase().split('')
  return qs.every(ch => t.includes(ch))
}

function doSearch() {
  const q = query.value.trim()
  if (!q && !activePlatform.value && !activeCategory.value) {
    results.value = []
    return
  }
  const ql = q.toLowerCase()
  let list = searchIndex.value

  if (activePlatform.value) {
    list = list.filter(i => i.platform === activePlatform.value)
  }
  if (activeCategory.value) {
    list = list.filter(i => i.category === activeCategory.value)
  }

  if (ql) {
    list = list.filter(i =>
      i.title.toLowerCase().includes(ql) ||
      i.categoryLabel.toLowerCase().includes(ql) ||
      i.platformLabel.toLowerCase().includes(ql)
    )
  }

  results.value = list.slice(0, 60)
  selectedIndex.value = 0
}

const filteredResults = computed(() => results.value)

watch(query, doSearch)
watch([activePlatform, activeCategory], doSearch)

function togglePlatform(v: string) {
  activePlatform.value = activePlatform.value === v ? '' : v
}

function toggleCategory(v: string) {
  activeCategory.value = activeCategory.value === v ? '' : v
}

function moveSelection(dir: number) {
  const max = filteredResults.value.length - 1
  selectedIndex.value = Math.max(0, Math.min(max, selectedIndex.value + dir))
  // scroll into view
  nextTick(() => {
    const el = resultsEl.value?.querySelector('.result-item.selected')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function openSelected() {
  const item = filteredResults.value[selectedIndex.value]
  if (item) openItem(item)
}

function openItem(item: SearchItem) {
  if (item.url) {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }
  close()
}

function close() {
  isOpen.value = false
  query.value = ''
  results.value = []
  activePlatform.value = ''
  activeCategory.value = ''
  selectedIndex.value = 0
}

function open() {
  isOpen.value = true
  nextTick(() => inputEl.value?.focus())
  loadIndex()
}

function loadIndex() {
  if (searchIndex.value.length) return
  Promise.resolve()
    .then(() => window.__SEARCH_INDEX__ || fetch('/search-index.json').then(r => r.json()))
    .then((data: SearchItem[]) => {
      searchIndex.value = data
    })
    .catch(() => {})
}

function platformIcon(p: string) {
  return PLATFORM_FILTERS.find(x => x.value === p)?.icon ?? '🔗'
}

// 全局快捷键
function onKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !isOpen.value && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
    e.preventDefault()
    open()
  }
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

// 暴露给外部调用
defineExpose({ open })
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
  backdrop-filter: blur(4px);
}

.search-modal {
  width: 100%;
  max-width: 680px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* 头部搜索框 */
.search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.search-icon-lg { font-size: 1.4rem; flex-shrink: 0; }

.search-input-lg {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  outline: none;
  min-width: 0;
}

.search-input-lg::placeholder { color: var(--vp-c-text-3); }

.close-btn {
  padding: 0.25rem 0.6rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  flex-shrink: 0;
}

/* 筛选区 */
.filter-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-border);
}

.filter-chip {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-chip.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.filter-divider {
  color: var(--vp-c-border);
  font-size: 0.9rem;
  padding: 0 0.2rem;
}

/* 结果区 */
.search-results {
  overflow-y: auto;
  flex: 1;
  max-height: 55vh;
}

.search-results::-webkit-scrollbar { width: 6px; }
.search-results::-webkit-scrollbar-thumb { background: var(--vp-c-border); border-radius: 3px; }

.search-hint {
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--vp-c-text-3);
}

.search-hint p { margin: 0 0 1rem 0; }

.shortcut-hints {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.shortcut-hints span { display: flex; align-items: center; gap: 0.3rem; }

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
}

.no-results-icon { font-size: 2.5rem; }
.no-results p { margin: 0; font-size: 1rem; }

.results-meta {
  padding: 0.5rem 1.25rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  border-bottom: 1px solid var(--vp-c-border-soft);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid var(--vp-c-border-soft);
  transition: background 0.1s;
}

.result-item:last-child { border-bottom: none; }

.result-item:hover,
.result-item.selected {
  background: var(--vp-c-brand-soft);
}

.result-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.result-platform-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 0.1rem; }

.result-info { flex: 1; min-width: 0; }

.result-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.3rem;
}

.result-meta {
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
  border-radius: 10px;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.meta-chip.pwd {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.result-arrow {
  font-size: 1.4rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .search-modal { border-radius: 0; max-height: 100vh; }
  .search-overlay { padding-top: 0; align-items: flex-end; }
  .filter-row { overflow-x: auto; flex-wrap: nowrap; }
  .shortcut-hints { gap: 0.75rem; }
}
</style>
