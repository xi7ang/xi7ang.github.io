<template>
  <div class="cat-page">

    <!-- ── Page Header ── -->
    <header class="masthead">
      <div class="masthead__inner">
        <a href="/" class="brand">
          <div class="brand__icon">📦</div>
          <span class="brand__name">PAN.NA</span>
        </a>
        <div class="masthead__stats">
          <span class="masthead__stat"><strong>{{ filteredItems.length }}</strong> 条资源</span>
        </div>
        <nav class="masthead__nav">
          <a href="/" class="nav-link">🏠 首页</a>
          <a href="/book/" class="nav-link">📚 书籍</a>
          <a href="/games/" class="nav-link">🎮 游戏</a>
        </nav>
      </div>
    </header>

    <!-- ── Category Hero ── -->
    <section class="category-hero">
      <div class="category-hero__bg" :style="{ background: `radial-gradient(ellipse at 30% 50%, ${catColor}22 0%, transparent 60%)` }"></div>
      <div class="container">
        <div class="category-hero__inner">
          <div class="cat-banner">
            <div class="cat-banner__icon">{{ catEmoji }}</div>
            <div class="cat-banner__info">
              <h1 class="cat-banner__name">{{ catLabel }}</h1>
              <p class="cat-banner__count">
                共收录 <strong>{{ filteredItems.length }}</strong> 条资源 ·
                来自 <strong>{{ platformCount }}</strong> 个平台
              </p>
            </div>
          </div>

          <!-- Month Filters -->
          <div class="month-filters">
            <button
              :class="['month-pill', { active: !activeMonth }]"
              @click="activeMonth = ''"
            >
              全部月份
            </button>
            <button
              v-for="m in availableMonths"
              :key="m"
              :class="['month-pill', { active: activeMonth === m }]"
              @click="activeMonth = activeMonth === m ? '' : m"
            >
              {{ m.slice(0,4) }}/{{ m.slice(4,6) }}
            </button>
          </div>

          <!-- Local search -->
          <div class="search-wrap">
            <div class="search-bar">
              <svg class="search-bar__icon" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                v-model="localSearch"
                type="text"
                :placeholder="`在 ${catLabel} 中搜索...`"
                class="search-input"
              />
              <button v-if="localSearch" class="rc-copy-btn" style="border:none;background:none;padding:4px;" @click="localSearch = ''">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Resource Grid ── -->
    <div class="container">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">暂无资源</div>
        <div class="empty-state__desc">
          当前分类下没有找到资源，试试切换月份或返回首页浏览其他分类。
        </div>
      </div>

      <div v-else class="resource-grid" ref="gridEl">
        <ResourceCard
          v-for="(item, i) in filteredItems"
          :key="item.title + i"
          :item="item"
          :class="`animate-in stagger-${(i % 4) + 1}`"
          :style="{ animationDelay: `${(i % 4) * 80}ms` }"
        />
      </div>

      <!-- Load more hint -->
      <div v-if="filteredItems.length > 0" class="load-more-hint">
        已展示全部 {{ filteredItems.length }} 条资源
      </div>
    </div>

    <!-- ── Back to top ── -->
    <button v-if="showBackTop" class="back-top" @click="scrollToTop">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- ── Footer ── -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-inner">
          <div>
            <span class="brand__name" style="font-size:16px">PAN.NA</span>
            <p class="footer-desc">免费资源导航 · {{ catLabel }}分类</p>
          </div>
          <div class="footer-links">
            <a href="/">返回首页</a>
            <a href="/disclaimer">免责声明</a>
            <a href="/support">支持本站</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ResourceCard from './ResourceCard.vue'

const props = defineProps({
  category: { type: String, required: true }
})

const allResources = ref([])
const activeMonth = ref('')
const localSearch = ref('')
const showBackTop = ref(false)
const gridEl = ref(null)

const CAT_EMOJIS = {
  'AIknowledge': '🤖', 'book': '📚', 'curriculum': '🎓', 'tools': '🔧',
  'games': '🎮', 'movies': '🎬', 'healthy': '💪', 'self-media': '🎙️',
  'edu-knowlege': '📖', 'chinese-traditional': '🏯', 'cross-border': '🌐', 'auto': '⚙️'
}

const CAT_LABELS = {
  'AIknowledge': 'AI 知识', 'book': '书籍资料', 'curriculum': '课程资料',
  'tools': '工具合集', 'games': '游戏资源', 'movies': '影视媒体',
  'healthy': '健康养生', 'self-media': '自媒体', 'edu-knowlege': '教育知识',
  'chinese-traditional': '传统文化', 'cross-border': '跨境电商', 'auto': '自动'
}

const CAT_COLORS = {
  'AIknowledge': '#7B68EE', 'book': '#CD7B4A', 'curriculum': '#4AADE4',
  'tools': '#54C47C', 'games': '#E45A5A', 'movies': '#E4A54A',
  'healthy': '#4AD4A5', 'self-media': '#D44AE4', 'edu-knowlege': '#4A9AE4',
  'chinese-traditional': '#C47A4A', 'cross-border': '#7AE44A', 'auto': '#888899'
}

const catLabel = computed(() => CAT_LABELS[props.category] || props.category)
const catEmoji = computed(() => CAT_EMOJIS[props.category] || '📦')
const catColor = computed(() => CAT_COLORS[props.category] || '#666680')

const catResources = computed(() =>
  allResources.value.filter(r => r.category === props.category)
)

const availableMonths = computed(() => {
  const months = [...new Set(catResources.value.map(r => r.month).filter(Boolean))]
  return months.sort().reverse()
})

const filteredItems = computed(() => {
  let items = catResources.value
  if (activeMonth.value) {
    items = items.filter(r => r.month === activeMonth.value)
  }
  if (localSearch.value.trim()) {
    const q = localSearch.value.toLowerCase()
    items = items.filter(r => r.title.toLowerCase().includes(q))
  }
  return items
})

const platformCount = computed(() => {
  const plats = new Set(catResources.value.map(r => r.platform))
  return plats.size
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  showBackTop.value = window.scrollY > 400
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll)
  try {
    const res = await fetch('/data/resources.json')
    allResources.value = await res.json()
  } catch {
    if (window.__RESOURCES__) allResources.value = window.__RESOURCES__
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.load-more-hint {
  text-align: center;
  padding: var(--space-2xl) 0;
  font-size: 13px;
  color: var(--text-muted);
}

.back-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  z-index: 50;
  box-shadow: var(--shadow-card);
}

.back-top:hover {
  background: var(--bg-card-hover);
  color: var(--accent-gold);
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

.site-footer {
  margin-top: var(--space-3xl);
  padding: var(--space-2xl) 0 var(--space-xl);
  border-top: 1px solid rgba(255,255,255,0.05);
  background: var(--bg-surface);
}

.footer-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.footer-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.footer-links a {
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--accent-gold);
}
</style>
