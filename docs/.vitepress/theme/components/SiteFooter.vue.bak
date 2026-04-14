<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-stats">
        <div class="stat-chip">
          <span class="stat-val">{{ totalResources.toLocaleString() }}</span>
          <span class="stat-sep">/</span>
          <span class="stat-lbl">资源</span>
        </div>
        <div class="stat-chip">
          <span class="stat-val">{{ categoryCount }}</span>
          <span class="stat-sep">/</span>
          <span class="stat-lbl">分类</span>
        </div>
        <div class="stat-chip">
          <span class="stat-val">{{ viewCount.toLocaleString() }}</span>
          <span class="stat-sep">/</span>
          <span class="stat-lbl">浏览</span>
        </div>
      </div>

      <div class="footer-links">
        <a href="https://devmini.space/blog" target="_blank" rel="noopener">DevMini博客</a>
        <span class="link-dot"></span>
        <a href="/disclaimer">免责声明</a>
        <span class="link-dot"></span>
        <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" rel="noopener">QQ群</a>
        <span class="link-dot"></span>
        <a href="https://t.me/xi7ang" target="_blank" rel="noopener">Telegram</a>
      </div>

      <p class="footer-copy">Copyright &copy; 2025-present xi7ang &middot; 3511035605@qq.com</p>
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
  try {
    const r = await fetch('/data/resources.json')
    allResources.value = await r.json()
  } catch (e) {}
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
  margin-top: 3rem;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.footer-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.stat-val { font-weight: 700; color: var(--vp-c-brand-1); font-size: 0.95rem; }
.stat-sep { color: var(--vp-c-text-3); }
.stat-lbl { color: var(--vp-c-text-3); }

.footer-links {
  display: flex;
  gap: 0.75rem;
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
.footer-links a:hover { opacity: 0.75; }

.link-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  display: inline-block;
}

.footer-copy {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

@media (max-width: 640px) {
  .footer-stats { gap: 1rem; }
}
</style>
