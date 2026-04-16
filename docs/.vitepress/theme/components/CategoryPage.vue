<template>
  <div class="cat-page">

    <!-- ── Page Header ── -->
    <header class="masthead">
      <div class="masthead__inner">
        <a href="/" class="brand">
          <svg class="brand__icon" viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M12 22V12M3 7l9 5 9-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span class="brand__name">devmini</span>
        </a>
        <div class="masthead__stats">
          <span class="masthead__stat"><strong>{{ dataLoaded ? filteredItems.length : '—' }}</strong> 条资源</span>
        </div>
        <nav class="masthead__nav">
          <a href="/" class="nav-link">首页</a>
          <a href="https://t.me/xi7ang" target="_blank" class="nav-cta nav-cta--telegram">✈️ 加入 Telegram</a>
          <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" class="nav-cta nav-cta--qq">💬 加入 QQ群</a>
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换日间模式' : '切换夜间模式'">
            <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
                共收录 <strong>{{ dataLoaded ? filteredItems.length : '—' }}</strong> 条资源 ·
                夸克网盘
              </p>
            </div>
          </div>

          <!-- Month Filters -->
          <div class="month-filters">
            <button
              :class="['month-pill', { active: !activeMonth }]"
              @click="setMonth('')"
            >
              全部月份
            </button>
            <button
              v-for="m in availableMonths"
              :key="m"
              :class="['month-pill', { active: activeMonth === m }]"
              @click="setMonth(m)"
            >
              {{ m.slice(0,4) }}/{{ m.slice(4,6) }}
            </button>
          </div>

          <!-- Local fuzzy search -->
          <div class="search-wrap">
            <div class="search-bar">
              <svg class="search-bar__icon" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                v-model="localSearch"
                type="text"
                :placeholder="`在「${catLabel}」中搜索...`"
                class="search-input"
              />
              <button v-if="localSearch" class="search-clear" @click="localSearch = ''">
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
      <!-- Skeleton -->
      <div v-if="!dataLoaded" class="skeleton-grid">
        <div v-for="n in 12" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">暂无资源</div>
        <div class="empty-state__desc">
          <span v-if="localSearch">没有找到「{{ localSearch }}」相关资源，试试其他关键词</span>
          <span v-else>该分类下暂无资源，或切换月份试试</span>
        </div>
      </div>

      <!-- Grid with pagination -->
      <div v-else>
        <div class="resource-grid">
          <ResourceCard
            v-for="(item, i) in displayedItems"
            :key="item.title + i"
            :item="item"
            :data-title="item.title"
            :class="['animate-in', { 'rc-highlight': highlightedTitle && i === 0 }]"
            :style="{ animationDelay: `${(i % 4) * 60}ms` }"
          />
        </div>

        <!-- Load More -->
        <div v-if="hasMore" class="load-more-wrap">
          <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
            <span v-if="loadingMore">加载中…</span>
            <span v-else>加载更多 ({{ remainingCount }} 条)</span>
          </button>
        </div>

        <div class="load-count">
          已展示 {{ displayedItems.length }} / {{ filteredItems.length }} 条
        </div>
      </div>
    </div>

    <!-- ── Back to top ── -->
    <button v-show="showBackTop" class="back-top" @click="scrollToTop">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- ── Footer ── -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-inner">
          <div>
            <span class="brand__name" style="font-size:16px">devmini</span>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import { useTheme } from '../composables/useTheme'
import ResourceCard from './ResourceCard.vue'

const props = defineProps({
  category: { type: String, required: true }
})

const route = useRoute()
const { theme, toggleTheme } = useTheme()

// Resolve category from route if not passed as prop
const currentCategory = computed(() => {
  const seg = route.path.replace(/\/$/, '').split('/').filter(Boolean).pop()
  return seg || props.category
})

const PAGE_SIZE = 48
const allResources = ref([])
const activeMonth = ref('')
const localSearch = ref('')
const showBackTop = ref(false)
const displayedCount = ref(PAGE_SIZE)
const loadingMore = ref(false)
const dataLoaded = ref(false)
const highlightedTitle = ref('')

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

const catLabel = computed(() => CAT_LABELS[currentCategory.value] || currentCategory.value)
const catEmoji = computed(() => CAT_EMOJIS[currentCategory.value] || '📦')
const catColor = computed(() => CAT_COLORS[currentCategory.value] || '#666680')

const catResources = computed(() =>
  allResources.value.filter(r => r.category === currentCategory.value)
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
    const q = localSearch.value.toLowerCase().trim()
    // Simple substring match (Fuse.js would be heavier for this size)
    items = items.filter(r => {
      const title = r.title.toLowerCase()
      // Also search in pwds if present
      const pwdMatch = r.pwd && r.pwd.toLowerCase().includes(q)
      return title.includes(q) || pwdMatch
    })
  }
  return items.sort((a, b) => b.month.localeCompare(a.month))
})

const displayedItems = computed(() =>
  filteredItems.value.slice(0, displayedCount.value)
)

const hasMore = computed(() =>
  displayedCount.value < filteredItems.value.length
)

const remainingCount = computed(() =>
  filteredItems.value.length - displayedCount.value
)

function setMonth(m) {
  activeMonth.value = activeMonth.value === m ? '' : (m || '')
  displayedCount.value = PAGE_SIZE // reset pagination on filter change
}

function loadMore() {
  loadingMore.value = true
  setTimeout(() => {
    displayedCount.value += PAGE_SIZE
    loadingMore.value = false
  }, 300)
}

// Find first rendered card matching title, scroll + highlight it
async function scrollToTitle(targetTitle) {
  await nextTick()
  const allCards = document.querySelectorAll('.resource-card')
  for (const card of allCards) {
    if (card.dataset.title === targetTitle) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return true
    }
  }
  return false
}

// Keep loading more until we find the target card (for deep paginated results)
async function loadMoreUntilTitleFound(targetTitle) {
  while (hasMore.value) {
    loadingMore.value = true
    displayedCount.value += PAGE_SIZE
    await new Promise(r => setTimeout(r, 200))
    loadingMore.value = false
    await nextTick()
    const found = await scrollToTitle(targetTitle)
    if (found) return
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  showBackTop.value = window.scrollY > 400
}

// Reset pagination and clear highlight when user types or changes filter
// Use queueMicrotask so onMounted's highlightedTitle assignment runs first
watch([localSearch, activeMonth], () => {
  displayedCount.value = PAGE_SIZE
  queueMicrotask(() => { highlightedTitle.value = '' })
})

onMounted(async () => {
  window.addEventListener('scroll', onScroll)
  try {
    const res = await fetch('/data/resources.json')
    const data = await res.json()
    allResources.value = data
    dataLoaded.value = true
    const q = route.query.q
    if (q) {
      const decoded = decodeURIComponent(String(q))
      localSearch.value = decoded
      highlightedTitle.value = decoded
      // Try scroll immediately (card may already be in first page)
      await nextTick()
      const found = await scrollToTitle(decoded)
      // If not found, keep loading more until it appears
      if (!found) {
        await loadMoreUntilTitleFound(decoded)
      }
    }
  } catch {
    if (window.__RESOURCES__) {
      allResources.value = window.__RESOURCES__
      dataLoaded.value = true
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.search-clear {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.search-clear:hover {
  background: rgba(255,255,255,0.12);
  color: var(--text-primary);
}

/* Skeleton */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.skeleton-card {
  height: 180px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255,255,255,0.05);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Load more */
.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: var(--space-xl) 0 var(--space-md);
}

.load-more-btn {
  padding: 12px 32px;
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  border-color: rgba(212,168,67,0.3);
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-count {
  text-align: center;
  padding: var(--space-md) 0 var(--space-2xl);
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
