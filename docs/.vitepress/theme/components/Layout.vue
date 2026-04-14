<template>
  <component :is="currentLayout" v-bind="layoutProps" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import HomepageHero from '../components/HomepageHero.vue'
import CategoryPage from '../components/CategoryPage.vue'

const props = defineProps({
  frontmatter: { type: Object, default: () => ({}) }
})

const route = useRoute()

const CATEGORIES = [
  'AIknowledge', 'book', 'curriculum', 'tools', 'games',
  'movies', 'healthy', 'self-media', 'edu-knowlege',
  'chinese-traditional', 'cross-border', 'auto'
]

const isHome = computed(() => route.path === '/' || route.path === '/index.html')

const currentCategory = computed(() => {
  const path = route.path.replace(/\/$/, '')
  const seg = path.split('/').filter(Boolean).pop()
  return CATEGORIES.includes(seg) ? seg : null
})

const currentLayout = computed(() => {
  if (isHome.value) return HomepageHero
  if (currentCategory.value) return CategoryPage
  return HomepageHero
})

const layoutProps = computed(() => {
  if (currentCategory.value) return { category: currentCategory.value }
  return {}
})
</script>
