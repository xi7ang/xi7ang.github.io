<template>
  <Teleport to="body">
    <div v-if="visible" class="qr-modal-overlay" @click.self="close" @keydown.escape="close" tabindex="-1" ref="overlayRef">
      <div class="qr-modal-card">
        <button class="qr-modal-close" @click="close" aria-label="关闭">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="qr-modal-body">
          <canvas ref="canvasRef" class="qr-canvas"></canvas>
          <p class="qr-modal-title">{{ title }}</p>
          <p class="qr-modal-hint">📱 请使用手机扫码获取资源</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  visible: { type: Boolean, default: false },
  url: { type: String, default: '' },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const canvasRef = ref(null)
const overlayRef = ref(null)

function close() {
  emit('close')
}

function renderQr() {
  if (!props.visible || !canvasRef.value || !props.url) return
  QRCode.toCanvas(canvasRef.value, props.url, {
    width: 200,
    margin: 2,
    color: {
      dark: '#E8D5A3',
      light: '#1A1A1E'
    }
  })
}

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(() => {
      renderQr()
      overlayRef.value?.focus()
    })
  }
})

function onKeydown(e) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => {
  renderQr()
  document.addEventListener('keydown', onKeydown)
})
</script>
