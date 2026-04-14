<template>
  <div class="home">

    <!-- Masthead -->
    <header class="masthead">
      <div class="masthead-inner">
        <div class="brand">
          <span class="brand-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#111"/>
              <path d="M7 14h14M14 7v14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-name">PAN.NA</span>
            <span class="brand-tagline">免费网盘资源索引</span>
          </div>
        </div>
        <div class="masthead-meta">
          <span class="stat-pill">
            <strong>{{ totalResources.toLocaleString() }}</strong> 资源
          </span>
          <span class="stat-pill">
            <strong>{{ categoryList.length }}</strong> 分类
          </span>
        </div>
      </div>
    </header>

    <!-- Search bar -->
    <div class="search-section">
      <div class="search-bar">
        <svg class="si" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          class="search-input"
          placeholder="搜索资源名称..."
          @click="searchRef?.open()"
          readonly
        />
        <kbd class="kbd">/</kbd>
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
        <span class="plat-count">{{ platformCount[plat.value] || 0 }}</span>
      </button>
    </div>

    <!-- Category grid -->
    <section class="cat-section">
      <div class="section-head">
        <span class="section-title">全部分类</span>
        <span class="section-count">{{ filteredCategoryList.length }} 个</span>
      </div>
      <div class="cat-grid">
        <a
          v-for="cat in filteredCategoryList"
          :key="cat.id"
          :href="`/${cat.id}/`"
          class="cat-item"
        >
          <span class="cat-color-bar" :style="{ background: catColor(cat.id) }"></span>
          <div class="cat-body">
            <span class="cat-label">{{ cat.label }}</span>
            <span class="cat-n">{{ cat.count.toLocaleString() }} 条</span>
          </div>
          <svg class="cat-arrow" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- Recent section -->
    <section v-if="recentResources.length" class="recent-section">
      <div class="section-head">
        <span class="section-title">最近更新</span>
        <span class="section-count">{{ recentMonthStr }}</span>
      </div>
      <div class="recent-grid">
        <a
          v-for="(r, i) in recentResources.slice(0, showAll ? undefined : 8)"
          :key="i"
          :href="`/${r.category}/`"
          class="recent-item"
        >
          <span class="recent-platform-dot" :style="{ background: platColor(r.platform) }"></span>
          <div class="recent-info">
            <span class="recent-title">{{ r.title }}</span>
            <span class="recent-meta">{{ catLabel(r.category) }} · {{ r.month?.slice(0,4) }}/{{ r.month?.slice(4,6) }}</span>
          </div>
        </a>
      </div>
      <button v-if="recentResources.length > 8" class="expand-btn" @click="showAll = !showAll">
        {{ showAll ? '收起' : `展开全部 ${recentResources.length} 条` }}
      </button>
    </section>

    <!-- Global search -->
    <GlobalSearch ref="searchRef" />

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-inner">
        <span class="footer-brand">PAN.NA</span>
        <span class="footer-sep">/</span>
        <span class="footer-copy">免费网盘资源索引 &middot; 仅供学习交流</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GlobalSearch from './GlobalSearch.vue'

const searchRef = ref<InstanceType<typeof GlobalSearch> | null>(null)
const allResources = ref<any[]>([])
const activePlatform = ref('')
const showAll = ref(false)

const PLATFORMS = [
  { value: 'quark',  label: '夸克', color: '#4F46E5' },
  { value: 'baidu',  label: '百度', color: '#2563EB' },
  { value: 'aliyun', label: '阿里', color: '#0891B2' },
  { value: 'xunlei', label: '迅雷', color: '#D97706' },
]

const CAT_COLORS: Record<string, string> = {
  AIknowledge:        '#4F46E5',
  book:               '#059669',
  'chinese-traditional': '#DC2626',
  'cross-border':     '#0891B2',
  curriculum:         '#7C3AED',
  'edu-knowlege':     '#9333EA',
  games:              '#EA580C',
  healthy:            '#16A34A',
  movies:             '#DB2777',
  'self-media':       '#CA8A04',
  tools:              '#475569',
  auto:               '#6B7280',
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

const filteredCategoryList = computed(() => {
  let list = categoryList.value
  if (activePlatform.value) {
    const pc = platformCount.value
    const total = Object.values(pc).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
    const target = pc[activePlatform.value] || 0
    // Show all cats if no filter, or all cats (user can browse)
    return list
  }
  return list
})

const categoryList = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of allResources.value) counts[r.category] = (counts[r.category] || 0) + 1
  return Object.entries(CAT_LABELS)
    .map(([id, label]) => ({ id, label, count: counts[id] || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
})

const totalResources = computed(() => allResources.value.length)

const platformCount = computed(() => {
  const c: Record<string, number> = { quark: 0, baidu: 0, xunlei: 0, aliyun: 0, unknown: 0 }
  for (const r of allResources.value) c[r.platform] = (c[r.platform] || 0) + 1
  return c
})

const recentResources = computed(() =>
  [...allResources.value].sort((a, b) => b.month.localeCompare(a.month))
)

const recentMonthStr = computed(() => {
  const m = recentResources.value[0]?.month
  if (m?.length === 6) return `${m.slice(0, 4)}.${m.slice(4, 6)}`
  return ''
})

onMounted(async () => {
  try {
    const r = await fetch('/data/resources.json')
    allResources.value = await r.json()
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
/* ==================== RESET & BASE ==================== */
.home {
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-1: #111827;
  --text-2: #6B7280;
  --text-3: #9CA3AF;
  background: var(--bg);
  min-height: 100vh;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
}

/* ==================== MASTHEAD ==================== */
.masthead {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 100;
}

.masthead-inner {
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
  gap: 0.625rem;
}

.brand-mark { display: flex; align-items: center; flex-shrink: 0; }

.brand-text { display: flex; flex-direction: column; gap: 0; }

.brand-name {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-1);
  line-height: 1.1;
}

.brand-tagline {
  font-size: 0.7rem;
  color: var(--text-3);
  letter-spacing: 0.02em;
}

.masthead-meta { display: flex; gap: 0.5rem; align-items: center; }

.stat-pill {
  font-size: 0.78rem;
  color: var(--text-2);
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
}

.stat-pill strong { color: var(--text-1); font-weight: 700; }

/* ==================== SEARCH ==================== */
.search-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  cursor: text;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-bar:focus-within {
  border-color: #111;
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
  cursor: pointer;
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
}

/* ==================== PLATFORM FILTERS ==================== */
.quick-filters {
  max-width: 1100px;
  margin: 0.875rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.plat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.plat-chip:hover { border-color: var(--text-2); color: var(--text-1); }
.plat-chip.active { color: #fff; font-weight: 600; }

.plat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.plat-count { font-size: 0.7rem; opacity: 0.7; }

/* ==================== SECTIONS ==================== */
.cat-section,
.recent-section {
  max-width: 1100px;
  margin: 2.5rem auto 0;
  padding: 0 1.5rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
}

.section-count {
  font-size: 0.78rem;
  color: var(--text-3);
}

/* ==================== CATEGORY GRID ==================== */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.625rem;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  height: 60px;
}

.cat-item:hover {
  border-color: var(--text-2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.cat-color-bar { width: 4px; align-self: stretch; flex-shrink: 0; }

.cat-body {
  flex: 1;
  padding: 0.625rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.cat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-n { font-size: 0.72rem; color: var(--text-3); }

.cat-arrow {
  width: 14px;
  height: 14px;
  color: var(--text-3);
  flex-shrink: 0;
  margin-right: 0.75rem;
  transition: transform 0.15s, color 0.15s;
}

.cat-item:hover .cat-arrow {
  transform: translateX(2px);
  color: var(--text-1);
}

/* ==================== RECENT GRID ==================== */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  text-decoration: none;
  transition: border-color 0.15s;
}

.recent-item:hover { border-color: var(--text-2); }

.recent-platform-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.recent-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }

.recent-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-meta { font-size: 0.7rem; color: var(--text-3); }

.expand-btn {
  margin-top: 0.875rem;
  display: block;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 0.8rem;
  color: var(--text-2);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
  text-align: center;
}

.expand-btn:hover { border-color: var(--text-2); color: var(--text-1); }

/* ==================== FOOTER ==================== */
.site-footer {
  margin-top: 4rem;
  border-top: 1px solid var(--border);
  padding: 1.5rem;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-brand {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-1);
}

.footer-sep { color: var(--border); font-size: 0.75rem; }
.footer-copy { font-size: 0.75rem; color: var(--text-3); }

/* ==================== MOBILE ==================== */
@media (max-width: 640px) {
  .masthead-meta { display: none; }
  .search-section { padding: 1.25rem 1rem 0; }
  .quick-filters { padding: 0 1rem; }
  .cat-section, .recent-section { padding: 0 1rem; margin-top: 2rem; }
  .cat-grid { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .recent-grid { grid-template-columns: 1fr; }
  .site-footer { padding: 1.25rem 1rem; }
}
</style>
