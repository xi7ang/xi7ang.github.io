<template>
  <div class="layout">
    <HomepageHero v-if="isHome" />
    <CategoryPage
      v-else-if="isCategory"
      :category="currentCategory"
      :key="route.path"
    />
    <div v-else class="default">
      <Content />
    </div>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import HomepageHero from '../components/HomepageHero.vue'
import CategoryPage from '../components/CategoryPage.vue'
import SiteFooter from '../components/SiteFooter.vue'

const route = useRoute()

const CATS = [
  'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
  'curriculum', 'edu-knowlege', 'games', 'healthy',
  'movies', 'self-media', 'tools', 'auto',
]

const isHome = computed(() => route.path === '/' || route.path === '/index')

const isCategory = computed(() => {
  const seg = route.path.replace(/^\//, '').split('/')[0]
  return CATS.includes(seg)
})

const currentCategory = computed(() => route.path.replace(/^\//, '').split('/')[0])
</script>

<style scoped>
.layout { min-height: 100vh; }
.default { max-width: var(--vp-layout-max-width); margin: 0 auto; padding: 2rem 1.5rem; }
</style>
