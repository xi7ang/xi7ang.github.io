<template>
  <div class="resource-grid" :class="`cols-${columns}`">
    <template v-if="resources && resources.length">
      <ResourceCard
        v-for="(resource, idx) in resources"
        :key="`${resource.category}-${resource.month}-${idx}`"
        :resource="resource"
        :compact="compact"
      />
    </template>
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p>暂无资源</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResourceCard from './ResourceCard.vue'
import type { Resource } from './ResourceCard.vue'

withDefaults(defineProps<{
  resources: Resource[]
  columns?: 1 | 2 | 3
  compact?: boolean
}>(), {
  columns: 2,
  compact: false,
})
</script>

<style scoped>
.resource-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.resource-grid.cols-1 { grid-template-columns: 1fr; }

@media (min-width: 640px) {
  .resource-grid.cols-2,
  .resource-grid.cols-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .resource-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
}

.empty-icon { font-size: 3rem; margin-bottom: 0.75rem; }
.empty-state p { font-size: 1.1rem; margin: 0; }
</style>
