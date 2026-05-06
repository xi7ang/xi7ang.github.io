<template>
  <div class="subscribe-notify">
    <!-- 订阅说明区 -->
    <div class="notify-header">
      <span class="notify-icon">📬</span>
      <span class="notify-title">订阅资源更新通知</span>
    </div>
    <p class="notify-desc">一旦有新的免费资源发布，我们会第一时间通过邮件通知您</p>

    <!-- 订阅表单 -->
    <div class="notify-form">
      <!-- 邮箱输入 + 按钮 -->
      <div class="notify-input-row">
        <div class="notify-input-wrap">
          <input
            v-model="localEmail"
            type="text"
            placeholder="输入邮箱"
            class="notify-input"
            :class="{ shake: shaking }"
            @keydown.enter.prevent="handleAction"
            @focus="inputFocused = true"
            @blur="onBlur"
          />
          <span class="notify-at">@</span>
          <select v-model="suffix" class="notify-suffix" @focus="inputFocused = true" @blur="onBlur">
            <option value="gmail.com">gmail.com</option>
            <option value="qq.com">qq.com</option>
            <option value="163.com">163.com</option>
            <option value="outlook.com">outlook.com</option>
            <option value="126.com">126.com</option>
            <option value="hotmail.com">hotmail.com</option>
            <option value="icloud.com">icloud.com</option>
            <option value="yahoo.com">yahoo.com</option>
            <option value="protonmail.com">protonmail.com</option>
          </select>
        </div>
        <button
          class="notify-btn"
          :class="btnClass"
          :disabled="btnDisabled"
          @click="handleAction"
        >
          <span v-if="status === 'loading'" class="spinner"></span>
          <span v-else-if="step === 'success'">✓ 已订阅</span>
          <span v-else-if="step === 'code'">发送验证码</span>
          <span v-else-if="countDown > 0">{{ countDown }}s</span>
          <span v-else>{{ step === 'email' ? '订阅更新' : '继续' }}</span>
        </button>
      </div>

      <!-- 验证码输入（Step 2） -->
      <div v-if="step === 'code'" class="notify-code-row">
        <div class="notify-code-info">
          <span class="notify-code-hint">验证码已发送至</span>
          <span class="notify-code-email">{{ displayEmail }}</span>
        </div>
        <div class="notify-code-inputs">
          <input
            v-for="(_, i) in codeDigits"
            :key="i"
            :ref="el => codeInputs[i] = el"
            v-model="codeDigits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="notify-code-digit"
            :class="{ shake: shaking }"
            @keydown="onCodeKeydown($event, i)"
            @input="onCodeInput($event, i)"
            @paste="onCodePaste($event)"
          />
        </div>
        <div class="notify-code-actions">
          <button
            class="notify-btn notify-btn--confirm"
            :disabled="loading"
            @click="confirmSubscribe"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>确认订阅</span>
          </button>
          <button
            class="notify-btn notify-btn--resend"
            :disabled="countDown > 0"
            @click="resendCode"
          >
            {{ countDown > 0 ? `${countDown}s 后重发` : '重新获取' }}
          </button>
        </div>
      </div>

      <!-- Turnstile 验证码（仅 Step 1 显示） -->
      <div v-show="step === 'email'" ref="turnstileRef" class="notify-turnstile"></div>

      <!-- 状态消息 -->
      <transition name="fade">
        <div v-if="message" :class="['notify-message', messageType]">
          {{ message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const localEmail = ref('')
const suffix = ref('gmail.com')
const step = ref('email') // email | code | success
const status = ref('idle') // idle | loading
const loading = computed(() => status.value === 'loading')
const message = ref('')
const messageType = ref('')
const shaking = ref(false)
const inputFocused = ref(false)
const countDown = ref(0)
const turnstileToken = ref('')
const turnstileWidgetId = ref(null)
const turnstileRef = ref(null)
const codeInputs = ref([])
const codeDigits = ref(['', '', '', '', '', ''])

let countdownTimer = null

const displayEmail = computed(() => {
  const e = localEmail.value.trim()
  return e ? `${e}@${suffix.value}` : ''
})

const email = computed(() => {
  const e = localEmail.value.trim()
  return e ? `${e}@${suffix.value}` : ''
})

const emailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value)
})

const codeStr = computed(() => codeDigits.value.join(''))

const btnClass = computed(() => {
  if (step.value === 'success') return 'notify-btn--success'
  if (status.value === 'loading') return 'notify-btn--loading'
  return ''
})

const btnDisabled = computed(() => {
  if (status.value === 'loading') return true
  if (step.value === 'success') return true
  if (countDown.value > 0) return true
  if (step.value === 'email' && !emailValid.value) return true
  return false
})

function onBlur() {
  setTimeout(() => { inputFocused.value = false }, 200)
}

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

function startCountdown(seconds = 60) {
  countDown.value = seconds
  countdownTimer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

function onCodeKeydown(e, i) {
  if (e.key === 'Backspace' && !codeDigits.value[i] && i > 0) {
    codeInputs.value[i - 1]?.focus()
  }
  if (e.key === 'Enter') confirmSubscribe()
}

function onCodeInput(e, i) {
  const val = e.target.value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = val
  if (val && i < 5) codeInputs.value[i + 1]?.focus()
}

function onCodePaste(e) {
  const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) codeDigits.value[i] = paste[i] || ''
  codeInputs.value[Math.min(paste.length, 5)]?.focus()
  e.preventDefault()
}

function showMsg(msg, type = 'error') {
  message.value = msg
  messageType.value = type
}

function handleAction() {
  if (step.value === 'email') requestCode()
  else if (step.value === 'code') confirmSubscribe()
}

async function requestCode() {
  if (!email.value) { showMsg('请输入邮箱地址'); triggerShake(); return }
  if (!emailValid.value) { showMsg('邮箱格式不正确'); triggerShake(); return }

  status.value = 'loading'
  message.value = ''

  try {
    const res = await fetch('https://subscribe-email.devmini.space/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, turnstileToken: turnstileToken.value || '' })
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.success) {
      showMsg('验证码已发送，请查收邮件', 'success')
      step.value = 'code'
      startCountdown(60)
      setTimeout(() => codeInputs.value[0]?.focus(), 50)
    } else {
      showMsg(data.error || '请求失败，请稍后重试')
      triggerShake()
    }
  } catch {
    showMsg('网络错误，请稍后重试')
    triggerShake()
  } finally {
    status.value = 'idle'
  }
}

async function confirmSubscribe() {
  if (codeStr.value.length !== 6) { showMsg('请输入完整的6位验证码'); triggerShake(); return }
  status.value = 'loading'
  message.value = ''

  try {
    const res = await fetch('https://subscribe-email.devmini.space/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code: codeStr.value })
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.success) {
      step.value = 'success'
      status.value = 'idle'
      showMsg('订阅成功！资源更新时，你会第一时间收到通知', 'success')
      localEmail.value = ''
      codeDigits.value = ['', '', '', '', '', '']
    } else {
      showMsg(data.error || '订阅失败，请稍后重试')
      if (data.error?.includes('过期') || data.error?.includes('次数')) {
        step.value = 'email'
        codeDigits.value = ['', '', '', '', '', '']
      }
      triggerShake()
    }
  } catch {
    showMsg('网络错误，请稍后重试')
    triggerShake()
  } finally {
    status.value = 'idle'
  }
}

async function resendCode() {
  step.value = 'email'
  message.value = ''
  codeDigits.value = ['', '', '', '', '', '']
  startCountdown(60)
  await requestCode()
}

// ── Turnstile ──────────────────────────────────────────────────────────
onMounted(() => {
  function tryInit() {
    const fn = window.turnstile
    if (fn && typeof fn.render === 'function') {
      turnstileWidgetId.value = fn.render(turnstileRef.value, {
        sitekey: '0x4AAAAAADJOkTQV45736fjS',
        callback: (token) => { turnstileToken.value = token },
        'error-callback': () => { turnstileToken.value = '' },
        'expired-callback': () => { turnstileToken.value = '' },
        theme: 'light',
        size: 'compact',
      })
    } else {
      requestAnimationFrame(tryInit)
    }
  }
  requestAnimationFrame(tryInit)
})

onUnmounted(() => {
  const fn = window.turnstile
  if (fn && turnstileWidgetId.value !== null) {
    fn.remove(turnstileWidgetId.value)
  }
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.subscribe-notify {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
  background: var(--vp-c-bg-soft, #fafafa);
  border: 1px solid var(--vp-c-divider, #e0e0e0);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  box-sizing: border-box;
}

/* ── Header ── */
.notify-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.35rem;
}

.notify-icon {
  font-size: 18px;
  line-height: 1;
}

.notify-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1, #1a1a1a);
  letter-spacing: 0.3px;
}

.notify-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2, #6b6b6b);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

/* ── Form ── */
.notify-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Input Row ── */
.notify-input-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.notify-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--vp-c-bg, #ffffff);
  border: 1.5px solid var(--vp-c-divider, #d0d0d0);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 48px;
}

.notify-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1, #3070e0);
  box-shadow: 0 0 0 3px var(--vp-c-brand-alpha-3, rgba(48,112,224,0.1));
}

.notify-at {
  color: var(--vp-c-text-3, #a0a0a0);
  font-size: 16px;
  flex-shrink: 0;
}

.notify-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--vp-c-text-1, #1a1a1a);
  padding: 10px 6px;
  min-width: 0;
}

.notify-input::placeholder {
  color: var(--vp-c-text-3, #a0a0a0);
}

.notify-input.shake {
  animation: shake 0.4s ease;
}

.notify-suffix {
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--vp-c-text-2, #6b6b6b);
  cursor: pointer;
  padding: 4px 2px;
  direction: ltr;
  min-width: 80px;
}

/* ── Buttons ── */
.notify-btn {
  flex-shrink: 0;
  padding: 0 20px;
  background: var(--vp-c-brand, #3070e0);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, opacity 0.2s, box-shadow 0.2s;
  min-width: 100px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.notify-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark, #2050c0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(48,112,224,0.25);
}

.notify-btn:active:not(:disabled) {
  transform: translateY(0);
}

.notify-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.notify-btn--confirm {
  background: #51cf66;
  flex: 1;
}

.notify-btn--confirm:hover:not(:disabled) {
  background: #3db854;
  box-shadow: 0 4px 12px rgba(81,207,102,0.25);
}

.notify-btn--resend {
  background: var(--vp-c-bg-soft);
  border: 1.5px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-width: 110px;
}

.notify-btn--resend:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: none;
}

.notify-btn--success {
  background: #51cf66;
}

.notify-btn--loading {
  opacity: 0.7;
}

/* ── Code Row ── */
.notify-code-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notify-code-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notify-code-hint {
  font-size: 12px;
  color: var(--vp-c-text-3, #a0a0a0);
}

.notify-code-email {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2, #6b6b6b);
}

.notify-code-inputs {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.notify-code-digit {
  width: 44px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  background: var(--vp-c-bg, #ffffff);
  border: 1.5px solid var(--vp-c-divider, #d0d0d0);
  border-radius: 8px;
  color: var(--vp-c-text-1, #1a1a1a);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  direction: ltr;
  caret-color: var(--vp-c-brand-1, #3070e0);
}

.notify-code-digit:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-alpha-3, rgba(48,112,224,0.1));
}

.notify-code-digit.shake {
  animation: shake 0.4s ease;
}

.notify-code-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* ── Turnstile ── */
.notify-turnstile {
  display: flex;
  justify-content: center;
  min-height: 65px;
  align-items: center;
}

/* ── Messages ── */
.notify-message {
  text-align: center;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
}

.notify-message.success {
  color: #2e7d32;
  background: #e8f5e9;
}

.notify-message.error {
  color: #c62828;
  background: #ffebee;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ========== 响应式：移动端（≤600px） ========== */
@media (max-width: 600px) {
  .subscribe-notify {
    padding: 1.25rem 1rem;
    border-radius: 12px;
  }

  .notify-desc {
    font-size: 0.82rem;
    margin-bottom: 1rem;
  }

  /* 垂直堆叠 */
  .notify-input-row {
    flex-direction: column;
    gap: 10px;
  }

  .notify-input-wrap {
    padding: 0 10px;
    min-height: 50px;
  }

  .notify-btn {
    width: 100%;
    padding: 0;
    min-height: 50px;
    font-size: 15px;
    border-radius: 10px;
  }

  .notify-btn--resend {
    min-height: 44px;
    font-size: 13px;
  }

  .notify-input {
    padding: 12px 6px;
    font-size: 15px;
  }

  .notify-suffix {
    font-size: 14px;
  }

  /* 验证码输入 */
  .notify-code-digit {
    width: 40px;
    height: 48px;
    font-size: 18px;
  }

  .notify-code-inputs {
    gap: 5px;
  }

  .notify-code-actions {
    flex-direction: column;
    gap: 8px;
  }

  .notify-btn--confirm {
    font-size: 15px;
  }
}

/* ========== 超小屏幕（≤400px） ========== */
@media (max-width: 400px) {
  .subscribe-notify {
    padding: 1rem 0.875rem;
    border-radius: 10px;
  }

  .notify-input-wrap {
    padding: 0 8px;
  }

  .notify-code-digit {
    width: 36px;
    height: 44px;
    font-size: 16px;
  }

  .notify-code-inputs {
    gap: 4px;
  }
}
</style>