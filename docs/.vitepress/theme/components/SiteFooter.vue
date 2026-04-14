<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-stats">
        <div class="stat-chip">
          <span class="stat-icon">📦</span>
          <span class="stat-text"><strong>{{ totalResources.toLocaleString() }}</strong> 个资源</span>
        </div>
        <div class="stat-chip">
          <span class="stat-icon">🏷️</span>
          <span class="stat-text"><strong>{{ categoryCount }}</strong> 个分类</span>
        </div>
        <div class="stat-chip">
          <span class="stat-icon">👁️</span>
          <span class="stat-text">浏览 <strong>{{ viewCount.toLocaleString() }}</strong> 次</span>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-links">
        <a href="https://devmini.space/blog" target="_blank" rel="noopener">DevMini博客</a>
        <span class="link-sep">·</span>
        <a href="/disclaimer">免责声明</a>
        <span class="link-sep">·</span>
        <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" rel="noopener">QQ群</a>
        <span class="link-sep">·</span>
        <a href="https://t.me/xi7ang" target="_blank" rel="noopener">Telegram</a>
      </div>

      <p class="footer-copy">
        Copyright © 2025-present xi7ang · 3511035605@qq.com
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const allResources = ref<any[]>([])
const viewCount = ref(0)

const totalResources = computed(() => allResources.value.length)
const categoryCount = computed(() => new Set(allResources.value.map(r => r.category)).size)

onMounted(async () => {
  // Load resources
  try {
    const r = await fetch('/data/resources.json')
    const data = await r.json()
    allResources.value = data
  } catch (e) {
    console.error('Failed to load resources:', e)
  }

  // View counter (localStorage-based)
  const KEY = 'xi7ang_site_views_v2'
  const stored = parseInt(String(localStorage.getItem(KEY) || '0'), 10)
  viewCount.value = stored + 1
  localStorage.setItem(KEY, String(viewCount.value))
})
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--vp-c-divider);
  padding: 2rem 1.5rem;
  background: var(--vp-c-bg-soft);
  margin-top: 4rem;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  text-align: center;
}

.footer-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 20px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.stat-icon { font-size: 0.9rem; }
.stat-chip strong { color: var(--vp-c-brand-1); font-weight: 700; }

.footer-divider {
  width: 60px;
  height: 2px;
  background: var(--vp-c-brand-1);
  border-radius: 1px;
  opacity: 0.5;
}

.footer-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  font-size: 0.85rem;
}

.footer-links a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.footer-links a:hover { opacity: 0.75; text-decoration: underline; }

.link-sep { color: var(--vp-c-text-3); }

.footer-copy {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

@media (max-width: 640px) {
  .footer-stats { gap: 0.5rem; }
  .stat-chip { padding: 0.3rem 0.65rem; font-size: 0.75rem; }
}
</style>
