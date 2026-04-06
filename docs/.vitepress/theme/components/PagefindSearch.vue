<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const searchOpen = ref(false)
const query = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const container = ref<HTMLElement | null>(null)
const searchError = ref(false)

// 单例：整个页面生命周期只加载一次 pagefind
let pagefindInstance: any = null
let pagefindLoading: Promise<any> | null = null

function loadPagefind(): Promise<any> {
  if (pagefindInstance) return Promise.resolve(pagefindInstance)
  if (pagefindLoading) return pagefindLoading

  pagefindLoading = new Promise((resolve, reject) => {
    // pagefind-ui.js 是自包含的预构建文件
    // 它包含完整的 PagefindUI 类，设置 window.PagefindUI
    if ((window as any).PagefindUI) {
      try {
        // 创建隐藏容器，只使用其底层 search API
        const el = document.createElement('div')
        el.style.display = 'none'
        el.style.position = 'absolute'
        el.style.left = '-9999px'
        document.body.appendChild(el)

        pagefindInstance = new (window as any).PagefindUI({
          element: el,
          bundlePath: '/pagefind',
          resetStyles: false,
          showImages: false,
          showSubResults: false,
          autofocus: false,
          debounceTimeoutMs: 0,
        })
        console.log('[Pagefind] 初始化成功')
        resolve(pagefindInstance)
      } catch (e: any) {
        console.error('[Pagefind] 初始化失败:', e)
        reject(e)
      }
      return
    }

    // 动态加载 pagefind-ui.js
    const script = document.createElement('script')
    script.src = '/pagefind/pagefind-ui.js'
    script.type = 'module'
    script.onload = () => {
      try {
        const el = document.createElement('div')
        el.style.display = 'none'
        el.style.position = 'absolute'
        el.style.left = '-9999px'
        document.body.appendChild(el)

        pagefindInstance = new (window as any).PagefindUI({
          element: el,
          bundlePath: '/pagefind',
          resetStyles: false,
          showImages: false,
          showSubResults: false,
          autofocus: false,
          debounceTimeoutMs: 0,
        })
        console.log('[Pagefind] 初始化成功')
        resolve(pagefindInstance)
      } catch (e: any) {
        console.error('[Pagefind] 初始化失败:', e)
        reject(e)
      }
    }
    script.onerror = (e) => {
      console.error('[Pagefind] 脚本加载失败:', e)
      reject(new Error('pagefind-ui.js 加载失败'))
    }
    document.head.appendChild(script)
  })

  return pagefindLoading
}

async function doSearch(q: string) {
  if (!q.trim()) {
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  searchError.value = false

  try {
    const pf = await loadPagefind()

    if (!pf) {
      console.error('[Pagefind] 实例为空')
      loading.value = false
      searchError.value = true
      return
    }

    // PagefindUI 实例的 search 方法返回 PagefindSearch 对象
    // 该对象的 .results 是同步的数组，每个元素有 .data() 方法（返回 Promise）
    const searchResult = pf.search(q)

    // searchResult.results 是 PagefindSearchResult[]（非 Promise）
    const rawResults = searchResult.results || []

    if (rawResults.length === 0) {
      results.value = []
      loading.value = false
      return
    }

    // 每个 .data() 返回 Promise<ResultData>
    const data = await Promise.all(
      rawResults.slice(0, 8).map((r: any) => r.data())
    )

    results.value = data
    console.log(`[Pagefind] 搜索「${q}」: ${data.length} 条结果`)
  } catch (e: any) {
    console.error('[Pagefind] 搜索异常:', e)
    searchError.value = true
    results.value = []
  }

  loading.value = false
}

// 防抖
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  query.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => doSearch(val), 250)
}

function toggle() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    query.value = ''
    results.value = []
    loading.value = false
    searchError.value = false
    setTimeout(() => searchInput.value?.focus(), 50)
  }
}

function onClickOutside(e: MouseEvent) {
  if (container.value && !container.value.contains(e.target as Node)) {
    searchOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    searchOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  // 预加载 pagefind（不阻塞 UI）
  loadPagefind().catch(() => {})
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="pagefind-search-wrapper" ref="container">
    <!-- 搜索按钮 -->
    <button class="pagefind-search-btn" @click.stop="toggle" aria-label="搜索">
      <span class="search-icon">🔍</span>
      <span class="search-placeholder">Search</span>
      <kbd class="search-kbd">K</kbd>
    </button>

    <!-- 搜索弹窗 -->
    <Transition name="search-popup">
      <div v-if="searchOpen" class="pagefind-search-modal" @click.stop @keydown="onKeydown">
        <!-- 搜索框 -->
        <div class="search-input-row">
          <span class="input-icon">🔍</span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            class="search-input"
            placeholder="搜索资源名称、关键词..."
            @input="onInput"
            autocomplete="off"
          />
          <button v-if="loading" class="loading-indicator">
            <span class="spin-loader"></span>
          </button>
          <button v-else class="close-btn" @click="searchOpen = false">✕</button>
        </div>

        <!-- 结果 -->
        <div class="search-results" role="listbox">
          <!-- 错误状态 -->
          <div v-if="searchError" class="search-state error">
            <p>搜索服务暂时不可用</p>
            <p class="search-tip">请刷新页面后重试</p>
          </div>

          <!-- 加载中 -->
          <div v-else-if="loading" class="search-state loading">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p>搜索中...</p>
          </div>

          <!-- 无结果 -->
          <div v-else-if="query && results.length === 0" class="search-state empty">
            <p>未找到「{{ query }}」相关结果</p>
            <p class="search-tip">试试更简短的关键词，或浏览分类页面</p>
          </div>

          <!-- 结果列表 -->
          <div v-else-if="results.length > 0" class="results-list">
            <a
              v-for="result in results"
              :key="result.url"
              :href="result.url"
              class="result-item"
              role="option"
              @click="searchOpen = false"
            >
              <div class="result-content">
                <div class="result-title" v-html="result.meta?.title || '无标题'"></div>
                <div class="result-excerpt" v-html="result.excerpt"></div>
                <div class="result-url">{{ result.url }}</div>
              </div>
              <span class="result-arrow">→</span>
            </a>
          </div>

          <!-- 初始状态 -->
          <div v-else class="search-state hint">
            <p>输入关键词开始搜索</p>
            <div class="search-hot">
              <span class="hot-label">热门:</span>
              <button
                v-for="kw in ['Claude', 'AI教程', 'TikTok', '新能源汽车', '书籍']"
                :key="kw"
                class="hot-tag"
                @click="query = kw; doSearch(kw)"
              >{{ kw }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* ============================================================
   Pagefind 搜索组件样式
   ============================================================ */

.pagefind-search-wrapper {
  position: relative;
}

/* 搜索按钮 */
.pagefind-search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #FFFFFF;
  border: 2px solid #111111;
  border-radius: 0;
  box-shadow: 3px 3px 0 #111111;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  color: #888888;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pagefind-search-btn:hover {
  background: #F5F5F0;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #111111;
}

.dark .pagefind-search-btn {
  background: #1A1A1A;
  border-color: #FFFFFF;
  color: #AAAAAA;
  box-shadow: 3px 3px 0 #FFFFFF;
}

.dark .pagefind-search-btn:hover {
  background: #222222;
  box-shadow: 4px 4px 0 #FFFFFF;
}

.search-icon { font-size: 0.9rem; }
.search-placeholder { font-weight: 600; }

.search-kbd {
  font-size: 0.7rem;
  font-weight: 700;
  background: #F0F0EB;
  border: 1px solid #CCCCCC;
  border-radius: 3px;
  padding: 1px 5px;
  color: #888888;
  font-family: inherit;
}

.dark .search-kbd {
  background: #2A2A2A;
  border-color: #444444;
  color: #888888;
}

/* 弹窗 */
.pagefind-search-modal {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 520px;
  max-width: 90vw;
  background: #FFFFFF;
  border: 3px solid #111111;
  box-shadow: 8px 8px 0 #111111;
  z-index: 9999;
  overflow: hidden;
}

.dark .pagefind-search-modal {
  background: #111111;
  border-color: #FFFFFF;
  box-shadow: 8px 8px 0 #FFFFFF;
}

/* 搜索输入行 */
.search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 2px solid #E0E0DA;
  background: #FAFAFA;
}

.dark .search-input-row {
  border-bottom-color: #333333;
  background: #0E0E0E;
}

.input-icon { font-size: 1.1rem; flex-shrink: 0; }

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  font-weight: 600;
  color: #111111;
  font-family: inherit;
  min-width: 0;
}

.dark .search-input { color: #FFFFFF; }
.search-input::placeholder { color: #AAAAAA; font-weight: 400; }
.search-input::-webkit-search-cancel-button { display: none; }

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888888;
  padding: 4px;
  line-height: 1;
  flex-shrink: 0;
  font-family: inherit;
}

.close-btn:hover { color: #111111; }
.dark .close-btn:hover { color: #FFFFFF; }

/* 加载动画 */
.loading-indicator {
  background: none;
  border: none;
  cursor: default;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spin-loader {
  width: 14px;
  height: 14px;
  border: 2px solid #E0E0DA;
  border-top-color: #FF3AF2;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 结果区 */
.search-results {
  max-height: 420px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.search-results::-webkit-scrollbar { width: 6px; }
.search-results::-webkit-scrollbar-track { background: #F5F5F0; }
.search-results::-webkit-scrollbar-thumb { background: #CCCCCC; border-radius: 3px; }

/* 状态 */
.search-state {
  padding: 28px 20px;
  text-align: center;
  color: #888888;
  font-size: 0.9rem;
}

.search-state p { margin: 0; }
.search-tip {
  margin-top: 6px !important;
  font-size: 0.8rem !important;
  color: #BBBBBB !important;
}

.search-state.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #FF3AF2;
  border-radius: 50%;
  animation: bounce 0.6s ease infinite alternate;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  to { transform: translateY(-6px); opacity: 0.4; }
}

/* 热门标签 */
.search-hot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.hot-label { font-weight: 700; font-size: 0.8rem; color: #888888; }

.hot-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #F0F0EB;
  border: 1.5px solid #CCCCCC;
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #555555;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.hot-tag:hover {
  background: #FF3AF2;
  border-color: #FF3AF2;
  color: #FFFFFF;
}

/* 结果列表 */
.results-list { padding: 8px 0; }

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  transition: background 0.1s;
  border-bottom: 1px solid #F0F0EB;
}

.result-item:last-child { border-bottom: none; }
.result-item:hover { background: #F5F5F0; }
.dark .result-item:hover { background: #1A1A1A; }
.dark .result-item { border-bottom-color: #222222; }

.result-content { flex: 1; min-width: 0; }

.result-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: #111111;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .result-title { color: #FFFFFF; }

.result-excerpt {
  font-size: 0.8rem;
  color: #888888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.result-excerpt mark {
  background: rgba(255, 230, 0, 0.5);
  color: #111111;
  font-weight: 700;
  padding: 0 2px;
  border-radius: 2px;
}

.dark .result-excerpt mark {
  background: rgba(255, 58, 242, 0.3);
  color: #FFFFFF;
}

.result-url {
  font-size: 0.72rem;
  color: #BBBBBB;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-arrow {
  font-size: 1.1rem;
  font-weight: 900;
  color: #CCCCCC;
  flex-shrink: 0;
  transition: all 0.15s;
}

.result-item:hover .result-arrow {
  color: #FF3AF2;
  transform: translateX(3px);
}

/* 过渡动画 */
.search-popup-enter-active,
.search-popup-leave-active {
  transition: all 0.15s ease;
}

.search-popup-enter-from,
.search-popup-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* 响应式 */
@media (max-width: 640px) {
  .pagefind-search-modal {
    position: fixed;
    top: 0 !important;
    right: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    border: none;
    box-shadow: none;
  }

  .search-results {
    max-height: none;
    height: calc(100vh - 70px);
  }

  .search-popup-enter-from,
  .search-popup-leave-to {
    transform: translateY(20px);
  }
}
</style>
