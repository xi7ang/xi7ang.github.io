<template>
  <div ref="containerRef" v-if="step !== 'done'" class="subscribe-notify">
    <!-- 订阅说明区 -->
    <div class="notify-header" style="text-align: center;">
      <span class="notify-icon">📬</span>
      <span class="notify-title">订阅资源更新通知</span>
    </div>

    <!-- 订阅表单 -->
    <div class="notify-form">
      <!-- 邮箱输入 + 按钮（Step 1） -->
      <div v-if="step === 'email'" class="notify-input-row">
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
            @input="onEmailInput"
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

      <!-- Turnstile 验证码（用户输入邮箱时渲染，仅 Step 1 显示） -->
      <div v-if="showTurnstile && step === 'email'" ref="turnstileRef" class="notify-turnstile"></div>

      <!-- 状态消息 -->
      <transition name="fade">
        <div v-if="message" class="notify-message" :class="messageType">
          {{ message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['subscribe-success'])

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
const showTurnstile = ref(false)
const containerRef = ref(null)
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
      localEmail.value = ''
      codeDigits.value = ['', '', '', '', '', '']
      emit('subscribe-success')
      nextTick(() => {
        spawnParticles()
        setTimeout(() => { step.value = 'done' }, 2000)
      })
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

// ── Particle Disintegration ─────────────────────────────────────────
const PARTICLE_CHARS = ['✦', '✧', '✩', '⬡', '◈', '•', '◇']
const PARTICLE_COLORS = ['#D4A843', '#E8C068', '#51cf66', '#ffffff', '#A07828', '#3db854']

function spawnParticles() {
  const el = containerRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const scrollY = window.scrollY
  const doc = document

  const count = 40
  for (let i = 0; i < count; i++) {
    const p = doc.createElement('span')
    p.className = 'particle-fly'
    const tx = (Math.random() - 0.5) * 300
    const ty = -(40 + Math.random() * 140)
    const delay = Math.random() * 0.5
    const size = 6 + Math.random() * 10
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
    const rot = (Math.random() - 0.5) * 720

    p.style.cssText = [
      `position:fixed`,
      `left:${rect.left + Math.random() * rect.width}px`,
      `top:${rect.top + scrollY + Math.random() * rect.height}px`,
      `font-size:${size}px`,
      `color:${color}`,
      `animation:particleFly 2s ease-out ${delay}s forwards`,
      `--tx:${tx}px`,
      `--ty:${ty}px`,
      `--rot:${rot}deg`,
      `pointer-events:none`,
      `z-index:9999`,
      `line-height:1`,
      `font-family:serif`,
    ].join(';')

    p.textContent = PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)]
    doc.body.appendChild(p)
    setTimeout(() => p.remove(), 2500)
  }
}

// ── Turnstile ──────────────────────────────────────────────────────────
function initTurnstile() {
  if (turnstileWidgetId.value !== null) return
  const fn = window.turnstile
  if (!fn || typeof fn.render !== 'function') return

  turnstileWidgetId.value = fn.render(turnstileRef.value, {
    sitekey: '0x4AAAAAADJOkTQV45736fjS',
    callback: (token) => { turnstileToken.value = token },
    'error-callback': () => { turnstileToken.value = '' },
    'expired-callback': () => { turnstileToken.value = '' },
    theme: 'light',
    size: 'normal',
  })
}

function onEmailInput() {
  if (!showTurnstile.value) {
    showTurnstile.value = true
    setTimeout(initTurnstile, 0)
  }
}

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
  margin: var(--space-lg) auto var(--space-lg);
  background: var(--bg-card);
  border: 1px solid rgba(245,166,35,0.2);
  border-radius: var(--border-radius);
  padding: 1.5rem 1.75rem;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px rgba(245,166,35,0.06), 0 4px 24px rgba(245,166,35,0.06);
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
  color: var(--accent-gold);
  letter-spacing: 0.3px;
}

.notify-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
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
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  min-height: 48px;
}

.notify-input-wrap:focus-within {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(245,166,35,0.1);
}

.notify-at {
  color: var(--text-muted);
  font-size: 16px;
  flex-shrink: 0;
}

.notify-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text-primary);
  padding: 10px 6px;
  min-width: 0;
}

.notify-input::placeholder {
  color: var(--text-muted);
}

.notify-input.shake {
  animation: shake 0.4s ease;
}

.notify-suffix {
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 2px;
  direction: ltr;
  min-width: 80px;
}

/* ── Buttons ── */
.notify-btn {
  flex-shrink: 0;
  padding: 0 20px;
  background: linear-gradient(135deg, #51cf66 0%, #3db854 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 100px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.notify-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #69d779 0%, #4dc464 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(81,207,102,0.3);
}

.notify-btn:active:not(:disabled) {
  transform: translateY(0);
}

.notify-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.notify-btn--confirm {
  background: linear-gradient(135deg, #51cf66 0%, #3db854 100%);
  flex: 1;
}

.notify-btn--confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #69d779 0%, #4dc464 100%);
  box-shadow: 0 4px 12px rgba(81,207,102,0.25);
}

.notify-btn--resend {
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(255,255,255,0.12);
  color: var(--text-secondary);
  font-size: 13px;
  min-width: 110px;
}

.notify-btn--resend:hover:not(:disabled) {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  box-shadow: none;
}

.notify-btn--success {
  background: linear-gradient(135deg, #51cf66 0%, #3db854 100%);
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
  color: var(--text-muted);
}

.notify-code-email {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
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
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  direction: ltr;
  caret-color: var(--accent-gold);
}

.notify-code-digit:focus {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px rgba(245,166,35,0.1);
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
  color: #51cf66;
  background: rgba(81,207,102,0.1);
}

.notify-message.error {
  color: #ff6b6b;
  background: rgba(255,107,107,0.1);
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
    width: 100%;
    padding: 0;
    min-height: 50px;
    font-size: 15px;
  }
}

@keyframes disintegrate {
  0%   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  40%  { opacity: 0.9; transform: translateY(-30px) scale(0.98); filter: blur(2px); }
  70%  { opacity: 0.5; transform: translateY(-55px) scale(0.96); filter: blur(5px); }
  100% { opacity: 0; transform: translateY(-80px) scale(0.94); filter: blur(8px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Disintegrate ── */
.subscribe-notify {
  position: relative;
}

.subscribe-notify.disintegrating {
  animation: disintegrate 2s ease-out forwards;
  pointer-events: none;
}

/* ── Success Overlay ── */
.notify-success-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(30, 30, 40, 0.95);
  border: 1.5px solid rgba(81, 207, 102, 0.4);
  border-radius: 16px;
  padding: 24px 32px;
  z-index: 10;
  animation: fadeIn 0.4s ease-out forwards;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.notify-success-icon {
  font-size: 36px;
  line-height: 1;
}

.notify-success-text {
  font-size: 18px;
  font-weight: 700;
  color: #51cf66;
}

.notify-success-sub {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

/* ── Mobile overlay ── */
@media (max-width: 600px) {
  .notify-success-overlay {
    padding: 20px 24px;
    gap: 6px;
  }

  .notify-success-icon {
    font-size: 30px;
  }

  .notify-success-text {
    font-size: 16px;
  }

  .notify-success-sub {
    font-size: 12px;
  }
}

/* ========== 超小屏幕（≤400px） ========== */ */
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