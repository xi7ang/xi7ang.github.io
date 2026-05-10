<template>
  <div ref="containerRef" v-if="step !== 'done'" class="subscribe-notify">
    <!-- 订阅说明区 -->
    <div v-if="step !== 'success'" class="notify-header" style="text-align: center;">
      <span class="notify-icon">📬</span>
      <span class="notify-title">订阅资源更新通知</span>
    </div>

    <!-- 订阅表单 -->
    <div v-if="step !== 'success'" class="notify-form">
      <!-- 邮箱输入 + 按钮（Step 1） -->
      <div v-if="step === 'email'" class="notify-input-row">
        <div class="notify-input-wrap">
          <input
            v-model="email"
            type="text"
            placeholder="输入邮箱地址"
            class="notify-input"
            :class="{ shake: shaking }"
            @keydown.enter.prevent="handleAction"
            @blur="onBlur"
            @input="onEmailInput"
          />
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
          <span class="notify-code-email">{{ email }}</span>
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

const email = ref('')
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
      email.value = ''
      codeDigits.value = ['', '', '', '', '', '']
      // Animate container shrink immediately, then show text
      nextTick(() => playSuccessAnimation())
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

// ── Success Animation (GSAP) ────────────────────────────────────────
function playSuccessAnimation() {
  const container = containerRef.value
  if (!container) { step.value = 'done'; return }

  const gsap = window.gsap
  if (!gsap) { setTimeout(() => { step.value = 'done' }, 800); return }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    step.value = 'done'; return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight
  const cx = vw / 2
  const cy = vh / 2

  // ── Build Gift Reveal Elements ─────────────────────────────────
  // Root overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'pointer-events:none', 'z-index:9998',
    'display:flex', 'align-items:center', 'justify-content:center',
  ].join(';')
  document.body.appendChild(overlay)

  // Gift box body
  const box = document.createElement('div')
  box.style.cssText = [
    'position:relative', 'width:120px', 'height:100px',
    'transform-style:preserve-3d', 'perspective:600px',
  ].join(';')

  // Box body (front face)
  const boxBody = document.createElement('div')
  boxBody.style.cssText = [
    'position:absolute', 'width:120px', 'height:100px',
    'background:linear-gradient(145deg,#c8956a,#a0714a)',
    'border-radius:10px',
    'box-shadow:inset 0 -8px 20px rgba(0,0,0,0.25), 0 8px 30px rgba(0,0,0,0.3)',
  ].join(';')

  // Horizontal ribbon on box
  const ribbonH = document.createElement('div')
  ribbonH.style.cssText = [
    'position:absolute', 'left:0', 'top:50%', 'transform:translateY(-50%)',
    'width:120px', 'height:18px',
    'background:linear-gradient(180deg,#f0c040,#d4a020)',
    'border-radius:2px',
  ].join(';')

  // Vertical ribbon on box
  const ribbonV = document.createElement('div')
  ribbonV.style.cssText = [
    'position:absolute', 'left:50%', 'top:0', 'transform:translateX(-50%)',
    'width:18px', 'height:100px',
    'background:linear-gradient(180deg,#f0c040,#d4a020)',
    'border-radius:2px',
  ].join(';')

  // Ribbon bow - left loop
  const bowL = document.createElement('div')
  bowL.style.cssText = [
    'position:absolute', 'top:-18px', 'left:50%', 'transform:translateX(-14px)',
    'width:24px', 'height:18px',
    'background:#f0c040', 'border-radius:50% 50% 50% 0',
    'box-shadow:0 2px 6px rgba(0,0,0,0.2)',
  ].join(';')

  // Ribbon bow - right loop
  const bowR = document.createElement('div')
  bowR.style.cssText = [
    'position:absolute', 'top:-18px', 'left:50%', 'transform:translateX(-10px)',
    'width:24px', 'height:18px',
    'background:#f0c040', 'border-radius:50% 50% 0 50%',
    'box-shadow:0 2px 6px rgba(0,0,0,0.2)',
  ].join(';')

  // Bow center knot
  const bowCenter = document.createElement('div')
  bowCenter.style.cssText = [
    'position:absolute', 'top:-14px', 'left:50%', 'transform:translateX(-50%)',
    'width:14px', 'height:12px',
    'background:#f5d060', 'border-radius:4px',
  ].join(';')

  // Box lid
  const lid = document.createElement('div')
  lid.style.cssText = [
    'position:absolute', 'top:-20px', 'left:-4px',
    'width:128px', 'height:28px',
    'background:linear-gradient(145deg,#d4a030,#b08020)',
    'border-radius:8px 8px 4px 4px',
    'box-shadow:0 4px 12px rgba(0,0,0,0.3)',
    'transform-origin:center bottom',
    'z-index:2',
  ].join(';')

  // Lid ribbon strip
  const lidRibbon = document.createElement('div')
  lidRibbon.style.cssText = [
    'position:absolute', 'left:50%', 'top:0', 'transform:translateX(-50%)',
    'width:20px', 'height:28px',
    'background:linear-gradient(180deg,#f0c040,#d4a020)',
    'border-radius:2px',
  ].join(';')
  lid.appendChild(lidRibbon)

  boxBody.appendChild(ribbonH)
  boxBody.appendChild(ribbonV)
  box.appendChild(bowL)
  box.appendChild(bowR)
  box.appendChild(bowCenter)
  box.appendChild(boxBody)
  box.appendChild(lid)

  // Checkmark badge (hidden initially, pops out of box)
  const badge = document.createElement('div')
  badge.style.cssText = [
    'position:absolute',
    `left:${cx - 36}px`, `top:${cy - 36}px`,
    'width:72px', 'height:72px',
    'background:linear-gradient(135deg,#A8F0C8,#60D89C)',
    'border-radius:50%',
    'display:flex', 'align-items:center', 'justify-content:center',
    'box-shadow:0 6px 24px rgba(96,216,156,0.6), 0 0 0 6px rgba(168,240,200,0.25)',
    'opacity:0', 'scale:0',
    'z-index:10',
  ].join(';')
  badge.innerHTML = [
    '<svg viewBox="0 0 40 40" width="40" height="40" fill="none">',
    '<path d="M8 20l8 8 16-16" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    '</svg>',
  ].join('')

  // Success text
  const textEl = document.createElement('div')
  textEl.style.cssText = [
    'position:absolute',
    `left:${cx}px`, `top:${cy + 70}px`,
    'transform:translateX(-50%)',
    'font-size:36px', 'font-weight:800',
    'color:#A8F0C8',
    'text-shadow:0 0 20px rgba(168,240,200,0.9), 0 0 40px rgba(168,240,200,0.5), 0 0 80px rgba(168,240,200,0.25)',
    'font-family:var(--font-display,system-ui)',
    'white-space:nowrap',
    'letter-spacing:0.1em',
    'opacity:0',
    'z-index:10',
  ].join(';')
  textEl.textContent = '订阅成功'

  // Gold particles
  const PARTICLE_COLORS = ['#FFD700', '#FFA500', '#FFF0A0', '#FFCC33', '#FFE066']
  const particles = []
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div')
    const size = 5 + Math.random() * 8
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
    const shape = Math.random() > 0.5 ? '50%' : '2px'
    p.style.cssText = [
      'position:fixed', `left:${cx}px`, `top:${cy}px`,
      `width:${size}px`, `height:${size}px`,
      `background:${color}`, `border-radius:${shape}`,
      `box-shadow:0 0 ${size * 1.5}px ${color}`,
      'opacity:0', 'z-index:11',
    ].join(';')
    document.body.appendChild(p)
    particles.push(p)
  }

  overlay.appendChild(box)
  document.body.appendChild(badge)
  document.body.appendChild(textEl)

  // ── Master Timeline ─────────────────────────────────────────────
  const tl = gsap.timeline()

  // Set initial states
  gsap.set(overlay, { opacity: 0 })
  gsap.set(lid, { rotation: 0 })
  gsap.set(box, { y: 0 })

  // 0ms — Overlay fades in
  tl.to(overlay, { opacity: 1, duration: 0.1 })

  // 100ms — Gift box bounces in
  tl.fromTo(box,
    { opacity: 0, scale: 0.3, y: 60 },
    { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2)' },
  '+=0.05')

  // 350ms — Lid flips open
  tl.to(lid, {
    rotation: -130,
    duration: 0.4,
    ease: 'power4.out',
  }, 'lid')

  // 500ms — Badge pops out of box
  tl.fromTo(badge,
    { opacity: 0, scale: 0, y: 60 },
    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(3)' },
  'lid+=0.15')

  // 700ms — Text rises up
  tl.fromTo(textEl,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
  'lid+=0.2')

  // 800ms — Particles burst from center
  particles.forEach((p, i) => {
    const angle = (i / particles.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const dist = 100 + Math.random() * 180
    const endX = Math.cos(angle) * dist
    const endY = Math.sin(angle) * dist - 40
    const endRot = (Math.random() - 0.5) * 720
    tl.fromTo(p,
      { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 },
      {
        opacity: 0, x: endX, y: endY,
        scale: 0.2, rotation: endRot,
        duration: 0.7,
        ease: 'power2.out',
      },
      'burst'
    )
  })
  tl.fromTo({},
    {},
    { duration: 0.01 },
    'burst'
  )

  // 1600ms — Everything fades out
  tl.to([overlay, badge, textEl], {
    opacity: 0, duration: 0.3, ease: 'power2.in',
    onComplete: () => {
      overlay.remove()
      badge.remove()
      textEl.remove()
      particles.forEach(p => p.remove())
      step.value = 'done'
    }
  }, '+=0.55')
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