<template>
  <component v-if="currentLayout" :is="currentLayout" v-bind="layoutProps" />
  <Content v-else />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import HomepageHero from '../components/HomepageHero.vue'
import CategoryPage from '../components/CategoryPage.vue'
import ResourceDetail from '../components/ResourceDetail.vue'

onMounted(() => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
    script.defer = true
    document.head.appendChild(script)
  }
})

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
const isResource = computed(() => route.path.startsWith('/resource'))

const currentCategory = computed(() => {
  const path = route.path.replace(/\/$/, '')
  const seg = path.split('/').filter(Boolean).pop()
  return CATEGORIES.includes(seg) ? seg : null
})

const currentLayout = computed(() => {
  if (isHome.value) return HomepageHero
  if (currentCategory.value) return CategoryPage
  if (isResource.value) return ResourceDetail
  return null
})

const layoutProps = computed(() => {
  if (currentCategory.value) return { category: currentCategory.value }
  return {}
})
</script>
