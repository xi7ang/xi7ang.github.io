<template>
  <div class="custom-layout">
    <HomepageHero v-if="isHome" />
    <CategoryPage
      v-else-if="isCategory"
      :category="currentCategory"
    />
    <div v-else class="default-content">
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

const CATEGORIES = [
  'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
  'curriculum', 'edu-knowlege', 'games', 'healthy',
  'movies', 'self-media', 'tools', 'auto', 'movie-recommendations',
]

const isHome = computed(() => route.path === '/')

const isCategory = computed(() => {
  const segs = route.path.replace(/^\//, '').split('/')
  return CATEGORIES.includes(segs[0]) && (segs[1] === '' || !segs[1] || segs[1]?.startsWith('?'))
})

const currentCategory = computed(() => {
  const segs = route.path.replace(/^\//, '').split('/')
  return segs[0] || ''
})
</script>

<style scoped>
.custom-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.default-content {
  flex: 1;
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
}
</style>
