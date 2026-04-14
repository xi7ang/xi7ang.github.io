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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import HomepageHero from '../components/HomepageHero.vue'
import CategoryPage from '../components/CategoryPage.vue'

const route = useRoute()

const CATEGORIES = [
  'AIknowledge', 'book', 'chinese-traditional', 'cross-border',
  'curriculum', 'edu-knowlege', 'games', 'healthy',
  'movies', 'self-media', 'tools', 'auto', 'movie-recommendations',
]

const isHome = computed(() => route.path === '/')

const isCategory = computed(() => {
  const segments = route.path.replace(/^\//, '').split('/')
  return CATEGORIES.includes(segments[0]) && (segments[1] === '' || segments[1]?.startsWith('?'))
})

const currentCategory = computed(() => {
  const segments = route.path.replace(/^\//, '').split('/')
  return segments[0] || ''
})
</script>

<style scoped>
.custom-layout {
  min-height: 100vh;
}

.default-content {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
