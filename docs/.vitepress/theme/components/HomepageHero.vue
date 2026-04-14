<template>
  <div class="home">

    <!-- Masthead -->
    <header class="masthead">
      <div class="mh-inner">
        <a href="/" class="brand">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#111"/>
            <path d="M7 14h14M14 7v14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="brand-name">PAN.NA</span>
        </a>
        <div class="mh-stats">
          <span><strong>{{ totalResources.toLocaleString() }}</strong> 资源</span>
          <span class="dot"></span>
          <span><strong>{{ categoryList.length }}</strong> 分类</span>
        </div>
      </div>
    </header>

    <!-- Search -->
    <div class="search-wrap">
      <div class="search-bar" :class="{ focused: searchFocused }">
        <svg class="si" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索资源名称..."
          class="search-input"
          @focus="searchFocused = true"
          @blur="onBlur"
          @keydown.escape="clearSearch"
        />
        <kbd v-if="!searchQuery" class="kbd">/</kbd>
      </div>

      <!-- Inline search dropdown -->
      <div v-if="searchQuery && searchFocused" class="search-dropdown">
        <div v-if="searchResults.length === 0" class="sd-empty">
          未找到「{{ searchQuery }}」相关资源
        </div>
        <div v-else class="sd-results">
          <div class="sd-meta">{{ searchResults.length }} 条结果</div>
          <div
            v-for="(item, idx) in searchResults"
            :key="item.id"
            :class="['sd-item', { selected: idx === searchSelected }]"
            @mousedown.prevent="openItem(item)"
            @mouseenter="searchSelected = idx"
          >
            <span class="sd-dot" :style="{ background: platColor(item.platform) }"></span>
            <div class="sd-info">
              <span class="sd-title" v-html="highlight(item.title, searchQuery)"></span>
              <span class="sd-meta">{{ item.categoryLabel }} · {{ item.platformLabel }}</span>
            </div>
            <a :href="`/${item.category}/`" class="sd-cat-btn" @click.stop>分类</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Platform quick filters -->
    <div class="quick-filters">
      <button
        v-for="plat in PLATFORMS"
        :key="plat.value"
        :class="['plat-chip', { active: activePlatform === plat.value }]"
        :style="activePlatform === plat.value ? { background: plat.color, borderColor: plat.color } : {}"
        @click="activePlatform = activePlatform === plat.value ? '' : plat.value"
      >
        <span class="plat-dot" :style="{ background: plat.color }"></span>
        {{ plat.label }}
        <span class="plat-c">{{ platformCount[plat.value] || 0 }}</span>
      </button>
    </div>

    <!-- Categories -->
    <section class="section">
      <div class="section-head">
        <span class="section-ttl">全部分类</span>
        <span class="section-sub">{{ filteredCatList.length }} 个分类</span>
      </div>
      <div class="cat-grid">
        <a
          v-for="cat in filteredCatList"
          :key="cat.id"
          :href="`/${cat.id}/`"
          class="cat-item"
        >
          <span class="cat-bar" :style="{ background: catColor(cat.id) }"></span>
          <span class="cat-label">{{ cat.label }}</span>
          <span class="cat-count">{{ cat.count.toLocaleString() }}</span>
          <svg class="cat-arrow" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- Recent -->
    <section class="section">
      <div class="section-head">
        <span class="section-ttl">最近更新</span>
        <span class="section-sub">{{ recentMonthStr }}</span>
      </div>
      <div class="recent-grid">
        <a
          v-for="(r, i) in displayRecent"
          :key="i"
          :href="`/${r.category}/`"
          class="recent-item"
        >
          <span class="r-dot" :style="{ background: platColor(r.platform) }"></span>
          <div class="r-info">
            <span class="r-title">{{ r.title }}</span>
            <span class="r-meta">{{ catLabel(r.category) }} · {{ r.month?.slice(0,4) }}.{{ r.month?.slice(4,6) }}</span>
          </div>
        </a>
      </div>
      <button v-if="recentResources.length > SHOW_LIMIT" class="expand-btn" @click="showAll = !showAll">
        {{ showAll ? '收起' : `展开全部 ${recentResources.length} 条` }}
      </button>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">PAN.NA</span>
        <div class="footer-links">
          <a href="https://devmini.space/blog" target="_blank" rel="noopener">博客</a>
          <span class="f-sep">/</span>
          <a href="/disclaimer">免责声明</a>
          <span class="f-sep">/</span>
          <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" rel="noopener">QQ群</a>
          <span class="f-sep">/</span>
          <a href="https://t.me/xi7ang" target="_blank" rel="noopener">Telegram</a>
        </div>
        <span class="footer-copy">Copyright &copy; 2025-present xi7ang &middot; 仅供学习交流</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const SHOW_LIMIT = 12

const allResources = ref<any[]>([])
const searchQuery = ref('')
const searchFocused = ref(false)
const searchSelected = ref(0)
const activePlatform = ref('')
const showAll = ref(false)

const PLATFORMS = [
  { value: 'quark',  label: '夸克', color: '#4F46E5' },
  { value: 'baidu',  label: '百度', color: '#2563EB' },
  { value: 'aliyun', label: '阿里', color: '#0891B2' },
  { value: 'xunlei', label: '迅雷', color: '#D97706' },
]

const CAT_COLORS: Record<string, string> = {
  AIknowledge: '#4F46E5', book: '#059669', 'chinese-traditional': '#DC2626',
  'cross-border': '#0891B2', curriculum: '#7C3AED', 'edu-knowlege': '#9333EA',
  games: '#EA580C', healthy: '#16A34A', movies: '#DB2777',
  'self-media': '#CA8A04', tools: '#475569', auto: '#6B7280',
}

const CAT_LABELS: Record<string, string> = {
  AIknowledge: 'AI知识', book: '书籍', 'chinese-traditional': '传统文化',
  'cross-border': '跨境', curriculum: '课程', 'edu-knowlege': '教育',
  games: '游戏', healthy: '健康', movies: '影视', 'self-media': '自媒体',
  tools: '工具', auto: '自动化',
}

function catColor(id: string) { return CAT_COLORS[id] || '#6B7280' }
function catLabel(id: string) { return CAT_LABELS[id] || id }
function platColor(p: string) { return PLATFORMS.find(x => x.value === p)?.color || '#6B7280' }

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allResources.value
    .filter(r => r.title.toLowerCase().includes(q))
    .slice(0, 20)
})

function highlight(text: string, q: string): string {
  if (!q?.trim()) return text
  const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>')
}

function openItem(item: any) {
  if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
  searchFocused.value = false
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
  searchFocused.value = false
}

function onBlur() {
  setTimeout(() => { searchFocused.value = false }, 150)
}

const platformCount = computed(() => {
  const c: Record<string, number> = {}
  for (const r of allResources.value) c[r.platform] = (c[r.platform] || 0) + 1
  return c
})

const categoryList = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of allResources.value) counts[r.category] = (counts[r.category] || 0) + 1
  return Object.entries(CAT_LABELS)
    .map(([id, label]) => ({ id, label, count: counts[id] || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
})

const filteredCatList = computed(() => categoryList.value)

const recentResources = computed(() =>
  [...allResources.value].sort((a, b) => b.month.localeCompare(a.month))
)

const displayRecent = computed(() =>
  showAll.value ? recentResources.value : recentResources.value.slice(0, SHOW_LIMIT)
)

const recentMonthStr = computed(() => {
  const m = recentResources.value[0]?.month
  return m?.length === 6 ? `${m.slice(0, 4)}.${m.slice(4, 6)}` : ''
})

const totalResources = computed(() => allResources.value.length)

// Global keyboard shortcut for search
function onKey(e: KeyboardEvent) {
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
    e.preventDefault()
    document.querySelector<HTMLInputElement>('.search-input')?.focus()
  }
  if (e.key === 'Escape' && searchFocused.value) {
    clearSearch()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', onKey)
  try {
    const r = await fetch('/data/resources.json')
    allResources.value = await r.json()
  } catch (e) { console.error(e) }
})

onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* ===== RESET ===== */
.home {
  --bg: #FAFAFA;
  --surface: #fff;
  --border: #E5E7EB;
  --text-1: #111827;
  --text-2: #6B7280;
  --text-3: #9CA3AF;
  background: var(--bg);
  min-height: 100vh;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ===== MASTHEAD ===== */
.masthead {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.mh-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.brand-name {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-1);
}

.mh-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-2);
}

.mh-stats strong { color: var(--text-1); font-weight: 700; }
.dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-3); }

/* ===== SEARCH ===== */
.search-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 0;
  position: relative;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-bar.focused {
  border-color: var(--text-1);
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.06);
}

.si { width: 18px; height: 18px; color: var(--text-3); flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: var(--text-1);
  outline: none;
  font-family: inherit;
}
.search-input::placeholder { color: var(--text-3); }

.kbd {
  padding: 0.2rem 0.45rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 0.72rem;
  color: var(--text-3);
  font-family: 'SF Mono', monospace;
  flex-shrink: 0;
}

/* Search dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 1.5rem;
  right: 1.5rem;
  max-width: 1100px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 200;
  overflow: hidden;
}

.sd-empty {
  padding: 1.25rem 1rem;
  font-size: 0.875rem;
  color: var(--text-3);
  text-align: center;
}

.sd-results { max-height: 400px; overflow-y: auto; }
.sd-results::-webkit-scrollbar { width: 5px; }
.sd-results::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.sd-meta {
  padding: 0.5rem 0.875rem;
  font-size: 0.72rem;
  color: var(--text-3);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.sd-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.1s;
}
.sd-item:last-child { border-bottom: none; }
.sd-item:hover, .sd-item.selected { background: var(--bg); }

.sd-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.sd-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }

.sd-title {
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sd-title :deep(mark) {
  background: rgba(255,200,0,0.3);
  border-radius: 2px;
  padding: 0 1px;
}

.sd-meta {
  display: block;
  font-size: 0.7rem;
  color: var(--text-3);
  background: none;
  border: none;
  padding: 0;
}

.sd-cat-btn {
  padding: 0.18rem 0.45rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #4F46E5;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.1s;
}
.sd-cat-btn:hover { background: #EEF2FF; }

/* ===== QUICK FILTERS ===== */
.quick-filters {
  max-width: 1100px;
  margin: 0.75rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.plat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.7rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}
.plat-chip:hover { border-color: var(--text-2); color: var(--text-1); }
.plat-chip.active { color: #fff; font-weight: 600; }
.plat-dot { width: 8px; height: 8px; border-radius: 50%; }
.plat-c { font-size: 0.7rem; opacity: 0.7; }

/* ===== SECTIONS ===== */
.section {
  max-width: 1100px;
  margin: 2.5rem auto 0;
  padding: 0 1.5rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.875rem;
}

.section-ttl {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
}

.section-sub { font-size: 0.78rem; color: var(--text-3); }

/* ===== CAT GRID ===== */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.12s, box-shadow 0.12s;
  overflow: hidden;
}
.cat-item:hover { border-color: var(--text-2); box-shadow: 0 1px 6px rgba(0,0,0,0.05); }

.cat-bar { width: 3px; height: 18px; border-radius: 2px; flex-shrink: 0; }

.cat-label {
  flex: 1;
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
}

.cat-count {
  font-size: 0.72rem;
  color: var(--text-3);
  flex-shrink: 0;
}

.cat-arrow {
  width: 13px;
  height: 13px;
  color: var(--text-3);
  flex-shrink: 0;
  transition: transform 0.12s;
}
.cat-item:hover .cat-arrow { transform: translateX(2px); }

/* ===== RECENT GRID ===== */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  text-decoration: none;
  transition: border-color 0.12s;
  overflow: hidden;
}
.recent-item:hover { border-color: var(--text-2); }

.r-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

.r-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }

.r-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.r-meta { font-size: 0.7rem; color: var(--text-3); }

.expand-btn {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 0.8rem;
  color: var(--text-2);
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  transition: border-color 0.12s;
}
.expand-btn:hover { border-color: var(--text-2); color: var(--text-1); }

/* ===== FOOTER ===== */
.footer {
  border-top: 1px solid var(--border);
  padding: 1.5rem;
  margin-top: 4rem;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.footer-brand {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-1);
}

.footer-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.78rem;
}

.footer-links a { color: var(--text-2); text-decoration: none; }
.footer-links a:hover { color: var(--text-1); }
.f-sep { color: var(--border); }

.footer-copy { font-size: 0.72rem; color: var(--text-3); }

/* ===== MOBILE ===== */
@media (max-width: 640px) {
  .mh-stats { display: none; }
  .search-wrap { padding: 1.25rem 1rem 0; }
  .search-dropdown { left: 1rem; right: 1rem; }
  .quick-filters { padding: 0 1rem; }
  .section { padding: 0 1rem; margin-top: 2rem; }
  .cat-grid { grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .recent-grid { grid-template-columns: 1fr; }
  .footer { padding: 1.25rem 1rem; }
}
</style>
