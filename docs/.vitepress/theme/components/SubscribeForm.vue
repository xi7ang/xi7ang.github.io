<template>
  <div class="subscribe-form">
    <div class="subscribe-form__card">

      <!-- Header -->
      <div class="subscribe-form__header">
        <span class="subscribe-form__icon">📬</span>
        <span class="subscribe-form__title">订阅资源更新通知</span>
      </div>
      <p class="subscribe-form__desc">新资源上架，第一时间通知你</p>

      <!-- ── Step 1: Email + Get Code ── -->
      <div v-if="step === 'email'" class="subscribe-form__step">
        <!-- 邮箱输入框 -->
        <input
          v-model="localEmail"
          type="email"
          placeholder="请输入邮箱地址"
          class="subscribe-form__email-input"
          :class="{ 'shake': shaking }"
          @keydown.enter.prevent="requestCode"
          @focus="inputFocused = true"
          @blur="onBlur"
        />

        <!-- 按钮 + Turnstile 垂直堆叠 -->
        <div class="subscribe-form__action-group">
          <button
            class="subscribe-form__btn subscribe-form__btn--code"
            @click="requestCode"
            :disabled="loading || !emailValid || countDown > 0"
          >
            <span v-if="countDown > 0">{{ countDown }}s</span>
            <span v-else-if="loading"><span class="spinner"></span></span>
            <span v-else>获取验证码</span>
          </button>

          <!-- Turnstile 嵌入在按钮下方 -->
          <div class="subscribe-form__turnstile-wrap">
            <div id="turnstile-container"></div>
          </div>
        </div>

        <div v-if="errorMsg" class="subscribe-form__error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="subscribe-form__success">{{ successMsg }}</div>
      </div>

      <!-- ── Step 2: Code Input ── -->
      <div v-if="step === 'code'" class="subscribe-form__step">
        <div class="subscribe-form__code-row">
          <div class="subscribe-form__code-info">
            <span class="subscribe-form__code-hint">验证码已发送至</span>
            <span class="subscribe-form__code-email">{{ localEmail }}</span>
          </div>
          <div class="subscribe-form__code-inputs">
            <input
              v-for="(_, i) in codeDigits"
              :key="i"
              :ref="el => codeInputs[i] = el as HTMLInputElement"
              v-model="codeDigits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="subscribe-form__code-digit"
              :class="{ 'shake': shaking }"
              @keydown="onCodeKeydown($event, i)"
              @input="onCodeInput($event, i)"
              @paste="onCodePaste($event)"
            />
          </div>
          <div class="subscribe-form__code-actions">
            <button
              class="subscribe-form__btn subscribe-form__btn--confirm"
              @click="confirmSubscribe"
              :disabled="loading"
            >
              <span v-if="!loading">确认订阅</span>
              <span v-else class="spinner"></span>
            </button>
            <button
              class="subscribe-form__btn subscribe-form__btn--small"
              @click="resendCode"
              :disabled="countDown > 0"
            >
              {{ countDown > 0 ? `${countDown}s 后重发` : '重新获取' }}
            </button>
          </div>
          <div v-if="errorMsg" class="subscribe-form__error">{{ errorMsg }}</div>
        </div>
      </div>

      <!-- ── Step 3: Success ── -->
      <div v-if="step === 'success'" class="subscribe-form__step subscribe-form__success-panel">
        <div class="subscribe-form__success-icon">✅</div>
        <div class="subscribe-form__success-text">订阅成功！</div>
        <div class="subscribe-form__success-sub">资源更新时，你会第一时间收到通知</div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const localEmail = ref('')
const step = ref('email')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const shaking = ref(false)
const inputFocused = ref(false)
const countDown = ref(0)
const turnstileToken = ref('')
const turnstileWidgetId = ref<number | null>(null)
const codeInputs = ref<HTMLInputElement[]>([])
const codeDigits = ref(['', '', '', '', '', ''])

const email = computed(() => localEmail.value.trim())

const emailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value)
})

const codeStr = computed(() => codeDigits.value.join(''))

let countdownTimer: ReturnType<typeof setInterval> | null = null

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
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

function onCodeKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'Backspace' && !codeDigits.value[i] && i > 0) {
    codeInputs.value[i - 1]?.focus()
  }
  if (e.key === 'Enter') {
    confirmSubscribe()
  }
}

function onCodeInput(e: Event, i: number) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = val
  if (val && i < 5) {
    codeInputs.value[i + 1]?.focus()
  }
}

function onCodePaste(e: ClipboardEvent) {
  const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    codeDigits.value[i] = paste[i] || ''
  }
  codeInputs.value[Math.min(paste.length, 5)]?.focus()
  e.preventDefault()
}

// ── Step 1: Request Code ─────────────────────────────────────────────────
async function requestCode() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!email.value) {
    errorMsg.value = '请输入邮箱地址'
    triggerShake()
    return
  }

  if (!emailValid.value) {
    errorMsg.value = '邮箱格式不正确'
    triggerShake()
    return
  }

  loading.value = true

  try {
    const res = await fetch('https://subscribe-email-worker.wsheng-980210.workers.dev/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        turnstileToken: turnstileToken.value || ''
      })
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success) {
      successMsg.value = '验证码已发送，请查收邮件'
      step.value = 'code'
      startCountdown(60)
      setTimeout(() => codeInputs.value[0]?.focus(), 50)
    } else {
      errorMsg.value = data.error || '请求失败，请稍后重试'
      triggerShake()
    }
  } catch (e) {
    errorMsg.value = '网络错误，请稍后重试'
    triggerShake()
  } finally {
    loading.value = false
  }
}

// ── Step 2: Confirm Subscribe ────────────────────────────────────────────
async function confirmSubscribe() {
  if (codeStr.value.length !== 6) {
    errorMsg.value = '请输入完整的6位验证码'
    triggerShake()
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch('https://subscribe-email-worker.wsheng-980210.workers.dev/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        code: codeStr.value,
      })
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success) {
      step.value = 'success'
      localEmail.value = ''
      codeDigits.value = ['', '', '', '', '', '']
    } else {
      errorMsg.value = data.error || '订阅失败，请稍后重试'
      if (data.error?.includes('过期') || data.error?.includes('次数')) {
        step.value = 'email'
        codeDigits.value = ['', '', '', '', '', '']
      }
      triggerShake()
    }
  } catch (e) {
    errorMsg.value = '网络错误，请稍后重试'
    triggerShake()
  } finally {
    loading.value = false
  }
}

// ── Resend code ───────────────────────────────────────────────────────────
async function resendCode() {
  step.value = 'email'
  successMsg.value = ''
  errorMsg.value = ''
  codeDigits.value = ['', '', '', '', '', '']
  startCountdown(60)
  await requestCode()
}

// ── Turnstile ─────────────────────────────────────────────────────────────

function initTurnstile() {
  const fn = (window as any).turnstile
  if (fn && typeof fn.render === 'function') {
    turnstileWidgetId.value = fn.render('turnstile-container', {
      sitekey: '0x4AAAAAADJOkTQV45736fjS',
      callback: (token: string) => { turnstileToken.value = token },
      'error-callback': () => { turnstileToken.value = '' },
      'expired-callback': () => { turnstileToken.value = '' },
      theme: 'dark',
      size: 'compact',
    })
  }
}

onMounted(() => {
  // Small delay to ensure the DOM element is ready
  requestAnimationFrame(() => {
    requestAnimationFrame(initTurnstile)
  })
})

onUnmounted(() => {
  const fn = (window as any).turnstile
  if (fn && turnstileWidgetId.value !== null) {
    fn.remove(turnstileWidgetId.value)
  }
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.subscribe-form {
  width: 100%;
  margin-top: 20px;
}

.subscribe-form__card {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  background: rgba(245, 166, 35, 0.06);
  border: 1.5px solid rgba(245, 166, 35, 0.3);
  border-radius: 14px;
  padding: 20px 20px 18px;
  box-shadow:
    0 0 0 1px rgba(245, 166, 35, 0.08),
    0 4px 24px rgba(245, 166, 35, 0.08);
}

.subscribe-form__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.subscribe-form__icon {
  font-size: 20px;
  line-height: 1;
}

.subscribe-form__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent-gold, #F5A623);
  letter-spacing: 0.3px;
}

.subscribe-form__desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 14px 0;
}

.subscribe-form__step {
  /* empty */
}

/* ── Email Input ── */
.subscribe-form__email-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  caret-color: var(--accent-gold);
  min-height: 50px;
  box-sizing: border-box;
}

.subscribe-form__email-input::placeholder {
  color: var(--text-muted);
}

.subscribe-form__email-input:focus {
  border-color: rgba(245, 166, 35, 0.5);
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
}

.subscribe-form__email-input.shake {
  animation: shake 0.4s ease;
}

/* ── Action Group (button + turnstile) ── */
.subscribe-form__action-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
}

/* ── Buttons ── */
.subscribe-form__btn {
  background: linear-gradient(135deg, #F5A623 0%, #FF8C00 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.3px;
}

.subscribe-form__btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f7b84b 0%, #ffa033 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
}

.subscribe-form__btn:active:not(:disabled) {
  transform: translateY(0);
}

.subscribe-form__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 代码按钮 — 最大宽度限制，居中显示 */
.subscribe-form__btn--code {
  width: 100%;
  max-width: 240px;
  min-height: 48px;
  padding: 0 20px;
}

.subscribe-form__btn--small {
  min-height: 40px;
  font-size: 12px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  color: var(--text-secondary);
  border-radius: 8px;
}

.subscribe-form__btn--small:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: none;
  box-shadow: none;
}

/* ── Turnstile container ── */
.subscribe-form__turnstile-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

#turnstile-container {
  display: flex;
  justify-content: center;
}

/* ── Code Input ── */
.subscribe-form__code-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscribe-form__code-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subscribe-form__code-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.subscribe-form__code-email {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.subscribe-form__code-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.subscribe-form__code-digit {
  width: 48px;
  height: 52px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  direction: ltr;
  caret-color: var(--accent-gold);
}

.subscribe-form__code-digit:focus {
  border-color: rgba(245, 166, 35, 0.6);
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.12);
}

.subscribe-form__code-digit.shake {
  animation: shake 0.4s ease;
}

.subscribe-form__code-actions {
  display: flex;
  justify-content: center;
}

.subscribe-form__btn--confirm {
  width: 100%;
  max-width: 240px;
  min-height: 48px;
  background: linear-gradient(135deg, #51cf66 0%, #3db854 100%);
}

.subscribe-form__btn--confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #69d779 0%, #4dc464 100%);
  box-shadow: 0 4px 12px rgba(81, 207, 102, 0.25);
}

/* ── Success Panel ── */
.subscribe-form__success-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
}

.subscribe-form__success-icon {
  font-size: 36px;
  line-height: 1;
}

.subscribe-form__success-text {
  font-size: 17px;
  font-weight: 700;
  color: #51cf66;
}

.subscribe-form__success-sub {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

/* ── Feedback ── */
.subscribe-form__error {
  margin-top: 10px;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
}

.subscribe-form__success {
  margin-top: 10px;
  font-size: 12px;
  color: #51cf66;
  text-align: center;
  font-weight: 600;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: #1a1a1a;
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

/* ── Responsive: Tablet ── */
@media (min-width: 600px) {
  .subscribe-form__action-group {
    flex-direction: row;
    justify-content: center;
  }

  .subscribe-form__btn--code {
    width: auto;
    max-width: none;
    min-width: 140px;
  }

  .subscribe-form__btn--confirm {
    width: auto;
    max-width: none;
    flex: 1;
    max-width: 240px;
  }
}

/* ── Responsive: Mobile (<600px) ── */
@media (max-width: 599px) {
  .subscribe-form__card {
    padding: 16px 14px 14px;
    border-radius: 12px;
  }

  .subscribe-form__email-input {
    font-size: 15px;
    padding: 14px 16px;
  }

  .subscribe-form__action-group {
    gap: 12px;
  }

  .subscribe-form__btn--code {
    font-size: 15px;
  }

  .subscribe-form__code-digit {
    width: 42px;
    height: 48px;
    font-size: 20px;
  }

  .subscribe-form__header {
    justify-content: center;
  }

  .subscribe-form__desc {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .subscribe-form__code-digit {
    width: 38px;
    height: 44px;
    font-size: 18px;
  }

  .subscribe-form__code-inputs {
    gap: 5px;
  }
}
</style>