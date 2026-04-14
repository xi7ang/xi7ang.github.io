<template>
  <div class="category-page">

    <!-- Banner -->
    <div class="cat-banner" :style="{ borderLeftColor: catColor }">
      <div class="cat-info">
        <div class="cat-meta-row">
          <span class="cat-tag" :style="{ background: catColor }">{{ categoryLabel }}</span>
          <span class="cat-count-badge">{{ displayCount }} 条资源</span>
        </div>
        <p class="cat-desc">{{ categoryMeta?.desc || '' }}</p>
      </div>
    </div>

    <!-- 月份筛选 -->
    <div v-if="availableMonths.length > 1" class="month-filter">
      <button
        :class="['pill', { active: !activeMonth }]"
        @click="setMonth(null)"
      >全部</button>
      <button
        v-for="item in availableMonths"
        :key="item.month"
        :class="['pill', { active: activeMonth === item.month }]"
        @click="setMonth(item.month)"
      >{{ formatMonth(item) }} ({{ item.count }})</button>
    </div>

    <!-- 搜索 & 排序 -->
    <div class="controls-row">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="localSearch"
          type="text"
          :placeholder="`在「${categoryLabel}」中搜索...`"
          class="search-input"
        />
        <button v-if="localSearch" class="clear-btn" @click="localSearch = ''">
          <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
      <select v-model="sortBy" class="sort-select">
        <option value="default">默认排序</option>
        <option value="title">按名称</option>
      </select>
    </div>

    <!-- 结果统计 -->
    <div class="results-bar">
      <span v-if="localSearch || activeMonth">
        共找到 {{ filteredResources.length }} 条
      </span>
      <span v-else>
        共 {{ filteredResources.length }} 条资源
      </span>
      <button v-if="localSearch || activeMonth" class="reset-btn" @click="reset">清除筛选</button>
    </div>

    <!-- 资源网格 -->
    <ResourceGrid
      v-if="displayResources.length"
      :resources="displayResources"
      :columns="2"
    />
    <div v-else class="empty-state">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
        <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
      </svg>
      <p>未找到匹配的资源</p>
      <button class="reset-action" @click="reset">重置筛选</button>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        上一页
      </button>
      <div class="page-nums">
        <button
          v-for="p in visiblePages"
          :key="String(p)"
          :class="['page-num', { active: p === currentPage, ellipsis: p === '...' }]"
          :disabled="p === '...'"
          @click="p !== '...' && (currentPage = Number(p))"
        >{{ p }}</button>
      </div>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        下一页
        <svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ResourceGrid from './ResourceGrid.vue'

const PAGE_SIZE = 24

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

const props = defineProps<{ category: string }>()

const allResources = ref<any[]>([])
const activeMonth = ref<string | null>(null)
const localSearch = ref('')
const currentPage = ref(1)
const sortBy = ref('default')

const categoryLabel = computed(() => categoryMetaMap[props.category]?.label || props.category)
const catColor = computed(() => CAT_COLORS[props.category] || 'var(--vp-c-brand-1)')

const categoryMetaMap: Record<string, any> = {
  AIknowledge:        { label: 'AI知识',        desc: '人工智能学习资料、提示词工程、AI工具教程、机器学习课程' },
  book:               { label: '书籍资料',        desc: '电子书、技术文档、学术论文、小说文学，专业教材' },
  'chinese-traditional': { label: '传统文化',   desc: '中医课程、传统文化资料等国学精华内容' },
  'cross-border':     { label: '跨境电商',        desc: '亚马逊开店、TikTok营销、外贸实操、选品工具' },
  curriculum:         { label: '课程资料',        desc: '得到、网上流行课程等综合学习资料' },
  'edu-knowlege':     { label: '教育知识',         desc: '从幼儿园到大学全阶段教育材料、考试资料' },
  games:              { label: '游戏资源',         desc: 'PC游戏、主机游戏、安卓手游、MOD、修改器' },
  healthy:            { label: '健康养生',          desc: '健身教程、营养指南、心理健康、中医养生' },
  movies:             { label: '影视媒体',         desc: '高清电影、纪录片，音乐资源、演唱会' },
  'self-media':       { label: '自媒体',            desc: '流量获取、内容创作、变现策略、短视频制作' },
  tools:              { label: '工具合集',          desc: '软件工具、浏览器插件、系统优化、开发工具' },
  auto:               { label: '自动化工具',        desc: '各种自动化脚本和工具，提升工作效率' },
}

const categoryMeta = computed(() => categoryMetaMap[props.category])

const filteredResources = computed(() => {
  let list = allResources.value.filter(r => r.category === props.category)
  if (activeMonth.value) list = list.filter(r => r.month === activeMonth.value)
  if (localSearch.value.trim()) {
    const q = localSearch.value.toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(q))
  }
  if (sortBy.value === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredResources.value.length / PAGE_SIZE)))
const displayResources = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredResources.value.slice(start, start + PAGE_SIZE)
})
const displayCount = computed(() => filteredResources.value.length)

const visiblePages = computed(() => {
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => String(i + 1))
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) pages.push(p)
  if (cp < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

const availableMonths = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of allResources.value) {
    if (r.category === props.category && r.month) counts[r.month] = (counts[r.month] || 0) + 1
  }
  return [...new Set(Object.keys(counts))]
    .sort((a, b) => b.localeCompare(a))
    .map(m => ({ month: m, count: counts[m] }))
})

function formatMonth(m: string | { month: string; count: number }) {
  const s = typeof m === 'string' ? m : m.month
  return s?.length === 6 ? `${s.slice(0, 4)}/${s.slice(4, 6)}` : s
}

function syncUrl(month: string | null) {
  const url = new URL(window.location.href)
  if (month) url.searchParams.set('month', month)
  else url.searchParams.delete('month')
  history.replaceState(null, '', url.toString())
}

function setMonth(m: string | null) { activeMonth.value = m; currentPage.value = 1; syncUrl(m) }
function reset() { localSearch.value = ''; activeMonth.value = null; currentPage.value = 1 }

watch([localSearch, activeMonth], () => { currentPage.value = 1 })

onMounted(async () => {
  try {
    const r = await fetch('/data/resources.json')
    allResources.value = await r.json()
  } catch (e) { console.error('Failed to load resources:', e) }
})
</script>

<style scoped>
.category-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Banner */
.cat-banner {
  padding: 1.5rem 1.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-left: 4px solid;
  border-radius: 10px;
}

.cat-info { display: flex; flex-direction: column; gap: 0.5rem; }

.cat-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cat-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.7rem;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

.cat-count-badge {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.cat-desc {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.6;
}

/* 月份筛选 */
.month-filter {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  align-items: center;
}

.pill {
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.pill:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.pill.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }

/* 控制行 */
.controls-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.5rem;
  border: 1.5px solid var(--vp-c-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input:focus { border-color: var(--vp-c-brand-1); }
.search-input::placeholder { color: var(--vp-c-text-3); }

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
}
.clear-btn svg { width: 14px; height: 14px; }
.clear-btn:hover { color: var(--vp-c-text-2); }

.sort-select {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.sort-select:focus { border-color: var(--vp-c-brand-1); }

/* 结果栏 */
.results-bar {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  padding: 0 0.2rem;
}

.reset-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-3);
  gap: 0.75rem;
  text-align: center;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}

.empty-state p { font-size: 1rem; margin: 0; }

.reset-action {
  padding: 0.45rem 1.25rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 0.85rem;
  cursor: pointer;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding-top: 0.5rem;
  flex-wrap: wrap;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn svg { width: 14px; height: 14px; }

.page-nums { display: flex; gap: 0.3rem; align-items: center; }

.page-num {
  min-width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-border);
  border-radius: 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.page-num:hover:not(:disabled) { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.page-num.active { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }
.page-num.ellipsis { border: none; background: transparent; cursor: default; }

/* Mobile */
@media (max-width: 640px) {
  .category-page { padding: 1.5rem 1rem 2.5rem; }
  .cat-banner { padding: 1.1rem 1.25rem; }
  .controls-row { flex-direction: column; }
  .results-bar { flex-wrap: wrap; }
}
</style>
