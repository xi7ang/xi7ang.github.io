<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import QrModal from './QrModal.vue'

const { theme, toggleTheme } = useTheme()

// ── 分类元数据 ──
const CAT_META = {
  'AIknowledge':        { label: 'AI 知识',       emoji: '🤖', color: '#7B68EE' },
  'book':               { label: '书籍资料',       emoji: '📚', color: '#CD7B4A' },
  'chinese-traditional': { label: '传统文化',      emoji: '🏮', color: '#C47A4A' },
  'cross-border':       { label: '跨境电商',       emoji: '🌏', color: '#7AE44A' },
  'curriculum':         { label: '课程资料',       emoji: '🎓', color: '#4AADE4' },
  'edu-knowlege':       { label: '教育知识',       emoji: '📖', color: '#4A9AE4' },
  'games':              { label: '游戏资源',       emoji: '🎮', color: '#E45A5A' },
  'healthy':            { label: '健康养生',       emoji: '💪', color: '#4AD4A5' },
  'movies':             { label: '影视媒体',       emoji: '🎬', color: '#E4A54A' },
  'self-media':         { label: '自媒体',         emoji: '📱', color: '#D44AE4' },
  'tools':              { label: '工具合集',       emoji: '🛠️', color: '#54C47C' },
  'auto':               { label: '其他资源',       emoji: '📦', color: '#888888' },
}

// ── 平台元数据 ──
const PLATFORM_META = {
  'quark':  { label: '夸克网盘', icon: '🥤', color: '#4A90E2', bg: 'rgba(74,144,226,0.12)' },
  'baidu':  { label: '百度网盘', icon: '🔵', color: '#293BE4', bg: 'rgba(41,59,228,0.12)' },
  'xunlei': { label: '迅雷网盘', icon: '⚡', color: '#2DBD6C', bg: 'rgba(45,189,108,0.12)' },
  'aliyun': { label: '阿里云盘', icon: '🟠', color: '#FF6D2E', bg: 'rgba(255,109,46,0.12)' },
}

// ── 状态 ──
const resource = ref(null)
const loading = ref(true)
const notFound = ref(false)
const res = computed(() => resource.value || {})
const showQr = ref(false)
const isMobile = ref(false)

// ── 计算属性 ──
const catMeta = computed(() => CAT_META[resource.value?.category] || CAT_META['auto'])
const platMeta = computed(() => PLATFORM_META[resource.value?.platform] || { label: '网盘资源', icon: '📎', color: '#888', bg: 'rgba(136,136,136,0.12)' })
const displayTitle = computed(() => resource.value?.title || '资源详情')

function fmtMonth(m) {
  if (!m || m.length < 6) return ''
  return `${m.slice(0,4)}年${parseInt(m.slice(4,6))}月`
}

// ── 主题标签 ──
const themeLabel = computed(() => theme.value === 'dark' ? '切换日间模式' : '切换夜间模式')

// ── 查找资源 ──
async function loadResource() {
  loading.value = true
  notFound.value = false

  const params = new URLSearchParams(window.location.search)
  const cat = params.get('c')
  const id = params.get('id')

  if (!cat || id === null) {
    loading.value = false
    notFound.value = true
    return
  }

  try {
    const resp = await fetch('/data/resources.json')
    if (!resp.ok) throw new Error('Failed to load resources')
    const all = await resp.json()

    const rid = parseInt(id, 10)
    const found = all.find(r => r.category === cat && r.id === rid)
    if (found) {
      resource.value = found
    } else {
      notFound.value = true
    }
  } catch (e) {
    console.error('Load resource error:', e)
    notFound.value = true
  }
  loading.value = false
}

// ── 获取 ──
function handleGet() {
  if (!resource.value?.url) return
  if (isMobile.value) {
    window.open(resource.value.url, '_blank')
  } else {
    showQr.value = true
  }
}

onMounted(() => {
  isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window
  loadResource()
})
</script>

<template>
  <div class="resource-detail">
    <!-- ── Masthead：与 CategoryPage 完全一致的导航栏结构 ── -->
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
          <span class="masthead__stat"><strong>资源详情</strong></span>
        </div>
        <nav class="masthead__nav">
          <a href="/" class="nav-link">首页</a>
          <a href="https://t.me/xi7ang" target="_blank" class="nav-cta nav-cta--telegram">✈️ 加入 Telegram</a>
          <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" class="nav-cta nav-cta--qq">💬 加入 QQ群</a>
          <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
            <!-- 暗色 → 太阳图标 -->
            <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <!-- 亮色 → 月亮图标 -->
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </nav>
      </div>
    </header>

    <!-- ── 加载中 ── -->
    <div v-if="loading" class="rd-loading">
      <div class="loading-spinner"></div>
      <p>正在加载资源...</p>
    </div>

    <!-- ── 未找到 ── -->
    <div v-else-if="notFound" class="rd-notfound">
      <div class="rd-notfound-icon">🔍</div>
      <h1>资源未找到</h1>
      <p>该资源不存在或已被移除</p>
      <a href="/" class="rd-btn rd-btn--primary">返回首页</a>
    </div>

    <!-- ── 详情主体 ── -->
    <template v-else-if="resource">
      <!-- 封面区域 -->
      <div class="rd-cover" :style="{ background: `linear-gradient(135deg, ${catMeta.color}33 0%, ${catMeta.color}11 60%, var(--bg-base) 100%)` }">
        <div class="rd-cover-inner">
          <div class="rd-cover-icon">{{ catMeta.emoji }}</div>
          <div class="rd-cover-info">
            <h1 class="rd-title">{{ displayTitle }}</h1>
            <div class="rd-meta-row">
              <span class="rd-badge" :style="{ background: platMeta.bg, color: platMeta.color, borderColor: platMeta.color + '44' }">
                {{ platMeta.icon }} {{ platMeta.label }}
              </span>
              <span class="rd-meta-tag">{{ catMeta.label }}</span>
              <span v-if="res.month" class="rd-meta-tag">{{ fmtMonth(res.month) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="rd-body">
        <!-- 资源简介 -->
        <section class="rd-section">
          <h2 class="rd-section-title">📋 资源简介</h2>
          <p class="rd-desc">
            此资源来自 <strong>{{ catMeta.label }}</strong> 分类，存储于 <strong>{{ platMeta.label }}</strong>。
            点击下方获取方式即可访问资源。如链接失效，请联系站长更新。
          </p>
        </section>

        <!-- 获取方式 -->
        <section class="rd-section">
          <h2 class="rd-section-title">🚀 获取方式</h2>
          <div class="rd-platform-row">
            <span class="rd-platform-info">
              <span class="rd-platform-icon">{{ platMeta.icon }}</span>
              <span class="rd-platform-name" :style="{ color: platMeta.color }">{{ platMeta.label }}</span>
            </span>
            <button class="rd-btn rd-btn--gold rd-btn--lg" @click="handleGet">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <path d="M7 1h6v6M13 1L6 8M3 3H1.5A.5.5 0 001 3.5v8a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              立即获取
            </button>
          </div>
        </section>

        <!-- 资源信息 -->
        <section class="rd-section">
          <h2 class="rd-section-title">ℹ️ 资源信息</h2>
          <div class="rd-info-grid">
            <div class="rd-info-item">
              <span class="rd-info-label">资源名称</span>
              <span class="rd-info-value">{{ displayTitle }}</span>
            </div>
            <div class="rd-info-item">
              <span class="rd-info-label">所属分类</span>
              <span class="rd-info-value">{{ catMeta.label }}</span>
            </div>
            <div class="rd-info-item">
              <span class="rd-info-label">存储平台</span>
              <span class="rd-info-value" :style="{ color: platMeta.color }">{{ platMeta.icon }} {{ platMeta.label }}</span>
            </div>
            <div v-if="res.month" class="rd-info-item">
              <span class="rd-info-label">收录时间</span>
              <span class="rd-info-value">{{ fmtMonth(res.month) }}</span>
            </div>

          </div>
        </section>



        <!-- 返回 -->
        <div class="rd-back">
          <a :href="`/${res.category}/`" class="rd-back-link">
            ← 返回「{{ catMeta.label }}」分类
          </a>
        </div>
      </div>
    </template>

    <QrModal :visible="showQr" :url="res.url" :title="displayTitle" @close="showQr = false" />
  </div>
</template>

<style>
/* ── 详情页专属样式 ── */

.rd-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  color: var(--vp-c-text-3, #8A8A99);
  gap: 1rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(255,255,255,0.08);
  border-top: 3px solid var(--accent-gold, #D4A843);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.rd-notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  color: var(--vp-c-text-2, #8A8A99);
}

.rd-notfound-icon { font-size: 4rem; margin-bottom: 1.5rem; }

.rd-notfound h1 {
  font-size: 1.5rem;
  color: var(--vp-c-text-1, #F0EBE1);
  margin-bottom: 0.5rem;
}

.rd-notfound p { margin-bottom: 2rem; }

/* ── 封面 ── */
.rd-cover {
  padding: 3rem 0 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.rd-cover-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.rd-cover-icon {
  font-size: 3.5rem;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-elv, rgba(255,255,255,0.04));
  border-radius: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.rd-cover-info { flex: 1; min-width: 0; }

.rd-title {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--vp-c-text-1, #F0EBE1);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.rd-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.rd-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
}

.rd-meta-tag {
  padding: 4px 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2, #8A8A99);
}

/* ── 主体 ── */
.rd-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.rd-section { margin-bottom: 2rem; }

.rd-section-title {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1, #F0EBE1);
  margin: 0 0 1rem 0;
}

.rd-desc {
  font-size: 0.95rem;
  color: var(--vp-c-text-2, #8A8A99);
  line-height: 1.8;
  margin: 0;
}

.rd-desc strong { color: var(--accent-gold, #D4A843); }

/* ── 获取方式行 ── */
.rd-platform-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: var(--vp-c-bg-elv, rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.75rem;
  gap: 1rem;
}

.rd-platform-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rd-platform-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.rd-platform-name {
  font-size: 1rem;
  font-weight: 600;
}

/* ── Buttons ── */
.rd-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: all 0.2s ease;
}

.rd-btn--primary {
  background: var(--accent-gold, #D4A843);
  color: #0B0B0D;
}
.rd-btn--primary:hover { opacity: 0.85; }

.rd-btn--gold {
  background: linear-gradient(135deg, var(--accent-gold, #D4A843) 0%, var(--accent-warm, #C97A4A) 100%);
  color: #0B0B0D;
}
.rd-btn--gold:hover {
  opacity: 0.9;
  box-shadow: 0 4px 16px rgba(212,168,67,0.35);
}

.rd-btn--lg { padding: 0.8rem 2rem; font-size: 1rem; }



/* ── Info Grid ── */
.rd-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.rd-info-item {
  padding: 1rem;
  background: var(--vp-c-bg-elv, rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.rd-info-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-3, #55555F);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rd-info-value {
  font-size: 0.95rem;
  color: var(--vp-c-text-1, #F0EBE1);
  word-break: break-all;
}



/* ── Back ── */
.rd-back {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.rd-back-link {
  font-size: 0.9rem;
  color: var(--vp-c-text-2, #8A8A99);
  text-decoration: none;
  transition: color 0.2s;
}

.rd-back-link:hover { color: var(--accent-gold, #D4A843); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .rd-cover-inner { flex-direction: column; text-align: center; }
  .rd-cover-icon { width: 4rem; height: 4rem; font-size: 2.5rem; }
  .rd-meta-row { justify-content: center; }
  .rd-info-grid { grid-template-columns: 1fr; }

}
</style>
