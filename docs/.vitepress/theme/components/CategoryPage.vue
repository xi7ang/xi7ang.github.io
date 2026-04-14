<template>
  <div class="cat-page">

    <!-- Cat header -->
    <div class="cat-header">
      <div class="cat-header-inner">
        <div class="cat-title-row">
          <span class="cat-bar" :style="{ background: catColor }"></span>
          <h1 class="cat-name">{{ catLabel }}</h1>
          <span class="cat-count-badge">{{ filteredCount }} 条资源</span>
        </div>
        <p v-if="catDesc" class="cat-desc">{{ catDesc }}</p>
      </div>
    </div>

    <div class="cat-layout">
      <!-- Sidebar filters -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <span class="sidebar-label">月份</span>
          <button
            :class="['s-btn', { active: !activeMonth }]"
            @click="setMonth(null)"
          >
            全部 <span class="s-count">{{ totalCount }}</span>
          </button>
          <button
            v-for="item in monthList"
            :key="item.month"
            :class="['s-btn', { active: activeMonth === item.month }]"
            @click="setMonth(item.month)"
          >
            {{ formatMonth(item.month) }}
            <span class="s-count">{{ item.count }}</span>
          </button>
        </div>

        <div class="sidebar-section">
          <span class="sidebar-label">平台</span>
          <button
            :class="['s-btn', { active: !activePlatform }]"
            @click="activePlatform = ''"
          >
            全部
          </button>
          <button
            v-for="p in PLATFORMS"
            :key="p.value"
            :class="['s-btn plat', { active: activePlatform === p.value }]"
            :style="activePlatform === p.value ? { borderLeftColor: p.color, color: p.color } : {}"
            @click="activePlatform = activePlatform === p.value ? '' : p.value"
          >
            <span class="s-dot" :style="{ background: p.color }"></span>
            {{ p.label }}
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="cat-main">
        <!-- Search -->
        <div class="search-row">
          <div class="search-bar">
            <svg class="si" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              v-model="localSearch"
              class="search-input"
              :placeholder="`在「${catLabel}」中搜索...`"
            />
            <button v-if="localSearch" class="clear-btn" @click="localSearch = ''">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <select v-model="sortBy" class="sort-sel">
            <option value="default">默认排序</option>
            <option value="title">名称排序</option>
          </select>
        </div>

        <!-- Results bar -->
        <div class="results-bar">
          <span v-if="localSearch || activeMonth || activePlatform">
            筛选结果: {{ filteredCount }} 条
          </span>
          <span v-else>共 {{ filteredCount }} 条</span>
          <button v-if="localSearch || activeMonth || activePlatform" class="reset-btn" @click="reset">
            重置
          </button>
        </div>

        <!-- Grid -->
        <div v-if="pageResources.length" class="res-grid">
          <ResourceCard v-for="(r, i) in pageResources" :key="i" :resource="r" />
        </div>

        <!-- Empty -->
        <div v-else class="empty">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="8" y="12" width="32" height="28" rx="3" stroke="#D1D5DB" stroke-width="2"/>
            <path d="M16 20h16M16 28h8" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>未找到匹配资源</p>
          <button class="reset-btn" @click="reset">重置筛选</button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="currentPage === 1" @click="currentPage--">
            <svg viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            上一页
          </button>
          <div class="pg-nums">
            <button
              v-for="p in visiblePages"
              :key="String(p)"
              :class="['pg-num', { active: p === currentPage, ellipsis: p === '...' }]"
              :disabled="p === '...'"
              @click="p !== '...' && (currentPage = Number(p))"
            >{{ p }}</button>
          </div>
          <button class="pg-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            下一页
            <svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ResourceCard from './ResourceCard.vue'

const PAGE_SIZE = 24

const props = defineProps<{ category: string }>()

const allResources = ref<any[]>([])
const activeMonth = ref<string | null>(null)
const activePlatform = ref('')
const localSearch = ref('')
const currentPage = ref(1)
const sortBy = ref('default')

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

const CAT_META: Record<string, any> = {
  AIknowledge:        { label: 'AI知识',        desc: '人工智能、机器学习、提示词工程' },
  book:               { label: '书籍资料',        desc: '电子书、技术文档、专业教材' },
  'chinese-traditional': { label: '传统文化',   desc: '中医、古典文化等国学内容' },
  'cross-border':     { label: '跨境电商',        desc: '亚马逊、TikTok、外贸实操' },
  curriculum:         { label: '课程资料',        desc: '得到、网上流行课程' },
  'edu-knowlege':     { label: '教育知识',         desc: '全阶段教育材料、考试资料' },
  games:              { label: '游戏资源',         desc: 'PC游戏、手游、MOD、修改器' },
  healthy:            { label: '健康养生',          desc: '健身、营养、心理健康' },
  movies:             { label: '影视媒体',         desc: '高清电影、纪录片、音乐资源' },
  'self-media':       { label: '自媒体',            desc: '流量获取、内容创作、变现策略' },
  tools:              { label: '工具合集',          desc: '软件工具、浏览器插件、开发工具' },
  auto:               { label: '自动化工具',        desc: '自动化脚本和工具' },
}

const catColor = computed(() => CAT_COLORS[props.category] || '#6B7280')
const catLabel = computed(() => CAT_META[props.category]?.label || props.category)
const catDesc  = computed(() => CAT_META[props.category]?.desc || '')

const monthList = computed(() => {
  const counts: Record<string, number> = {}
  const catOnly = allResources.value.filter(r => r.category === props.category)
  for (const r of catOnly) {
    if (r.month) counts[r.month] = (counts[r.month] || 0) + 1
  }
  return Object.entries(counts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month))
})

const totalCount = computed(() =>
  allResources.value.filter(r => r.category === props.category).length
)

const filteredResources = computed(() => {
  let list = allResources.value.filter(r => r.category === props.category)
  if (activeMonth.value) list = list.filter(r => r.month === activeMonth.value)
  if (activePlatform.value) list = list.filter(r => r.platform === activePlatform.value)
  if (localSearch.value.trim()) {
    const q = localSearch.value.toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(q))
  }
  if (sortBy.value === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  return list
})

const filteredCount = computed(() => filteredResources.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCount.value / PAGE_SIZE)))

const pageResources = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredResources.value.slice(start, start + PAGE_SIZE)
})

const visiblePages = computed(() => {
  const tp = totalPages.value, cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => String(i + 1))
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
  if (cp < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

function formatMonth(m: string) {
  return m?.length === 6 ? `${m.slice(0, 4)}.${m.slice(4, 6)}` : m
}

function setMonth(m: string | null) {
  activeMonth.value = m
  currentPage.value = 1
  syncUrl(m)
}

function syncUrl(month: string | null) {
  const url = new URL(window.location.href)
  if (month) url.searchParams.set('month', month)
  else url.searchParams.delete('month')
  history.replaceState(null, '', url.toString())
}

function reset() {
  localSearch.value = ''; activeMonth.value = null; activePlatform.value = ''; currentPage.value = 1
  history.replaceState(null, '', window.location.pathname)
}

watch([localSearch, activeMonth, activePlatform], () => { currentPage.value = 1 })

onMounted(async () => {
  const month = new URLSearchParams(window.location.search).get('month')
  if (month) activeMonth.value = month
  try {
    const r = await fetch('/data/resources.json')
    allResources.value = await r.json()
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.cat-page {
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-1: #111827;
  --text-2: #6B7280;
  --text-3: #9CA3AF;
  background: var(--bg);
  min-height: 100vh;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Header */
.cat-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.cat-header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.cat-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}

.cat-bar { width: 4px; height: 24px; border-radius: 2px; flex-shrink: 0; }

.cat-name {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-1);
  margin: 0;
  letter-spacing: -0.01em;
}

.cat-count-badge {
  font-size: 0.78rem;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 0.15rem 0.5rem;
  border-radius: 5px;
}

.cat-desc {
  font-size: 0.85rem;
  color: var(--text-2);
  margin: 0;
  padding-left: calc(4px + 0.75rem);
}

/* Layout */
.cat-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: calc(57px + 1rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section { display: flex; flex-direction: column; gap: 0.25rem; }

.sidebar-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
  padding: 0 0.375rem;
  margin-bottom: 0.25rem;
}

.s-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.625rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
  text-align: left;
  gap: 0.5rem;
}

.s-btn:hover { background: var(--surface); border-color: var(--border); color: var(--text-1); }
.s-btn.active { background: var(--surface); border-color: var(--border); color: var(--text-1); font-weight: 600; }
.s-btn.plat { border-left: 2px solid transparent; padding-left: 0.5rem; }

.s-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

.s-count {
  font-size: 0.68rem;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 0.05rem 0.35rem;
  border-radius: 10px;
  flex-shrink: 0;
}

/* Main */
.cat-main { display: flex; flex-direction: column; gap: 1rem; }

/* Search */
.search-row { display: flex; gap: 0.625rem; }

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.si { position: absolute; left: 0.75rem; width: 15px; height: 15px; color: var(--text-3); pointer-events: none; }

.search-input {
  width: 100%;
  padding: 0.6rem 2.25rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--surface);
  color: var(--text-1);
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #111; }
.search-input::placeholder { color: var(--text-3); }

.clear-btn {
  position: absolute;
  right: 0.625rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  padding: 0.2rem;
  display: flex;
  align-items: center;
}
.clear-btn svg { width: 13px; height: 13px; }

.sort-sel {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  background: var(--surface);
  color: var(--text-1);
  cursor: pointer;
  outline: none;
  font-family: inherit;
  white-space: nowrap;
  transition: border-color 0.15s;
}
.sort-sel:focus { border-color: #111; }

/* Results bar */
.results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-3);
  padding: 0 0.25rem;
}

.reset-btn {
  background: none;
  border: none;
  color: #4F46E5;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

/* Grid */
.res-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.625rem;
}

/* Empty */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  gap: 0.75rem;
  color: var(--text-3);
}
.empty svg { width: 48px; height: 48px; opacity: 0.4; }
.empty p { font-size: 0.95rem; margin: 0; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding-top: 0.5rem;
  flex-wrap: wrap;
}

.pg-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  font-size: 0.82rem;
  color: var(--text-2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
}
.pg-btn:hover:not(:disabled) { border-color: #111; color: var(--text-1); }
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pg-btn svg { width: 13px; height: 13px; }

.pg-nums { display: flex; gap: 0.3rem; }

.pg-num {
  min-width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  font-size: 0.82rem;
  color: var(--text-2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
}
.pg-num:hover:not(:disabled) { border-color: #111; color: var(--text-1); }
.pg-num.active { background: #111; border-color: #111; color: #fff; }
.pg-num.ellipsis { border: none; background: transparent; cursor: default; }

/* Mobile */
@media (max-width: 768px) {
  .cat-layout { grid-template-columns: 1fr; padding: 1rem; }
  .sidebar {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 1rem;
  }
  .sidebar-section { flex-direction: row; align-items: center; flex-wrap: nowrap; min-width: max-content; }
  .sidebar-label { flex-shrink: 0; }
  .res-grid { grid-template-columns: 1fr; }
  .search-row { flex-direction: column; }
}
</style>
