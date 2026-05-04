<template>
  <div class="subscribe-form">
    <div class="subscribe-form__inner">
      <div class="subscribe-form__input-row">
        <div class="subscribe-form__input-wrap">
          <input
            v-model="localEmail"
            type="text"
            placeholder="输入你的邮箱"
            class="subscribe-form__input"
            :class="{ 'shake': shaking }"
            @keydown.enter.prevent="handleSubscribe"
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
        <button class="subscribe-form__btn" @click="handleSubscribe" :disabled="loading || !emailValid">
          <span v-if="!loading">📬 订阅</span>
          <span v-else class="subscribe-form__spinner"></span>
        </button>
      </div>
      <div v-if="errorMsg" class="subscribe-form__error">{{ errorMsg }}</div>
      <div v-if="successMsg" class="subscribe-form__success">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const localEmail = ref('')
const suffix = ref('gmail.com')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const shaking = ref(false)
const inputFocused = ref(false)

const email = computed(() => {
  const e = localEmail.value.trim()
  return e ? `${e}@${suffix.value}` : ''
})

const emailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value)
})

function onBlur() {
  setTimeout(() => { inputFocused.value = false }, 200)
}

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

async function handleSubscribe() {
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
    const response = await fetch(
      'https://subscribe-email-resend-worker.wsheng-980210.workers.dev/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value })
      }
    )

    const data = await response.json().catch(() => ({}))

    if (response.ok && data.success) {
      successMsg.value = '✅ 订阅成功！请查收确认邮件'
      localEmail.value = ''
    } else {
      errorMsg.value = data.error || '订阅失败，请稍后重试'
    }
  } catch (e) {
    errorMsg.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.subscribe-form {
  width: 100%;
  margin-top: 16px;
}

.subscribe-form__inner {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
}

.subscribe-form__input-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.subscribe-form__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.2s;
}

.subscribe-form__input-wrap:focus-within {
  border-color: rgba(255, 255, 255, 0.3);
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
  padding: 10px 8px;
  min-width: 0;
}

.subscribe-form__input::placeholder {
  color: var(--text-muted);
}

.subscribe-form__input.shake {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
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
}

.subscribe-form__btn {
  flex-shrink: 0;
  padding: 0 20px;
  background: var(--accent-gold, #F5A623);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subscribe-form__btn:hover:not(:disabled) {
  background: #f7b84b;
  transform: translateY(-1px);
}

.subscribe-form__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.subscribe-form__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: #1a1a1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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
}
</style>