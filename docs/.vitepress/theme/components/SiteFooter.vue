<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="brand__name" style="font-size:16px">devmini</span>
          <p class="footer-desc">{{ descText }}</p>
        </div>
        <div class="footer-links">
          <a href="/">返回首页</a>
          <a href="/disclaimer">免责声明</a>
          <a href="/support">支持本站</a>
          <a href="https://t.me/xi7ang" target="_blank">Telegram</a>
          <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank">QQ群</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categoryLabel: { type: String, default: '' }
})

const descText = computed(() => {
  if (props.categoryLabel) {
    return `免费资源导航 · ${props.categoryLabel}分类`
  }
  return '免费资源导航 · 持续更新 · 分类整理'
})
</script>
