<template>
  <div class="homepage-hero">

    <!-- Hero 搜索区 -->
    <div class="hero-search">
      <h1 class="hero-title">免费网盘资源导航</h1>
      <p class="hero-sub">收录夸克、百度、阿里、迅雷四大网盘平台优质资源，持续更新</p>
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          class="search-input"
          placeholder="搜索资源名称、分类..."
          @click="searchRef?.open()"
          readonly
        />
        <kbd class="search-kbd">/</kbd>
      </div>
    </div>

    <!-- 全局搜索 -->
    <GlobalSearch ref="searchRef" />

    <!-- 分类卡片 -->
    <div class="section">
      <div class="section-header">
        <span class="section-label">资源分类</span>
        <span class="section-count">{{ categoryList.length }} 个分类 · {{ totalResources.toLocaleString() }} 条资源</span>
      </div>
      <div class="category-grid">
        <a
          v-for="cat in categoryList"
          :key="cat.id"
          :href="`/${cat.id}/`"
          class="cat-card"
        >
          <span class="cat-dot" :style="{ background: catColor(cat.id) }"></span>
          <div class="cat-info">
            <span class="cat-name">{{ cat.label }}</span>
            <span class="cat-count">{{ cat.count.toLocaleString() }} 条</span>
          </div>
          <svg class="cat-arrow" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- 最近更新 -->
    <div v-if="recentResources.length" class="section">
      <div class="section-header">
        <span class="section-label">最近更新</span>
        <button class="section-toggle" @click="showAll = !showAll">
          {{ showAll ? '收起' : `展开全部 (${recentResources.length})` }}
        </button>
      </div>
      <div class="recent-grid">
        <ResourceCard
          v-for="(r, i) in (showAll ? recentResources : recentResources.slice(0, 6))"
          :key="i"
          :resource="r"
          :compact="true"
        />
      </div>
    </div>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-val">{{ totalResources.toLocaleString() }}</span>
        <span class="stat-lbl">资源总数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-val">{{ categoryList.length }}</span>
        <span class="stat-lbl">分类数量</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-val">{{ platformCount.quark }}</span>
        <span class="stat-lbl">夸克资源</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-val">{{ recentMonth }}</span>
        <span class="stat-lbl">最近更新</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ResourceCard from './ResourceCard.vue'
import GlobalSearch from './GlobalSearch.vue'

const searchRef = ref<InstanceType<typeof GlobalSearch> | null>(null)
const allResources = ref<any[]>([])
const showAll = ref(false)

// 分类色盘（用于圆点）
const CAT_COLORS: Record<string, string> = {
  AIknowledge:        '#7c3aed',
  book:               '#2563eb',
  'chinese-traditional': '#dc2626',
  'cross-border':     '#0891b2',
  curriculum:         '#16a34a',
  'edu-knowlege':     '#9333ea',
  games:              '#ea580c',
  healthy:            '#059669',
  movies:             '#db2777',
  'self-media':       '#ca8a04',
  tools:              '#475569',
  auto:               '#64748b',
}

function catColor(id: string) {
  return CAT_COLORS[id] || 'var(--vp-c-brand-1)'
}

const CATEGORY_MAP: Record<string, string> = {
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

const categoryList = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of allResources.value) counts[r.category] = (counts[r.category] || 0) + 1
  return Object.entries(CATEGORY_MAP)
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

const recentMonth = computed(() => {
  const months = allResources.value.map(r => r.month).filter(Boolean)
  if (!months.length) return '—'
  const latest = [...months].sort().reverse()[0]
  if (latest?.length === 6) return `${latest.slice(0, 4)}/${latest.slice(4, 6)}`
  return latest || '—'
})

onMounted(async () => {
  try {
    const r = await fetch('/data/resources.json')
    const data = await r.json()
    allResources.value = data
  } catch (e) {
    console.error('Failed to load resources:', e)
  }
})
</script>

<style scoped>
.homepage-hero {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Hero */
.hero-search {
  text-align: center;
  padding: 2rem 0 1rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 0.6rem;
  letter-spacing: -0.02em;
}

.hero-sub {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  margin: 0 0 1.75rem;
  line-height: 1.6;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 560px;
  margin: 0 auto;
  padding: 0.75rem 1.1rem;
  background: var(--vp-c-bg);
  border: 1.5px solid var(--vp-c-border);
  border-radius: 14px;
  cursor: text;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-rgb, 124, 58, 237), 0.12);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  outline: none;
  cursor: pointer;
}

.search-input::placeholder { color: var(--vp-c-text-3); }

.search-kbd {
  padding: 0.2rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* Section */
.section { display: flex; flex-direction: column; gap: 1rem; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.section-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.section-count {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.section-toggle {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.18s ease;
}

.cat-card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-info { flex: 1; min-width: 0; }

.cat-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-count {
  display: block;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-top: 0.1rem;
}

.cat-arrow {
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* 最近更新 */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

/* 统计 */
.stats-row {
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  gap: 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1.2;
}

.stat-lbl {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.stat-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--vp-c-border);
  flex-shrink: 0;
}

/* Mobile */
@media (max-width: 640px) {
  .homepage-hero { padding: 2rem 1rem 3rem; gap: 2.5rem; }
  .hero-title { font-size: 1.5rem; }
  .hero-sub { font-size: 0.85rem; }
  .category-grid { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .cat-card { padding: 0.75rem 0.85rem; gap: 0.6rem; }
  .recent-grid { grid-template-columns: 1fr; }
  .stats-row {
    flex-wrap: wrap;
    gap: 0;
    padding: 1rem;
  }
  .stat-item { flex: 0 0 50%; padding: 0.5rem 0; }
  .stat-divider { display: none; }
  .stat-val { font-size: 1.25rem; }
}
</style>
