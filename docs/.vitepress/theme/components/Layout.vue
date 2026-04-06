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
   Playful Geometric Design System for VitePress
   基调: 新粗野主义 (Neubrutalism)
   核心: 硬边投影 · 几何色块 · 撞色 · 大字粗体
   ============================================================ */

:root {
  /* === 核心色彩系统 === */
  --vp-c-brand-1:       #FF3AF2;   /* 粉紫色 - 主强调色 */
  --vp-c-brand-2:       #00F5D4;   /* 青绿色 - 次强调色 */
  --vp-c-brand-3:       #FFE600;   /* 明黄色 - 点缀色 */
  --vp-c-brand-soft:    rgba(255, 58, 242, 0.12);

  /* 按钮色 */
  --vp-button-brand-border:        #111111;
  --vp-button-brand-text:          #111111;
  --vp-button-brand-bg:            #00F5D4;
  --vp-button-brand-hover-border:   #111111;
  --vp-button-brand-hover-text:     #111111;
  --vp-button-brand-hover-bg:       #FFE600;
  --vp-button-brand-active-border:  #111111;
  --vp-button-brand-active-text:    #111111;
  --vp-button-brand-active-bg:      var(--vp-button-brand-bg);

  /* 次级按钮 */
  --vp-button-alt-border:       #111111;
  --vp-button-alt-text:         #111111;
  --vp-button-alt-bg:           #FFFFFF;
  --vp-button-alt-hover-border:  #111111;
  --vp-button-alt-hover-text:   #111111;
  --vp-button-alt-hover-bg:     #FFE600;

  /* 背景与边框 */
  --vp-c-bg:           #FAFAFA;
  --vp-c-bg-soft:      #F5F5F0;
  --vp-c-bg-alt:       #F0F0EB;
  --vp-c-border:       #111111;
  --vp-c-divider:      #E0E0DB;

  /* 文字色 */
  --vp-c-text-1: #111111;
  --vp-c-text-2: #444444;
  --vp-c-text-3: #888888;

  /* 侧边栏 */
  --vp-sidebar-bg-color: #F5F5F0;

  /* 导航栏 */
  --vp-nav-bg: rgba(250, 250, 250, 0.9);

  /* 代码块 */
  --vp-code-bg: #F0F0EB;
  --vp-code-color: #FF3AF2;
}

/* ============================================================
   暗黑模式
   ============================================================ */
.dark {
  --vp-c-bg:           #111111;
  --vp-c-bg-soft:      #1A1A1A;
  --vp-c-bg-alt:       #0A0A0A;
  --vp-c-border:       #FFFFFF;
  --vp-c-divider:      #333333;
  --vp-c-text-1: #FFFFFF;
  --vp-c-text-2: #CCCCCC;
  --vp-c-text-3: #888888;
  --vp-sidebar-bg-color: #1A1A1A;
  --vp-nav-bg: rgba(17, 17, 17, 0.9);
  --vp-code-bg: #1A1A1A;
}

/* ============================================================
   全局几何装饰背景
   ============================================================ */
.VPApp {
  background-color: var(--vp-c-bg);
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255, 58, 242, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(0, 245, 212, 0.04) 0%, transparent 40%);
}

/* ============================================================
   导航栏 - 几何感
   ============================================================ */
.VPNav {
  background: rgba(250, 250, 250, 0.85) !important;
  backdrop-filter: blur(12px);
  border-bottom: 3px solid #111111 !important;
}

.dark .VPNav {
  background: rgba(17, 17, 17, 0.85) !important;
  border-bottom: 3px solid #FFFFFF !important;
}

.VPNavBar .title {
  font-weight: 900 !important;
  font-size: 1.2rem !important;
  letter-spacing: -0.02em;
  color: #111111 !important;
  text-decoration: none;
}

.VPNavBar .title:hover {
  color: #FF3AF2 !important;
}

.VPNavBarMenuLink {
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #111111 !important;
  border-bottom: 3px solid transparent !important;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.VPNavBarMenuLink:hover,
.VPNavBarMenuLink.active {
  color: #FF3AF2 !important;
  border-bottom: 3px solid #FF3AF2 !important;
}

/* ============================================================
   Hero 区域 - Playful Geometric 核心
   ============================================================ */
.VPHome .VPHomeHero {
  padding: 80px 24px 64px !important;
  background:
    linear-gradient(135deg, rgba(255, 230, 0, 0.08) 0%, transparent 50%),
    linear-gradient(225deg, rgba(255, 58, 242, 0.06) 0%, transparent 50%),
    var(--vp-c-bg) !important;
  position: relative;
  overflow: hidden;
}

/* 几何装饰 - 左上角圆形 */
.VPHome .VPHomeHero::before {
  content: '';
  position: absolute;
  top: -60px;
  left: -60px;
  width: 200px;
  height: 200px;
  background: #FFE600;
  border-radius: 50%;
  opacity: 0.15;
  z-index: 0;
}

/* 几何装饰 - 右下角方形 */
.VPHome .VPHomeHero::after {
  content: '';
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: #FF3AF2;
  opacity: 0.08;
  z-index: 0;
  transform: rotate(15deg);
}

.VPHome .VPHomeHero .container {
  position: relative;
  z-index: 1;
}

.VPHome .VPHomeHero .main .name {
  background: linear-gradient(135deg, #FF3AF2 0%, #00F5D4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
}

.VPHome .VPHomeHero .main .text {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 800;
  color: #111111;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.dark .VPHome .VPHomeHero .main .text {
  color: #FFFFFF;
}

.VPHome .VPHomeHero .main .tagline {
  font-size: 1.15rem;
  font-weight: 500;
  color: #555555;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.dark .VPHome .VPHomeHero .main .tagline {
  color: #AAAAAA;
}

/* Hero 按钮 - 几何硬边风格 */
.VPHome .VPHomeHero .actions {
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.VPHome .VPHomeHero .actions .action .VPButton {
  font-weight: 900 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 14px 28px !important;
  border-radius: 0 !important;
  border: 3px solid #111111 !important;
  box-shadow: 5px 5px 0px 0px #111111 !important;
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  background: #00F5D4 !important;
  color: #111111 !important;
}

.VPHome .VPHomeHero .actions .action .VPButton:hover {
  transform: translate(-3px, -3px) !important;
  box-shadow: 8px 8px 0px 0px #111111 !important;
  background: #FFE600 !important;
}

.VPHome .VPHomeHero .actions .action .VPButton:active {
  transform: translate(2px, 2px) !important;
  box-shadow: 2px 2px 0px 0px #111111 !important;
}

.VPHome .VPHomeHero .actions .action:last-child .VPButton,
.VPHome .VPHomeHero .actions .action:nth-child(n+2) .VPButton {
  background: #FFFFFF !important;
  color: #111111 !important;
  border: 3px solid #111111 !important;
  box-shadow: 5px 5px 0px 0px #111111 !important;
}

.VPHome .VPHomeHero .actions .action:last-child .VPButton:hover,
.VPHome .VPHomeHero .actions .action:nth-child(n+2) .VPButton:hover {
  background: #FF3AF2 !important;
  color: #FFFFFF !important;
  transform: translate(-3px, -3px) !important;
  box-shadow: 8px 8px 0px 0px #111111 !important;
}

/* ============================================================
   功能卡片网格 - 几何风格核心
   ============================================================ */
.VPHome .VPHomeFeatures {
  padding: 0 24px 64px;
  margin-bottom: 40px;
  clear: both;
}

.VPHome .VPHomeFeatures .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.VPHome .VPHomeFeatures .items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

/* 卡片主体 - 几何硬边 */
.VPHome .VPHomeFeatures .item .VPFeature {
  background: #FFFFFF;
  border: 3px solid #111111;
  border-radius: 0;
  padding: 28px 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 6px 6px 0px 0px #111111;
  transform: rotate(-0.3deg);
}

.VPHome .VPHomeFeatures .item:nth-child(even) .VPFeature {
  transform: rotate(0.3deg);
}

.VPHome .VPHomeFeatures .item:nth-child(3n) .VPFeature {
  transform: rotate(-0.5deg);
}

.VPHome .VPHomeFeatures .item:nth-child(5n) .VPFeature {
  transform: rotate(0.2deg);
}

.VPHome .VPHomeFeatures .item .VPFeature:hover {
  transform: translate(-4px, -4px) rotate(0deg) !important;
  box-shadow: 10px 10px 0px 0px #111111;
  border-color: #FF3AF2;
  z-index: 10;
}

/* 卡片图标 */
.VPHome .VPHomeFeatures .item .VPFeature .icon {
  width: 64px;
  height: 64px;
  background: #FFE600;
  border: 2px solid #111111;
  box-shadow: 3px 3px 0px 0px #111111;
  border-radius: 50%;
  padding: 10px;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  line-height: 1;
}

.VPHome .VPHomeFeatures .item:nth-child(3n) .VPFeature .icon {
  background: #FF3AF2;
}

.VPHome .VPHomeFeatures .item:nth-child(5n) .VPFeature .icon {
  background: #00F5D4;
}

/* 卡片标题 */
.VPHome .VPHomeFeatures .item .VPFeature .title {
  color: #111111;
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 12px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

.dark .VPHome .VPHomeFeatures .item .VPFeature .title {
  color: #FFFFFF;
}

/* 卡片描述 */
.VPHome .VPHomeFeatures .item .VPFeature .details {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555555;
  flex-grow: 1;
  margin-bottom: 16px;
}

.dark .VPHome .VPHomeFeatures .item .VPFeature .details {
  color: #BBBBBB;
}

/* 卡片链接 */
.VPHome .VPHomeFeatures .item .VPFeature .link {
  color: #FF3AF2;
  font-size: 0.8rem;
  font-weight: 900;
  text-decoration: none;
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #FF3AF2;
  padding-bottom: 2px;
}

.VPHome .VPHomeFeatures .item .VPFeature .link:hover {
  color: #111111;
  border-bottom-color: #111111;
  transform: translateX(4px);
}

/* ============================================================
   内容区域
   ============================================================ */
.VPHome .vp-doc {
  background: var(--vp-c-bg-alt);
  margin-top: 32px;
  border-top: 4px solid #111111;
}

.VPHome .vp-doc .container {
  padding: 48px 32px;
}

.VPHome .vp-doc h2 {
  color: #111111;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.02em;
  position: relative;
  padding-bottom: 1rem;
}

.VPHome .vp-doc h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #FF3AF2;
  border: 2px solid #111111;
}

.VPHome .vp-doc h3 {
  color: #111111;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 2rem 0 1rem;
  letter-spacing: -0.01em;
}

.dark .VPHome .vp-doc h2,
.dark .VPHome .vp-doc h3 {
  color: #FFFFFF;
}

.VPHome .vp-doc p {
  line-height: 1.75;
  margin-bottom: 1.2rem;
  color: #333333;
}

.VPHome .vp-doc ul li {
  margin-bottom: 0.6rem;
  line-height: 1.6;
}

.VPHome .vp-doc code {
  background: #FFE600;
  color: #111111;
  padding: 0.2rem 0.5rem;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid #111111;
}

.dark .VPHome .vp-doc code {
  background: #1A1A1A;
  color: #FFE600;
  border-color: #FFFFFF;
}

/* 引用块 */
.VPHome .vp-doc blockquote {
  border-left: 6px solid #FF3AF2;
  background: #F0F0EB;
  padding: 16px 24px;
  margin: 2rem 0;
  border-radius: 0 12px 12px 0;
  font-style: normal;
  border: 2px solid #111111;
  border-left: 6px solid #FF3AF2;
  box-shadow: 4px 4px 0px 0px #111111;
}

.VPHome .vp-doc blockquote p {
  margin: 0;
  font-weight: 700;
  color: #111111;
  text-align: center;
  font-size: 1.05rem;
}

/* ============================================================
   自定义内容样式 (index.md 中的 HTML/CSS 类)
   ============================================================ */
.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
  margin: 2rem 0;
}

.advantages > p {
  background: #FFFFFF;
  border: 2px solid #111111;
  border-radius: 0;
  padding: 22px;
  margin: 0;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 4px 4px 0px 0px #111111;
  transform: rotate(-0.2deg);
}

.advantages > p:hover {
  transform: translate(-3px, -3px) rotate(0deg) !important;
  box-shadow: 7px 7px 0px 0px #111111;
  border-color: #00F5D4;
}

.advantages > p strong {
  color: #FF3AF2;
  font-size: 1.05rem;
  display: block;
  margin-bottom: 10px;
  font-weight: 900;
}

.keyword-tags {
  text-align: center;
  margin: 2rem 0;
  padding: 28px;
  background: #FFFFFF;
  border: 2px solid #111111;
  box-shadow: 6px 6px 0px 0px #111111;
}

.keyword-tags code {
  display: inline-block;
  margin: 5px 6px;
  padding: 8px 14px;
  background: #FFE600;
  border: 2px solid #111111;
  border-radius: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #111111;
  transition: all 0.15s ease;
  cursor: pointer;
  box-shadow: 3px 3px 0px 0px #111111;
}

.keyword-tags code:hover {
  background: #FF3AF2;
  color: #FFFFFF;
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0px 0px #111111;
}

.platform-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin: 2rem 0;
}

.platform-stats > p {
  background: #FFFFFF;
  border: 2px solid #111111;
  border-radius: 0;
  padding: 20px 14px;
  margin: 0;
  text-align: center;
  transition: all 0.2s ease;
  box-shadow: 4px 4px 0px 0px #111111;
}

.platform-stats > p:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #111111;
  background: #00F5D4;
}

.platform-stats > p strong {
  color: #111111;
  font-size: 1rem;
  font-weight: 900;
  display: block;
  margin-bottom: 8px;
}

.footer-info {
  background: #FFFFFF;
  border: 3px solid #111111;
  border-radius: 0;
  padding: 28px 32px;
  margin: 3rem 0 2rem;
  text-align: center;
  box-shadow: 6px 6px 0px 0px #111111;
  position: relative;
}

.footer-info::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 24px;
  width: 60px;
  height: 4px;
  background: #FF3AF2;
  border: 2px solid #111111;
}

.footer-info p {
  margin-bottom: 12px;
  line-height: 1.6;
}

.footer-info a {
  color: #FF3AF2;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.footer-info a:hover {
  color: #111111;
  border-bottom: 2px solid #111111;
}

/* ============================================================
   侧边栏 - 几何风格
   ============================================================ */
.VPSidebar {
  background: var(--vp-sidebar-bg-color) !important;
  border-right: 3px solid #111111 !important;
}

.VPSidebarItem .text {
  font-weight: 600;
  font-size: 0.9rem;
}

.VPSidebarItem.is-active > .item .link .text {
  color: #FF3AF2;
  font-weight: 900;
}

.VPSidebarItem > .item .link:hover .text {
  color: #FF3AF2;
}

.dark .VPSidebar {
  border-right-color: #FFFFFF !important;
}

/* ============================================================
   文章页面
   ============================================================ */
.VPDoc .container {
  max-width: 900px;
}

.VPDoc h1 {
  font-size: 2.2rem;
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
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111111;
  border-left: 5px solid #FF3AF2;
  padding-left: 1rem;
  margin: 2.5rem 0 1rem;
  background: linear-gradient(90deg, rgba(255, 58, 242, 0.06), transparent);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.dark .VPDoc h2 {
  color: #FFFFFF;
}

.VPDoc h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #111111;
}

.dark .VPDoc h3 {
  color: #FFFFFF;
}

/* 表格 */
.VPDoc table {
  border: 2px solid #111111;
  border-collapse: collapse;
  width: 100%;
  box-shadow: 4px 4px 0px 0px #111111;
}

.VPDoc th {
  background: #111111;
  color: #FFFFFF;
  font-weight: 900;
  padding: 12px 16px;
  text-align: left;
}

.dark .VPDoc th {
  background: #FF3AF2;
}

.VPDoc td {
  border: 1px solid #E0E0DB;
  padding: 10px 16px;
}

.VPDoc tr:hover td {
  background: rgba(255, 230, 0, 0.08);
}

/* 代码块 */
.VPDoc div[class*='language-'] {
  border: 2px solid #111111;
  box-shadow: 5px 5px 0px 0px #111111;
  border-radius: 0;
}

.dark .VPDoc div[class*='language-'] {
  border-color: #FFFFFF;
  box-shadow: 5px 5px 0px 0px #FFFFFF;
}

/* ============================================================
   页脚
   ============================================================ */
.VPFooter {
  background: #111111 !important;
  border-top: 4px solid #FF3AF2 !important;
  padding: 2rem;
}

.VPFooter .message,
.VPFooter .copyright {
  color: #CCCCCC !important;
  font-size: 0.85rem;
}

.VPFooter a {
  color: #00F5D4 !important;
  font-weight: 700;
  text-decoration: none;
}

.VPFooter a:hover {
  color: #FFE600 !important;
}

.dark .VPFooter {
  background: #0A0A0A !important;
  border-top-color: #FFE600 !important;
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 768px) {
  .VPHome .VPHomeHero {
    padding: 60px 16px 48px !important;
  }

  .VPHome .VPHomeFeatures {
    padding: 0 16px 48px;
  }

  .VPHome .VPHomeFeatures .items {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .VPHome .VPHomeFeatures .item .VPFeature {
    transform: none !important;
    min-height: 160px;
  }

  .VPHome .VPHomeFeatures .item .VPFeature:hover {
    transform: translate(-2px, -2px) !important;
  }

  .advantages {
    grid-template-columns: 1fr;
  }

  .platform-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .keyword-tags {
    padding: 20px 16px;
  }

  .keyword-tags code {
    margin: 4px 3px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .footer-info {
    padding: 24px 20px;
    margin: 2rem 0 1rem;
  }

  .VPHome .VPHomeHero::before,
  .VPHome .VPHomeHero::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .platform-stats {
    grid-template-columns: 1fr;
  }

  .VPHome .VPHomeHero .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .VPHome .VPHomeHero .actions .action .VPButton {
    text-align: center;
    justify-content: center;
  }
}
</style>
