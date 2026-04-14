<template>
  <div class="category-page">
    <!-- Banner -->
    <div class="cat-banner">
      <div class="cat-icon-lg">{{ categoryMeta?.icon }}</div>
      <div class="cat-meta">
        <h1 class="cat-title">{{ categoryMeta?.label || category }}</h1>
        <p class="cat-desc">{{ categoryMeta?.desc || '' }}</p>
        <div class="cat-stats">
          <span class="stat-pill">
            📦 {{ filteredResources.length }} 个资源
          </span>
          <span class="stat-pill">
            🗂️ {{ availableMonths.length }} 个更新周期
          </span>
        </div>
      </div>
    </div>

    <!-- 月份筛选 -->
    <div v-if="availableMonths.length > 1" class="month-filter">
      <button
        :class="['month-pill', { active: !activeMonth }]"
        @click="activeMonth = null"
      >
        全部
      </button>
      <button
        v-for="m in availableMonths"
        :key="m"
        :class="['month-pill', { active: activeMonth === m }]"
        @click="activeMonth = activeMonth === m ? null : m"
      >
        {{ formatMonth(m) }}
      </button>
    </div>

    <!-- 搜索 -->
    <div class="cat-search">
      <input
        v-model="localSearch"
        type="text"
        :placeholder="`在 ${categoryMeta?.label || category} 中搜索...`"
        class="cat-search-input"
        @input="handleLocalSearch"
      />
    </div>

    <!-- 结果 -->
    <ResourceGrid
      v-if="displayResources.length"
      :resources="displayResources"
      :columns="2"
    />
    <div v-else class="no-results">
      <div class="no-results-icon">🔍</div>
      <p>未找到匹配的资源</p>
      <button class="reset-btn" @click="localSearch = ''; activeMonth = null">
        重置筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ResourceGrid from './ResourceGrid.vue'
import { useRouter, useRoute } from 'vitepress'

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  category: string
}>()

const categoryMeta: Record<string, any> = {
  AIknowledge:        { icon: '🤖', label: 'AI知识',        desc: '人工智能学习资料、提示词工程、AI工具教程、机器学习课程' },
  book:               { icon: '📖', label: '书籍资料',        desc: '电子书、技术文档、学术论文、小说文学、专业教材' },
  'chinese-traditional': { icon: '🏛️', label: '传统文化',   desc: '中医课程、传统文化资料等国学精华内容' },
  'cross-border':     { icon: '🌍', label: '跨境电商',        desc: '亚马逊开店、TikTok营销、外贸实操、选品工具' },
  curriculum:         { icon: '📝', label: '课程资料',        desc: '得到、网上流行课程等综合学习资料' },
  'edu-knowlege':     { icon: '🎓', label: '教育知识',         desc: '从幼儿园到大学全阶段教育材料、考试资料' },
  games:              { icon: '🎮', label: '游戏资源',         desc: 'PC游戏、主机游戏、安卓手游、MOD、修改器' },
  healthy:            { icon: '💪', label: '健康养生',          desc: '健身教程、营养指南、心理健康、中医养生' },
  movies:             { icon: '🎬', label: '影视媒体',         desc: '高清电影、纪录片、音乐资源、演唱会' },
  'self-media':       { icon: '📱', label: '自媒体',            desc: '流量获取、内容创作、变现策略、短视频制作' },
  tools:              { icon: '🔧', label: '工具合集',          desc: '软件工具、浏览器插件、系统优化、开发工具' },
  auto:               { icon: '⚡', label: '自动化工具',        desc: '各种自动化脚本和工具，提升工作效率' },
}

const allResources = ref<any[]>([])
const activeMonth = ref<string | null>(null)
const localSearch = ref('')

const filteredResources = computed(() => {
  let list = allResources.value.filter(r => r.category === props.category)
  if (activeMonth.value) list = list.filter(r => r.month === activeMonth.value)
  return list
})

const displayResources = computed(() => {
  if (!localSearch.value.trim()) return filteredResources.value
  const q = localSearch.value.toLowerCase()
  return filteredResources.value.filter(r =>
    r.title.toLowerCase().includes(q)
  )
})

const availableMonths = computed(() => {
  const months = [...new Set(allResources.value
    .filter(r => r.category === props.category)
    .map(r => r.month)
    .filter(Boolean)
  )].sort((a, b) => b.localeCompare(a))
  return months
})

function formatMonth(m: string) {
  if (m?.length === 6) return `${m.slice(0, 4)}/${m.slice(4, 6)}`
  return m
}

function handleLocalSearch() {
  // reactive via computed
}

// sync with URL query
onMounted(() => {
  const month = route.query.month as string
  if (month) activeMonth.value = month

  if (Array.isArray(window.__RESOURCES__)) {
    allResources.value = window.__RESOURCES__
  } else {
    fetch('/resources.json')
      .then(r => r.json())
      .then(data => { allResources.value = data })
      .catch(() => {})
  }
})
</script>

<style scoped>
.category-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cat-banner {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, var(--vp-c-bg-soft) 100%);
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
}

.cat-icon-lg { font-size: 3.5rem; flex-shrink: 0; }

.cat-meta { flex: 1; }

.cat-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 0.4rem 0;
}

.cat-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.cat-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.month-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.month-pill {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.month-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.month-pill.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.cat-search-input {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: 2px solid var(--vp-c-border);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.cat-search-input:focus { border-color: var(--vp-c-brand-1); }
.cat-search-input::placeholder { color: var(--vp-c-text-3); }

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
  gap: 0.75rem;
}

.no-results-icon { font-size: 3rem; }
.no-results p { font-size: 1.1rem; margin: 0; }

.reset-btn {
  padding: 0.5rem 1.25rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .category-page { padding: 1.5rem 1rem; }
  .cat-banner { padding: 1.25rem; flex-direction: column; gap: 1rem; }
  .cat-title { font-size: 1.4rem; }
}
</style>
