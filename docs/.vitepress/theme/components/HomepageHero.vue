<template>
  <div class="homepage-hero">
    <!-- 搜索触发区 -->
    <div class="search-trigger" @click="searchRef?.open()">
      <span class="trigger-icon">🔍</span>
      <span class="trigger-text">搜索 100T+ 免费资源...</span>
      <span class="trigger-shortcut"><kbd>/</kbd></span>
    </div>

    <!-- GlobalSearch 模态框 -->
    <GlobalSearch ref="searchRef" />

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
        <button class="section-toggle" @click="showAll = !showAll">
          {{ showAll ? '收起' : `展开全部 (${recentResources.length})` }}
        </button>
      </h2>
      <div class="recent-grid-wrap">
        <div class="recent-grid" :class="{ 'show-all': showAll }">
          <ResourceCard
            v-for="(r, i) in (showAll ? recentResources : recentResources.slice(0, 8))"
            :key="i"
            :resource="r"
            :compact="true"
          />
        </div>
      </div>
      <div v-if="recentResources.length > 8 && !showAll" class="load-more-row">
        <button class="load-more-btn" @click="showAll = true">
          查看全部 {{ recentResources.length }} 条最近更新 ↓
        </button>
      </div>
    </div>

    <!-- 平台统计 -->
    <div class="stats-section">
      <h2 class="section-title"><span>📊</span> 站点统计</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ totalResources.toLocaleString() }}</div>
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
import GlobalSearch from './GlobalSearch.vue'

const searchRef = ref<InstanceType<typeof GlobalSearch> | null>(null)
const allResources = ref<any[]>([])
const showAll = ref(false)

const CATEGORY_MAP: Record<string, { icon: string; label: string }> = {
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
  return Object.entries(CATEGORY_MAP)
    .map(([id, v]) => ({ id, ...v, count: counts[id] || 0 }))
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

/* 搜索触发区 */
.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.search-trigger:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(var(--vp-c-brand-rgb, 0, 0, 0), 0.1);
}
.trigger-icon { font-size: 1.3rem; flex-shrink: 0; }
.trigger-text {
  flex: 1;
  font-size: 1rem;
  color: var(--vp-c-text-3);
  text-align: left;
}
.trigger-shortcut kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
}

/* 分类网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
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
.cat-count { font-size: 0.75rem; color: var(--vp-c-text-3); margin-top: 0.2rem; }
.cat-arrow { font-size: 1.5rem; color: var(--vp-c-text-3); flex-shrink: 0; }

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 1.2rem 0;
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
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* 最近更新 */
.recent-grid-wrap { overflow-x: auto; }
.recent-grid-wrap::-webkit-scrollbar { height: 6px; }
.recent-grid-wrap::-webkit-scrollbar-thumb { background: var(--vp-c-border); border-radius: 3px; }
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  min-width: 600px;
}
.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: 1.25rem;
}
.load-more-btn {
  padding: 0.6rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: all 0.2s;
}
.load-more-btn:hover { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); }

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
.stat-label { font-size: 0.8rem; color: var(--vp-c-text-3); margin-top: 0.25rem; }

@media (max-width: 640px) {
  .homepage-hero { padding: 1.5rem 1rem 2rem; gap: 2.5rem; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .category-grid { grid-template-columns: 1fr 1fr; }
}
</style>
