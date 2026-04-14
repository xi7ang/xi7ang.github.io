<template>
  <div class="homepage-hero">
    <!-- 搜索区 -->
    <div class="search-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索 100T+ 免费资源..."
          class="search-input"
          @input="handleSearch"
          @keydown.enter="doSearch"
        />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
    </div>

    <!-- 分类卡片网格 -->
    <div class="categories-section">
      <h2 class="section-title">
        <span>📚</span> 资源分类
        <span class="section-sub">共 {{ totalResources }} 个资源，持续更新</span>
      </h2>
      <div class="category-grid">
        <a
          v-for="cat in categoryList"
          :key="cat.id"
          :href="`/${cat.id}/`"
          class="category-card"
        >
          <div class="cat-icon">{{ cat.icon }}</div>
          <div class="cat-info">
            <div class="cat-name">{{ cat.label }}</div>
            <div class="cat-count">{{ cat.count }} 个资源</div>
          </div>
          <div class="cat-arrow">›</div>
        </a>
      </div>
    </div>

    <!-- 最近更新 -->
    <div v-if="recentResources.length" class="recent-section">
      <h2 class="section-title">
        <span>🕐</span> 最近更新
        <a href="#" @click.prevent="showAll = !showAll" class="section-toggle">
          {{ showAll ? '收起' : '展开全部' }}
        </a>
      </h2>
      <div class="recent-scroll" :class="{ expanded: showAll }">
        <div class="recent-grid">
          <ResourceCard
            v-for="(r, i) in (showAll ? recentResources : recentResources.slice(0, 8))"
            :key="i"
            :resource="r"
            :compact="true"
          />
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length" class="results-section">
      <h2 class="section-title">
        <span>🔍</span> 搜索结果
        <span class="section-sub">找到 {{ searchResults.length }} 条相关资源</span>
      </h2>
      <ResourceGrid :resources="searchResults" :columns="2" />
    </div>

    <!-- 平台统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ totalResources }}</div>
          <div class="stat-label">资源总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ categoryList.length }}</div>
          <div class="stat-label">分类数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ platformCount.quark }}</div>
          <div class="stat-label">夸克资源</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ recentMonth }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ResourceCard from './ResourceCard.vue'
import ResourceGrid from './ResourceGrid.vue'

const allResources = ref<any[]>([])
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showAll = ref(false)

const categoryMap: Record<string, { icon: string; label: string }> = {
  AIknowledge:        { icon: '🤖', label: 'AI知识' },
  book:               { icon: '📖', label: '书籍资料' },
  'chinese-traditional': { icon: '🏛️', label: '传统文化' },
  'cross-border':     { icon: '🌍', label: '跨境电商' },
  curriculum:         { icon: '📝', label: '课程资料' },
  'edu-knowlege':     { icon: '🎓', label: '教育知识' },
  games:              { icon: '🎮', label: '游戏资源' },
  healthy:            { icon: '💪', label: '健康养生' },
  movies:             { icon: '🎬', label: '影视媒体' },
  'self-media':       { icon: '📱', label: '自媒体' },
  tools:              { icon: '🔧', label: '工具合集' },
  auto:               { icon: '⚡', label: '自动化工具' },
}

const categoryList = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of allResources.value) {
    counts[r.category] = (counts[r.category] || 0) + 1
  }
  return Object.entries(categoryMap)
    .map(([id, v]) => ({ id, ...v, count: counts[id] || 0 }))
    .sort((a, b) => b.count - a.count)
})

const totalResources = computed(() => allResources.value.length)

const platformCount = computed(() => {
  const c: Record<string, number> = { quark: 0, baidu: 0, xunlei: 0, aliyun: 0, unknown: 0 }
  for (const r of allResources.value) c[r.platform] = (c[r.platform] || 0) + 1
  return c
})

const recentResources = computed(() => {
  return [...allResources.value]
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 20)
})

const recentMonth = computed(() => {
  const months = allResources.value.map(r => r.month).filter(Boolean)
  if (!months.length) return '—'
  const latest = [...months].sort().reverse()[0]
  if (latest?.length === 6) return `${latest.slice(0, 4)}/${latest.slice(4, 6)}`
  return latest || '—'
})

function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  const q = searchQuery.value.toLowerCase()
  searchResults.value = allResources.value.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q)
  ).slice(0, 50)
}

function doSearch() {
  handleSearch()
}

onMounted(() => {
  if (Array.isArray(window.__RESOURCES__)) {
    allResources.value = window.__RESOURCES__
  } else {
    // fallback: try to load from dist
    fetch('/resources.json')
      .then(r => r.json())
      .then(data => { allResources.value = data })
      .catch(() => {})
  }
})
</script>

<style scoped>
.homepage-hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* 搜索区 */
.search-section { width: 100%; }

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-border);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: var(--vp-c-brand-1);
}

.search-icon { font-size: 1.2rem; flex-shrink: 0; }

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

.search-btn {
  padding: 0.5rem 1.25rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.search-btn:hover { background: var(--vp-c-brand-2); }

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.cat-icon { font-size: 1.75rem; flex-shrink: 0; }

.cat-info { flex: 1; min-width: 0; }

.cat-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-count {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-top: 0.2rem;
}

.cat-arrow {
  font-size: 1.5rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--vp-c-border);
  padding-bottom: 0.5rem;
}

.section-sub {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  margin-left: auto;
}

.section-toggle {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  cursor: pointer;
}

/* 最近更新 */
.recent-scroll { overflow-x: auto; }
.recent-scroll::-webkit-scrollbar { height: 6px; }
.recent-scroll::-webkit-scrollbar-thumb { background: var(--vp-c-border); border-radius: 3px; }

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  min-width: 600px;
}

/* 统计区 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-item { text-align: center; }

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .homepage-hero { padding: 1.5rem 1rem; gap: 2rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .category-grid { grid-template-columns: 1fr 1fr; }
  .recent-grid { grid-template-columns: 1fr; }
}
</style>
