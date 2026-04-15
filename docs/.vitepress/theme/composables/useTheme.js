import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'panna-theme'

// SSR guard — only run in browser
const isBrowser = typeof window !== 'undefined'

// Global shared state — singleton across all component instances
const theme = ref(
  isBrowser
    ? (localStorage.getItem(STORAGE_KEY) ||
       (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))
    : 'dark'
)

function applyTheme(val) {
  if (!isBrowser) return
  document.documentElement.dataset.theme = val
  localStorage.setItem(STORAGE_KEY, val)
}

// Apply immediately on first import (browser only)
if (isBrowser) {
  applyTheme(theme.value)
}

// Watch and sync
watchEffect(() => {
  if (isBrowser) {
    applyTheme(theme.value)
  }
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
