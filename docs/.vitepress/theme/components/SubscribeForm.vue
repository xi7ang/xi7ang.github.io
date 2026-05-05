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
        <div class="subscribe-form__input-row">
          <div class="subscribe-form__input-wrap">
            <input
              v-model="localEmail"
              type="text"
              placeholder="输入邮箱"
              class="subscribe-form__input"
              :class="{ 'shake': shaking }"
              @keydown.enter.prevent="requestCode"
              @focus="inputFocused = true"
              @blur="onBlur"
            />
            <span class="subscribe-form__at">@</span>
            <select v-model="suffix" class="subscribe-form__suffix" @focus="inputFocused = true" @blur="onBlur">
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
            class="subscribe-form__btn subscribe-form__btn--code"
            @click="requestCode"
            :disabled="loading || !emailValid || countDown > 0"
          >
            <span v-if="countDown > 0">{{ countDown }}s</span>
            <span v-else-if="loading"><span class="spinner"></span></span>
            <span v-else>获取验证码</span>
          </button>
        </div>
        <div v-if="errorMsg" class="subscribe-form__error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="subscribe-form__success">{{ successMsg }}</div>
      </div>

      <!-- ── Step 2: Code Input ── -->
      <div v-if="step === 'code'" class="subscribe-form__step">
        <div class="subscribe-form__code-row">
          <div class="subscribe-form__code-info">
            <span class="subscribe-form__code-hint">验证码已发送至</span>
            <span class="subscribe-form__code-email">{{ displayEmail }}</span>
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
              class="subscribe-form__btn subscribe-form__btn--code subscribe-form__btn--small"
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

    <!-- Turnstile container (invisible) -->
    <div id="turnstile-container" class="subscribe-form__turnstile" :class="{ 'hidden': step !== 'email' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const localEmail = ref('')
const suffix = ref('gmail.com')
const step = ref('email')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const shaking = ref(false)
const inputFocused = ref(false)
const countDown = ref(0)
const turnstileToken = ref('')
const turnstileWidgetId = ref(null)
const turnstileContainer = ref(null)
const codeInputs = ref([])
const codeDigits = ref(['', '', '', '', '', ''])

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

let countdownTimer = null

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
  if (e.key === 'Enter') {
    confirmSubscribe()
  }
}

function onCodeInput(e, i) {
  const val = e.target.value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = val
  if (val && i < 5) {
    codeInputs.value[i + 1]?.focus()
  }
}

function onCodePaste(e) {
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
      // auto-focus first code input
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

onMounted(() => {
  function tryInit() {
    const fn = (window as any).turnstile
    if (fn && typeof fn.render === 'function') {
      turnstileWidgetId.value = fn.render('#turnstile-container', {
        sitekey: '0x4AAAAAADJOkTQV45736fjS',
        callback: (token: string) => { turnstileToken.value = token },
        'error-callback': () => { turnstileToken.value = '' },
        'expired-callback': () => { turnstileToken.value = '' },
        theme: 'dark',
        size: 'compact',
      })
    } else {
      requestAnimationFrame(tryInit)
    }
  }
  requestAnimationFrame(tryInit)
})

onUnmounted(() => {
  const fn = (window as any).turnstile
  if (fn && turnstileWidgetId.value !== null) {
    fn.remove(turnstileWidgetId.value)
  }
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

/* ── Input Row ── */
.subscribe-form__input-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.subscribe-form__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.subscribe-form__input-wrap:focus-within {
  border-color: rgba(245, 166, 35, 0.5);
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
}

.subscribe-form__at {
  color: var(--text-muted);
  font-size: 16px;
  flex-shrink: 0;
}

.subscribe-form__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  padding: 12px 8px;
  min-width: 0;
  min-height: 48px;
}

.subscribe-form__input::placeholder {
  color: var(--text-muted);
}

.subscribe-form__input.shake {
  animation: shake 0.4s ease;
}

.subscribe-form__suffix {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 2px;
  direction: ltr;
  min-height: 48px;
}

/* ── Buttons ── */
.subscribe-form__btn {
  flex-shrink: 0;
  padding: 0 20px;
  background: linear-gradient(135deg, #F5A623 0%, #FF8C00 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 88px;
  min-height: 48px;
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

.subscribe-form__btn--code {
  min-width: 108px;
}

.subscribe-form__btn--small {
  min-width: 120px;
  min-height: 40px;
  font-size: 12px;
  padding: 0 12px;
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
  margin-top: 8px;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
}

.subscribe-form__success {
  margin-top: 8px;
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

/* ── Turnstile container ── */
#turnstile-container {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

#turnstile-container.hidden {
  display: none;
}

/* ── Mobile ── */
@media (max-width: 480px) {
  .subscribe-form__card {
    padding: 16px 14px 14px;
    border-radius: 12px;
  }

  .subscribe-form__input-row {
    flex-direction: column;
    gap: 10px;
  }

  .subscribe-form__input-wrap {
    padding: 0 10px;
  }

  .subscribe-form__btn {
    width: 100%;
    padding: 0;
    min-height: 48px;
    border-radius: 10px;
    font-size: 15px;
  }

  .subscribe-form__btn--code {
    min-width: unset;
    width: 100%;
  }

  .subscribe-form__input {
    padding: 14px 6px;
    font-size: 15px;
  }

  .subscribe-form__suffix {
    font-size: 14px;
    padding: 4px 0;
  }

  .subscribe-form__header {
    justify-content: center;
  }

  .subscribe-form__desc {
    text-align: center;
  }

  .subscribe-form__code-digit {
    width: 42px;
    height: 48px;
    font-size: 20px;
  }
}
</style>