<template>
  <div class="home">

    <!-- ── Masthead ── -->
    <header class="masthead">
      <div class="masthead__inner">
        <a href="/" class="brand">
          <div class="brand__icon">📦</div>
          <span class="brand__name">PAN.NA</span>
        </a>
        <div class="masthead__stats">
          <span class="masthead__stat"><strong>{{ totalResources.toLocaleString() }}</strong> 资源</span>
          <span class="masthead__dot"></span>
          <span class="masthead__stat"><strong>{{ categoryList.length }}</strong> 分类</span>
          <span class="masthead__dot"></span>
          <span class="masthead__stat"><strong>{{ totalSize }}</strong></span>
        </div>
        <nav class="masthead__nav">
          <a href="/" class="nav-link">首页</a>
          <a href="/book/" class="nav-link">书籍</a>
          <a href="/games/" class="nav-link">游戏</a>
          <a href="/support" class="nav-link nav-link--cta">❤️ 支持</a>
        </nav>
      </div>
    </header>

    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero__bg"></div>
      <div class="hero__inner">
        <div class="hero__eyebrow">
          <span>✨</span>
          <span>超过 1000+ 精选资源，持续更新</span>
        </div>

        <h1 class="hero__title">
          发现全网<br><em>优质网盘资源</em>
        </h1>
        <p class="hero__subtitle">
          聚合夸克、百度、迅雷、阿里云四大平台<br>
          游戏 · 书籍 · 课程 · 工具 · 影视 · AI 知识
        </p>

        <!-- Search -->
        <div class="search-wrap">
          <div class="search-bar" :class="{ focused: searchFocused }">
            <svg class="search-bar__icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索资源名称、平台或分类..."
              class="search-input"
              @focus="searchFocused = true"
              @blur="onBlur"
              @keydown.escape="clearSearch"
              @keydown.up.prevent="selectPrev"
              @keydown.down.prevent="selectNext"
              @keydown.enter.prevent="openSelected"
            />
            <kbd v-if="!searchQuery" class="search-kbd">/</kbd>
            <button v-if="searchQuery" class="rc-copy-btn" @click="clearSearch" style="border:none;background:none;padding:4px;">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Search Dropdown -->
          <div v-if="searchQuery && searchFocused" class="search-dropdown">
            <div v-if="searchResults.length === 0" class="sd-empty">
              未找到「{{ searchQuery }}」相关资源，试试其他关键词
            </div>
            <div v-else class="sd-results">
              <div class="sd-meta">{{ searchResults.length }} 条结果 · 按 {{ searchQuery }} 搜索</div>
              <div
                v-for="(item, idx) in searchResults.slice(0, 8)"
                :key="item.title + item.platform"
                :class="['sd-item', { selected: idx === searchSelected }]"
                @mousedown.prevent="openItem(item)"
                @mouseenter="searchSelected = idx"
              >
                <span class="sd-dot" :style="{ background: platColor(item.platform) }"></span>
                <div class="sd-info">
                  <span class="sd-title" v-html="highlight(item.title, searchQuery)"></span>
                  <span class="sd-cat">{{ catLabel(item.category) }} · {{ platLabel(item.platform) }}</span>
                </div>
                <span class="month-badge">{{ fmtMonth(item.month) }}</span>
              </div>
              <div v-if="searchResults.length > 8" class="sd-empty" style="padding:12px">
                还有 {{ searchResults.length - 8 }} 条结果，请精确搜索…
              </div>
            </div>
          </div>
        </div>

        <!-- Platform Quick Filters -->
        <div class="quick-filters">
          <button
            v-for="plat in PLATFORMS"
            :key="plat.value"
            :class="['plat-chip', { active: activePlatform === plat.value }]"
            :style="activePlatform === plat.value ? { background: plat.color, borderColor: plat.color } : {}"
            @click="togglePlatform(plat.value)"
          >
            <span class="plat-dot" :style="{ background: plat.color }"></span>
            {{ plat.label }}
            <span class="plat-count">{{ platformCount[plat.value] || 0 }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <div class="container">
      <div class="stats-panel animate-in">
        <div class="stat-card stagger-1 animate-in">
          <div class="stat-num">{{ totalResources.toLocaleString() }}</div>
          <div class="stat-label">收录资源</div>
        </div>
        <div class="stat-card stagger-2 animate-in">
          <div class="stat-num">4</div>
          <div class="stat-label">网盘平台</div>
        </div>
        <div class="stat-card stagger-3 animate-in">
          <div class="stat-num">{{ categoryList.length }}</div>
          <div class="stat-label">资源分类</div>
        </div>
        <div class="stat-card stagger-4 animate-in">
          <div class="stat-num">{{ updateMonth }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
    </div>

    <!-- ── Categories ── -->
    <div class="container">
      <div class="section-divider"></div>
      <section class="section">
        <div class="section-head">
          <h2 class="section-ttl">全部分类</h2>
          <span class="section-sub">{{ filteredCatList.length }} 个分类</span>
        </div>
        <div class="cat-grid">
          <a
            v-for="(cat, i) in filteredCatList"
            :key="cat.id"
            :href="`/${cat.id}/`"
            class="cat-card animate-in"
            :class="`stagger-${(i % 6) + 1}`"
            :style="{ '--cat-color': catColor(cat.id) }"
          >
            <div class="cat-card__icon">{{ catEmoji(cat.id) }}</div>
            <div class="cat-card__name">{{ cat.label }}</div>
            <div class="cat-card__count">{{ cat.count.toLocaleString() }} 条资源</div>
            <div class="cat-card__bar">
              <span class="plat-dot" :style="{ background: catColor(cat.id), width: '6px', height: '6px' }"></span>
              <span>浏览全部</span>
              <svg class="cat-card__arrow" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </a>
        </div>
      </section>

      <!-- ── Recent Resources ── -->
      <div class="section-divider"></div>
      <section class="section">
        <div class="section-head">
          <h2 class="section-ttl">最近更新</h2>
          <span class="section-sub">实时同步各大平台</span>
        </div>
        <div class="resource-grid">
          <ResourceCard
            v-for="(item, i) in recentResources"
            :key="item.title + i"
            :item="item"
            :class="`animate-in stagger-${(i % 4) + 1}`"
          />
        </div>
      </section>

      <!-- ── Platform Distribution ── -->
      <div class="section-divider"></div>
      <section class="section">
        <div class="section-head">
          <h2 class="section-ttl">平台分布</h2>
          <span class="section-sub">各平台资源占比</span>
        </div>
        <div class="platform-bars">
          <div v-for="plat in PLATFORMS" :key="plat.value" class="plat-bar-item">
            <div class="plat-bar-label">
              <span class="plat-dot" :style="{ background: plat.color }"></span>
              <span>{{ plat.label }}</span>
              <span class="plat-bar-pct">{{ platPct(plat.value) }}%</span>
            </div>
            <div class="plat-bar-track">
              <div
                class="plat-bar-fill"
                :style="{ width: platPct(plat.value) + '%', background: plat.color }"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ── Footer ── -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="brand__name" style="font-size:16px">PAN.NA</span>
            <p class="footer-desc">免费资源导航 · 持续更新 · 分类整理</p>
          </div>
          <div class="footer-links">
            <a href="/disclaimer">免责声明</a>
            <a href="/support">支持本站</a>
            <a href="https://t.me/xi7ang" target="_blank">Telegram</a>
            <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank">QQ群</a>
          </div>
        </div>
        <div class="footer-copy">
          © 2025–present xi7ang · 资源收集整理，仅供学习交流
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ResourceCard from './ResourceCard.vue'

// ── Data ──
const allResources = ref([])
const categories = ref({})

const PLATFORMS = [
  { value: 'quark',  label: '夸克网盘', color: '#4A90E2' },
  { value: 'baidu',  label: '百度网盘', color: '#7B8EF5' },
  { value: 'xunlei', label: '迅雷网盘', color: '#2DBD6C' },
  { value: 'aliyun', label: '阿里云盘', color: '#FF6D2E' },
]

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

// ── Search State ──
const searchQuery = ref('')
const searchFocused = ref(false)
const searchSelected = ref(0)
const activePlatform = ref('')

// ── Computed ──
const totalResources = computed(() => allResources.value.length || 998)

const totalSize = computed(() => '100T+')

const updateMonth = computed(() => {
  const months = allResources.value.map(r => r.month).filter(Boolean)
  if (!months.length) return '202604'
  const latest = months.sort().reverse()[0]
  return latest ? `${latest.slice(0,4)}/${latest.slice(4,6)}` : '202604'
})

const categoryList = computed(() => {
  const cats = {}
  allResources.value.forEach(r => {
    if (!cats[r.category]) cats[r.category] = 0
    cats[r.category]++
  })
  return Object.entries(cats).map(([id, count]) => ({
    id, label: CAT_LABELS[id] || id, count
  })).sort((a, b) => b.count - a.count)
})

const filteredCatList = computed(() => {
  if (!activePlatform.value) return categoryList.value
  return categoryList.value.filter(c => {
    return allResources.value.some(r => r.category === c.id && r.platform === activePlatform.value)
  })
})

const recentResources = computed(() => {
  const filtered = activePlatform.value
    ? allResources.value.filter(r => r.platform === activePlatform.value)
    : allResources.value
  return filtered.slice(0, 8)
})

const platformCount = computed(() => {
  const counts = {}
  allResources.value.forEach(r => {
    counts[r.platform] = (counts[r.platform] || 0) + 1
  })
  return counts
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase().trim()
  return allResources.value.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.platform.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q)
  )
})

// ── Methods ──
function togglePlatform(val) {
  activePlatform.value = activePlatform.value === val ? '' : val
}

function platColor(platform) {
  return PLATFORMS.find(p => p.value === platform)?.color || '#666680'
}

function platLabel(platform) {
  return PLATFORMS.find(p => p.value === platform)?.label || platform
}

function catColor(cat) {
  return CAT_COLORS[cat] || '#666680'
}

function catLabel(cat) {
  return CAT_LABELS[cat] || cat
}

function catEmoji(cat) {
  return CAT_EMOJIS[cat] || '📦'
}

function fmtMonth(month) {
  if (!month) return ''
  return `${month.slice(0,4)}/${month.slice(4,6)}`
}

function platPct(platform) {
  if (!totalResources.value) return 0
  return Math.round((platformCount.value[platform] || 0) / totalResources.value * 100)
}

function highlight(text, query) {
  if (!query) return text
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
}

function clearSearch() {
  searchQuery.value = ''
  searchFocused.value = false
  searchSelected.value = 0
}

function selectPrev() {
  if (searchSelected.value > 0) searchSelected.value--
}

function selectNext() {
  if (searchSelected.value < Math.min(7, searchResults.value.length - 1))
    searchSelected.value++
}

function openSelected() {
  const item = searchResults.value[searchSelected.value]
  if (item) openItem(item)
}

function openItem(item) {
  window.location.href = `/${item.category}/`
}

function onBlur() {
  setTimeout(() => { searchFocused.value = false }, 200)
}

// ── Keyboard shortcut '/' to focus search ──
function handleKeydown(e) {
  if (e.key === '/' && !searchFocused.value &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault()
    document.querySelector('.search-input')?.focus()
  }
}

// ── Load data ──
onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  try {
    const res = await fetch('/data/resources.json')
    allResources.value = await res.json()
  } catch (e) {
    // fallback: resources may be injected via window
    if (window.__RESOURCES__) allResources.value = window.__RESOURCES__
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Platform bars section */
.platform-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
}

.plat-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plat-bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.plat-bar-pct {
  margin-left: auto;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 13px;
}

.plat-bar-track {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}

.plat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;
}

/* Site Footer */
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

.footer-copy {
  font-size: 12px;
  color: var(--text-muted);
  padding-top: var(--space-lg);
  border-top: 1px solid rgba(255,255,255,0.04);
}
</style>
