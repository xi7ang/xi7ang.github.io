<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import CommitHistory from './CommitHistory.vue'
import PagefindSearch from './PagefindSearch.vue'

const { frontmatter } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 注入搜索组件到导航栏内容区 -->
    <template #nav-bar-content-before>
      <PagefindSearch class="navbar-search" />
    </template>

    <!-- CommitHistory 仍在首页 hero 下方 -->
    <template #home-hero-after>
      <CommitHistory />
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
/* PagefindSearch 在导航栏中的定位 */
:deep(.navbar-search) {
  margin-left: auto;
}
</style>
