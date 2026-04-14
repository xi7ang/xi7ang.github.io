<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">PAN.NA</div>
      <div class="footer-links">
        <a href="https://devmini.space/blog" target="_blank" rel="noopener">博客</a>
        <span class="sep">/</span>
        <a href="/disclaimer">免责声明</a>
        <span class="sep">/</span>
        <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank" rel="noopener">QQ群</a>
        <span class="sep">/</span>
        <a href="https://t.me/xi7ang" target="_blank" rel="noopener">Telegram</a>
      </div>
      <div class="footer-copy">Copyright &copy; 2025-present xi7ang &middot; 仅供学习交流</div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid #E5E7EB;
  padding: 1.5rem;
  margin-top: 3rem;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  text-align: center;
}

.footer-brand {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #111827;
}

.footer-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  font-size: 0.78rem;
}

.footer-links a {
  color: #6B7280;
  text-decoration: none;
  transition: color 0.15s;
}
.footer-links a:hover { color: #111827; }

.sep { color: #D1D5DB; font-size: 0.75rem; }

.footer-copy {
  font-size: 0.72rem;
  color: #9CA3AF;
}
</style>
