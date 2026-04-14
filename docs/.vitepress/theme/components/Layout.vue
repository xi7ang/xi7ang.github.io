<template>
  <component :is="currentLayout" v-bind="layoutProps" />
</template>

<script setup>
import { computed } from 'vue'
import HomepageHero from '../components/HomepageHero.vue'
import CategoryPage from '../components/CategoryPage.vue'

const props = defineProps({
  frontmatter: { type: Object, default: () => ({}) }
})

const route = typeof window !== 'undefined' ? window.location.pathname : '/'

const isHome = computed(() => route === '/' || route === '/index.html')

const CATEGORIES = [
  'AIknowledge', 'book', 'curriculum', 'tools', 'games',
  'movies', 'healthy', 'self-media', 'edu-knowlege',
  'chinese-traditional', 'cross-border', 'auto'
]

const currentCategory = computed(() => {
  const parts = route.replace(/\/$/, '').split('/')
  const cat = parts[parts.length - 1]
  return CATEGORIES.includes(cat) ? cat : null
})

const currentLayout = computed(() => {
  if (isHome.value) return HomepageHero
  if (currentCategory.value) return CategoryPage
  return HomepageHero // fallback
})

const layoutProps = computed(() => {
  if (currentCategory.value) {
    return { category: currentCategory.value }
  }
  return {}
})
</script>
