<template>
  <div class="resource-card">
    <!-- Platform stripe -->
    <div class="rc-platform-stripe" style="background: #4A90E2"></div>

    <!-- Header: title + badge -->
    <div class="rc-header">
      <h3 class="rc-title">{{ item.title }}</h3>
      <span class="rc-badge rc-badge--quark">
        🥤 夸克
      </span>
    </div>

    <!-- Meta row -->
    <div class="rc-meta">
      <span class="rc-meta-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M1 5h10" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 2V1M8 2V1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        {{ catLabel(item.category) }}
      </span>
      <span v-if="item.month" class="rc-meta-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        {{ fmtMonth(item.month) }}
      </span>
    </div>

    <!-- Password row (if present) -->
    <div v-if="item.pwd" class="rc-pwd-wrap">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="color:var(--accent-gold);flex-shrink:0">
        <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="rc-pwd-label">提取码</span>
      <span class="rc-pwd-value">{{ item.pwd }}</span>
      <button class="rc-copy-btn" @click.stop="copyPwd" :title="'复制 ' + item.pwd">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <rect x="3.5" y="1" width="6.5" height="8" rx="1" stroke="currentColor" stroke-width="1.1"/>
          <rect x="1" y="2.5" width="6.5" height="8" rx="1" fill="var(--bg-card)" stroke="currentColor" stroke-width="1.1"/>
        </svg>
        {{ pwdCopied ? '已复制' : '复制' }}
      </button>
    </div>

    <!-- Actions -->
    <div class="rc-actions">
      <a
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="rc-btn rc-btn--primary"
        @click.stop
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1h6v6M13 1L6 8M3 3H1.5A.5.5 0 001 3.5v8a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        立即获取
      </a>
      <button class="rc-btn rc-btn--secondary" @click.stop="copyUrl">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="4.5" y="1" width="7.5" height="9.5" rx="1" stroke="currentColor" stroke-width="1.1"/>
          <rect x="1" y="2.5" width="7.5" height="9.5" rx="1" fill="var(--bg-card)" stroke="currentColor" stroke-width="1.1"/>
        </svg>
        {{ urlCopied ? '已复制' : '复制链接' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const pwdCopied = ref(false)
const urlCopied = ref(false)

const CAT_LABELS = {
  'AIknowledge': 'AI知识', 'book': '书籍', 'curriculum': '课程',
  'tools': '工具', 'games': '游戏', 'movies': '影视',
  'healthy': '健康', 'self-media': '自媒体', 'edu-knowlege': '教育',
  'chinese-traditional': '传统文化', 'cross-border': '跨境', 'auto': '自动'
}

function catLabel(cat) {
  return CAT_LABELS[cat] || cat
}

function fmtMonth(month) {
  if (!month) return ''
  return `${month.slice(0,4)}/${month.slice(4,6)}`
}


async function copyPwd() {
  try {
    await navigator.clipboard.writeText(props.item.pwd || '')
    pwdCopied.value = true
    setTimeout(() => { pwdCopied.value = false }, 1500)
  } catch { /* noop */ }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(props.item.url || '')
    urlCopied.value = true
    setTimeout(() => { urlCopied.value = false }, 1500)
  } catch { /* noop */ }
}
</script>

<style scoped>
</style>
