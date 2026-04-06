<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import CommitHistory from './CommitHistory.vue'

const { frontmatter } = useData()
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-after>
      <CommitHistory />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* ============================================================
   xi7ang 资源站 - 全新前端布局 CSS
   设计理念: 清晰层次 · 资源优先 · 行动导向
   ============================================================ */

/* === CSS 变量系统 === */
:root {
  /* 品牌色 */
  --vp-c-brand-1:       #FF3AF2;
  --vp-c-brand-2:      #00F5D4;
  --vp-c-brand-3:      #FFE600;
  --vp-c-brand-soft:   rgba(255, 58, 242, 0.10);

  /* 按钮 */
  --vp-button-brand-border:       #111111;
  --vp-button-brand-text:         #111111;
  --vp-button-brand-bg:           #00F5D4;
  --vp-button-brand-hover-border: #111111;
  --vp-button-brand-hover-text:   #111111;
  --vp-button-brand-hover-bg:     #FFE600;
  --vp-button-alt-border:         #111111;
  --vp-button-alt-text:           #111111;
  --vp-button-alt-bg:             #FFFFFF;
  --vp-button-alt-hover-border:   #111111;
  --vp-button-alt-hover-text:     #111111;
  --vp-button-alt-hover-bg:       #FFE600;

  /* 背景 */
  --vp-c-bg:           #FAFAFA;
  --vp-c-bg-soft:      #F4F4F0;
  --vp-c-bg-alt:       #EFEFEB;
  --vp-c-border:       #E0E0DA;
  --vp-c-divider:      #E0E0DA;
  --vp-c-text-1:       #111111;
  --vp-c-text-2:       #555555;
  --vp-c-text-3:       #999999;
  --vp-sidebar-bg-color: #F4F4F0;
  --vp-nav-bg: rgba(250, 250, 248, 0.92);

  /* 代码 */
  --vp-code-bg: #F0F0EB;
}

.dark {
  --vp-c-bg:           #111111;
  --vp-c-bg-soft:     #1A1A1A;
  --vp-c-bg-alt:       #0E0E0E;
  --vp-c-border:       #2A2A2A;
  --vp-c-divider:      #2A2A2A;
  --vp-c-text-1:       #F0F0F0;
  --vp-c-text-2:       #AAAAAA;
  --vp-c-text-3:       #666666;
  --vp-sidebar-bg-color: #1A1A1A;
  --vp-nav-bg: rgba(17, 17, 17, 0.92);
  --vp-code-bg: #1A1A1A;
}

/* ============================================================
   导航栏
   ============================================================ */
.VPNav {
  background: var(--vp-nav-bg) !important;
  backdrop-filter: blur(16px);
  border-bottom: 2px solid var(--vp-c-border) !important;
}

.VPNavBar .title {
  font-weight: 900 !important;
  font-size: 1.15rem !important;
  letter-spacing: -0.02em;
  color: #111111 !important;
}

.VPNavBarMenuLink {
  font-weight: 700 !important;
  font-size: 0.82rem !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #111111 !important;
  border-bottom: 3px solid transparent !important;
  transition: border-color 0.15s;
}

.VPNavBarMenuLink:hover,
.VPNavBarMenuLink.active {
  color: #FF3AF2 !important;
  border-bottom: 3px solid #FF3AF2 !important;
}

.dark .VPNavBar .title { color: #FFFFFF !important; }
.dark .VPNavBarMenuLink { color: #FFFFFF !important; }
.dark .VPNavBarMenuLink:hover { color: #FF3AF2 !important; }

/* ============================================================
   Hero 区域
   ============================================================ */
.VPHome .VPHomeHero {
  padding: 0 !important;
  background: var(--vp-c-bg) !important;
  position: relative;
  overflow: hidden;
}

/* 背景几何装饰 */
.hero-bg-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.deco-1 {
  width: 400px;
  height: 400px;
  background: #FF3AF2;
  top: -120px;
  left: -100px;
  animation: float-1 8s ease-in-out infinite;
}

.deco-2 {
  width: 280px;
  height: 280px;
  background: #00F5D4;
  bottom: -80px;
  right: -60px;
  animation: float-2 10s ease-in-out infinite;
}

.deco-3 {
  width: 180px;
  height: 180px;
  background: #FFE600;
  top: 40%;
  right: 15%;
  transform: rotate(20deg);
  animation: float-3 6s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}
@keyframes float-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, -15px); }
}
@keyframes float-3 {
  0%, 100% { transform: rotate(20deg) scale(1); }
  50% { transform: rotate(30deg) scale(1.05); }
}

/* Hero 内容 */
.home-hero {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 72px 24px 56px;
  background: linear-gradient(180deg, rgba(255,58,242,0.04) 0%, transparent 100%);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  background: #111111;
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 100px;
  margin-bottom: 1.5rem;
  border: 2px solid #111111;
  box-shadow: 3px 3px 0 #FF3AF2;
}

.dark .hero-badge {
  background: #FFFFFF;
  color: #111111;
  box-shadow: 3px 3px 0 #FFE600;
}

.hero-title {
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.hero-title-main {
  font-size: clamp(2.4rem, 7vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(135deg, #FF3AF2 0%, #00F5D4 50%, #FFE600 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-title-sub {
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  font-weight: 700;
  color: #111111;
  letter-spacing: -0.01em;
  display: block;
}

.dark .hero-title-sub { color: #FFFFFF; }

.hero-tagline {
  font-size: 1.05rem;
  color: #666666;
  margin: 0 0 2.5rem;
  font-weight: 500;
  line-height: 1.6;
}

.dark .hero-tagline { color: #AAAAAA; }

/* Hero 操作按钮 */
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 2.5px solid #111111;
  border-radius: 0;
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.hero-btn-primary {
  background: #00F5D4;
  color: #111111;
  box-shadow: 4px 4px 0 #111111;
}

.hero-btn-primary:hover {
  background: #FFE600;
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 #111111;
  color: #111111;
}

.hero-btn-secondary {
  background: #FFFFFF;
  color: #111111;
  box-shadow: 4px 4px 0 #111111;
}

.hero-btn-secondary:hover {
  background: #FF3AF2;
  color: #FFFFFF;
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 #111111;
}

.hero-btn-ghost {
  background: transparent;
  color: #111111;
  box-shadow: 4px 4px 0 #111111;
}

.hero-btn-ghost:hover {
  background: #111111;
  color: #FFFFFF;
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 #FF3AF2;
}

.dark .hero-btn-secondary { background: #1A1A1A; color: #FFFFFF; border-color: #FFFFFF; }
.dark .hero-btn-ghost { color: #FFFFFF; border-color: #FFFFFF; box-shadow: 4px 4px 0 #FFFFFF; }
.dark .hero-btn-ghost:hover { background: #FFFFFF; color: #111111; }

/* ============================================================
   数据统计条
   ============================================================ */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: #111111;
  border-top: 3px solid #FF3AF2;
  border-bottom: 3px solid #FF3AF2;
  padding: 0;
  flex-wrap: wrap;
}

.dark .stats-bar {
  background: #0A0A0A;
  border-color: #FFE600;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 40px;
  gap: 4px;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 900;
  color: #00F5D4;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #333333;
}

@media (max-width: 640px) {
  .stats-bar {
    gap: 0;
  }
  .stat-item {
    padding: 16px 24px;
  }
  .stat-divider {
    display: none;
  }
}

/* ============================================================
   搜索区域
   ============================================================ */
.search-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 3px solid #111111;
  box-shadow: 6px 6px 0 #111111;
  transition: all 0.15s ease;
  margin-bottom: 16px;
}

.search-container:focus-within {
  box-shadow: 8px 8px 0 #111111;
  transform: translate(-2px, -2px);
}

.dark .search-container {
  background: #1A1A1A;
  border-color: #FFFFFF;
  box-shadow: 6px 6px 0 #FFFFFF;
}

.search-icon {
  padding: 0 16px;
  font-size: 1.2rem;
  color: #888888;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 16px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #111111;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
}

.dark .search-input { color: #FFFFFF; }

.search-input::placeholder { color: #AAAAAA; }

.search-hint {
  padding: 0 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #AAAAAA;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  border-left: 1px solid var(--vp-c-border);
}

@media (max-width: 640px) {
  .search-hint { display: none; }
}

.search-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.search-tag-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-tag {
  display: inline-block;
  padding: 5px 12px;
  background: var(--vp-c-bg-soft);
  border: 1.5px solid var(--vp-c-border);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555555;
  text-decoration: none;
  transition: all 0.15s ease;
}

.search-tag:hover {
  background: #FF3AF2;
  border-color: #FF3AF2;
  color: #FFFFFF;
  transform: translateY(-1px);
}

/* ============================================================
   通用区块标题
   ============================================================ */
.category-section,
.recent-section,
.advantages-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 56px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.5rem !important;
  font-weight: 900 !important;
  color: #111111 !important;
  letter-spacing: -0.02em !important;
  margin: 0 !important;
  border: none !important;
  padding: 0 !important;
  background: none !important;
}

.dark .section-title { color: #FFFFFF !important; }

.section-subtitle {
  font-size: 0.85rem;
  color: #888888;
  font-weight: 500;
}

.section-more {
  font-size: 0.85rem;
  font-weight: 700;
  color: #FF3AF2;
  text-decoration: none;
  transition: color 0.15s;
  white-space: nowrap;
}

.section-more:hover { color: #111111; }

/* ============================================================
   分类网格 (核心特色)
   ============================================================ */
.category-section {
  padding-top: 16px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

/* 分类卡片 */
.category-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #FFFFFF;
  border: 2.5px solid #111111;
  box-shadow: 5px 5px 0 #111111;
  text-decoration: none;
  color: inherit;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  animation: card-appear 0.5s ease both;
  animation-delay: var(--card-delay, 0s);
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 9px 9px 0 #111111;
  border-color: var(--card-color, #FF3AF2);
}

.category-card:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #111111;
}

.dark .category-card {
  background: #1A1A1A;
  border-color: #FFFFFF;
  box-shadow: 5px 5px 0 #FFFFFF;
}

.dark .category-card:hover {
  box-shadow: 9px 9px 0 var(--card-color, #FF3AF2);
  border-color: var(--card-color, #FF3AF2);
}

/* 卡片图标 */
.card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.card-icon {
  font-size: 2.2rem;
  line-height: 1;
  display: block;
}

/* 卡片信息 */
.card-info {
  flex: 1;
}

.card-name {
  font-size: 1.1rem !important;
  font-weight: 900 !important;
  color: #111111 !important;
  margin: 0 0 4px !important;
  letter-spacing: -0.01em !important;
  border: none !important;
  padding: 0 !important;
  background: none !important;
}

.dark .card-name { color: #FFFFFF !important; }

.card-desc {
  font-size: 0.8rem;
  color: #888888;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: auto;
}

.card-count {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--card-color, #FF3AF2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-arrow {
  font-size: 1rem;
  font-weight: 900;
  color: #111111;
  transition: transform 0.15s ease;
}

.category-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--card-color, #FF3AF2);
}

/* 卡片闪光效果 */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.4s ease;
  pointer-events: none;
}

.category-card:hover .card-shine {
  left: 150%;
}

/* ============================================================
   本月最新
   ============================================================ */
.recent-section {
  background: var(--vp-c-bg-alt);
  border-top: 3px solid #111111;
  border-bottom: 3px solid #111111;
  padding-top: 40px;
  padding-bottom: 40px;
}

.dark .recent-section {
  background: #0E0E0E;
  border-color: #FFFFFF;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.recent-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 2px solid #111111;
  box-shadow: 3px 3px 0 #111111;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}

.dark .recent-card {
  background: #1A1A1A;
  border-color: #FFFFFF;
  box-shadow: 3px 3px 0 #FFFFFF;
}

.recent-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #111111;
  border-color: #FF3AF2;
}

.recent-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  line-height: 1;
}

.recent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-cat {
  font-size: 0.78rem;
  font-weight: 800;
  color: #FF3AF2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recent-update {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .recent-update { color: #FFFFFF; }

.recent-date {
  font-size: 0.72rem;
  font-weight: 700;
  color: #AAAAAA;
  flex-shrink: 0;
}

/* ============================================================
   优势卡片
   ============================================================ */
.advantages-section {
  padding-top: 56px;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.advantage-card {
  background: #FFFFFF;
  border: 2px solid #111111;
  box-shadow: 4px 4px 0 #111111;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.15s ease;
}

.dark .advantage-card {
  background: #1A1A1A;
  border-color: #FFFFFF;
  box-shadow: 4px 4px 0 #FFFFFF;
}

.advantage-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 7px 7px 0 #111111;
}

.dark .advantage-card:hover {
  box-shadow: 7px 7px 0 var(--vp-c-brand-1, #FF3AF2);
}

.adv-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: block;
}

.advantage-card h3 {
  font-size: 1rem !important;
  font-weight: 900 !important;
  color: #111111 !important;
  margin: 0 0 8px !important;
  border: none !important;
  padding: 0 !important;
  background: none !important;
}

.dark .advantage-card h3 { color: #FFFFFF !important; }

.advantage-card p {
  font-size: 0.85rem !important;
  color: #666666 !important;
  line-height: 1.6 !important;
  margin: 0 !important;
}

.dark .advantage-card p { color: #AAAAAA !important; }

/* ============================================================
   底部 CTA
   ============================================================ */
.cta-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.cta-card {
  background: linear-gradient(135deg, #111111 0%, #222222 100%);
  border: 3px solid #FF3AF2;
  box-shadow: 8px 8px 0 #FF3AF2;
  padding: 48px 40px;
  text-align: center;
}

.dark .cta-card {
  background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%);
  border-color: #FFE600;
  box-shadow: 8px 8px 0 #FFE600;
}

.cta-card h2 {
  font-size: 1.8rem !important;
  font-weight: 900 !important;
  color: #FFFFFF !important;
  margin: 0 0 12px !important;
  letter-spacing: -0.02em !important;
  border: none !important;
  padding: 0 !important;
  background: none !important;
}

.dark .cta-card h2 { color: #FFE600 !important; }

.cta-card > p {
  color: #AAAAAA !important;
  font-size: 1rem !important;
  margin: 0 0 28px !important;
}

.cta-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 2.5px solid #111111;
  transition: all 0.15s ease;
}

.cta-btn-primary {
  background: #00F5D4;
  color: #111111;
  box-shadow: 4px 4px 0 rgba(255,255,255,0.3);
}

.cta-btn-primary:hover {
  background: #FFE600;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 rgba(255,255,255,0.3);
  color: #111111;
}

.cta-btn-secondary {
  background: transparent;
  color: #FFFFFF;
  border-color: #FFFFFF;
}

.cta-btn-secondary:hover {
  background: #FFFFFF;
  color: #111111;
  transform: translate(-2px, -2px);
}

.dark .cta-btn-secondary { color: #FFE600; border-color: #FFE600; }
.dark .cta-btn-secondary:hover { background: #FFE600; color: #111111; }

/* ============================================================
   页脚信息
   ============================================================ */
.footer-info {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
  text-align: center;
  border-top: 2px solid var(--vp-c-divider);
}

.footer-info p {
  font-size: 0.85rem !important;
  color: #888888 !important;
  line-height: 1.8 !important;
  margin: 0 0 6px !important;
}

.footer-info a {
  color: #FF3AF2 !important;
  font-weight: 600 !important;
  text-decoration: none !important;
}

.footer-info a:hover {
  color: #111111 !important;
  text-decoration: underline !important;
}

.footer-update {
  margin-top: 12px !important;
  font-size: 0.78rem !important;
  color: #BBBBBB !important;
}

.dark .footer-info a:hover { color: #FFE600 !important; }

/* ============================================================
   侧边栏 (分类页)
   ============================================================ */
.VPSidebar {
  background: var(--vp-sidebar-bg-color) !important;
  border-right: 2px solid var(--vp-c-border) !important;
}

.VPSidebarItem .text {
  font-weight: 600;
  font-size: 0.88rem;
}

.VPSidebarItem.is-active > .item .link .text {
  color: #FF3AF2 !important;
  font-weight: 900;
}

.VPSidebarItem > .item .link:hover .text {
  color: #FF3AF2 !important;
}

/* ============================================================
   文章页面
   ============================================================ */
.VPDoc h1 {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #111111;
  border-bottom: 4px solid #FFE600;
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
}

.dark .VPDoc h1 {
  color: #FFFFFF;
  border-bottom-color: #FF3AF2;
}

.VPDoc h2 {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111111;
  border-left: 4px solid #FF3AF2;
  padding-left: 1rem;
  margin: 2.5rem 0 1rem;
}

.dark .VPDoc h2 { color: #FFFFFF; }

/* 表格 */
.VPDoc table {
  border: 2px solid #111111;
  border-collapse: collapse;
  width: 100%;
  box-shadow: 4px 4px 0 #111111;
  font-size: 0.9rem;
}

.VPDoc th {
  background: #111111;
  color: #FFFFFF;
  font-weight: 800;
  padding: 10px 14px;
  text-align: left;
}

.VPDoc td {
  border: 1px solid var(--vp-c-divider);
  padding: 9px 14px;
}

.VPDoc tr:hover td { background: rgba(255,230,0,0.08); }

/* 代码块 */
.VPDoc div[class*='language-'] {
  border: 2px solid #111111;
  box-shadow: 4px 4px 0 #111111;
  border-radius: 0;
}

.dark .VPDoc div[class*='language-'] {
  border-color: #FFFFFF;
  box-shadow: 4px 4px 0 #FFFFFF;
}

/* ============================================================
   页脚
   ============================================================ */
.VPFooter {
  background: #111111 !important;
  border-top: 3px solid #FF3AF2 !important;
  padding: 1.5rem;
}

.VPFooter .message,
.VPFooter .copyright {
  color: #AAAAAA !important;
  font-size: 0.82rem;
}

.VPFooter a { color: #00F5D4 !important; font-weight: 700; }
.VPFooter a:hover { color: #FFE600 !important; }

.dark .VPFooter {
  background: #0A0A0A !important;
  border-top-color: #FFE600 !important;
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 768px) {
  .home-hero {
    padding: 48px 16px 40px;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .category-card {
    padding: 16px;
  }

  .card-icon {
    font-size: 1.8rem;
  }

  .card-name {
    font-size: 1rem !important;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }

  .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cta-card {
    padding: 32px 20px;
  }

  .cta-card h2 {
    font-size: 1.4rem !important;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .advantages-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-btn {
    justify-content: center;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-btn {
    justify-content: center;
  }

  .stats-bar {
    flex-direction: column;
    gap: 0;
  }

  .stat-divider {
    display: block;
    width: 60%;
    height: 1px;
  }
}

/* ============================================================
   禁用 VitePress 默认 features 列表
   (因为我们用自定义 category-grid)
   ============================================================ */
.VPHome .VPHomeFeatures {
  display: none !important;
}

/* 覆盖 VitePress 默认 hero 后面的样式 */
.VPHome .VPHomeHero.no-features {
  padding-bottom: 0 !important;
}
</style>
