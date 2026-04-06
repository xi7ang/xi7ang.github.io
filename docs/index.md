---
layout: home

title: xi7ang 资源收集站 - 超过100T免费资源下载
description: 免费提供超过100T海量资源下载，包含AI知识、书籍资料、跨境电商、自媒体、教育、健康、影视、工具等各类资源，持续更新，全部免费下载
---

<script setup>
import { ref, onMounted } from 'vue'

// 分类数据 - 手动维护，资源增加时更新这里的数字
const categories = ref([
  { icon: '🤖', name: 'AI知识', desc: 'GPT·MJ·SD·变现', link: '/AIknowledge/', count: 28, color: '#FF3AF2' },
  { icon: '📚', name: '书籍资料', desc: '电子书·PDF·kindle', link: '/book/', count: 45, color: '#00F5D4' },
  { icon: '🎬', name: '影视娱乐', desc: '电影·纪录片·综艺', link: '/movies/', count: 67, color: '#FFE600' },
  { icon: '🔧', name: '工具合集', desc: '软件·插件·破解版', link: '/tools/', count: 89, color: '#FF3AF2' },
  { icon: '🌍', name: '跨境电商', desc: '亚马逊·TikTok·外贸', link: '/cross-border/', count: 35, color: '#00F5D4' },
  { icon: '📱', name: '自媒体', desc: '流量·变现·短视频', link: '/self-media/', count: 42, color: '#FFE600' },
  { icon: '🎓', name: '教育资源', desc: 'K12·考证·职业', link: '/edu-knowlege/', count: 38, color: '#FF3AF2' },
  { icon: '💪', name: '健康养生', desc: '健身·营养·心理', link: '/healthy/', count: 25, color: '#00F5D4' },
  { icon: '🏛️', name: '传统文化', desc: '中医·国学·古籍', link: '/chinese-traditional/', count: 18, color: '#FFE600' },
  { icon: '📝', name: '课程资料', desc: '得到·热门课·综合', link: '/curriculum/', count: 30, color: '#FF3AF2' },
  { icon: '💻', name: '自动化工具', desc: '脚本·效率·工具', link: '/auto/', count: 15, color: '#00F5D4' },
  { icon: '🎭', name: '影视在线', desc: '在线看·免下载', link: '/movie-recommendations/', count: 50, color: '#FFE600' },
])

const recentCategories = ref([
  { icon: '📚', name: '书籍资料', updated: '新增 300本商业经典书籍', link: '/book/', date: '2026-04' },
  { icon: '🎬', name: '影视娱乐', updated: '新增迪士尼动画139部蓝光版', link: '/movies/', date: '2026-04' },
  { icon: '🎓', name: '课程资料', updated: '新增奇门遁甲从入门到精通', link: '/curriculum/', date: '2026-04' },
  { icon: '🔧', name: '工具合集', updated: '新增抖音海外版TikTok', link: '/tools/', date: '2026-04' },
])

const stats = ref({
  total: '100TB+',
  categories: 12,
  updateFreq: '每日更新',
  group: '1095868992'
})
</script>

<!-- ======================================================
     首页主体
     ====================================================== -->

<!-- Hero 区域 -->
<div class="home-hero">
  <div class="hero-bg-deco">
    <div class="deco-circle deco-1"></div>
    <div class="deco-circle deco-2"></div>
    <div class="deco-square deco-3"></div>
  </div>

  <div class="hero-content">
    <div class="hero-badge">🎯 专注免费 · 品质保证</div>
    <h1 class="hero-title">
      <span class="hero-title-main">xi7ang 资源站</span>
      <span class="hero-title-sub">超过 100T 免费资源下载</span>
    </h1>
    <p class="hero-tagline">🚀 免费 · 海量 · 持续更新 · 全网最全资源导航</p>

    <div class="hero-actions">
      <a href="/AIknowledge/" class="hero-btn hero-btn-primary">
        🚀 开始探索
      </a>
      <a href="https://qm.qq.com/q/EkPkbcVMaY" class="hero-btn hero-btn-secondary" target="_blank">
        📞 加入QQ群
      </a>
      <a href="https://github.com/xi7ang" class="hero-btn hero-btn-ghost" target="_blank">
        ⭐ GitHub
      </a>
    </div>
  </div>
</div>

<!-- 数据统计条 -->
<div class="stats-bar">
  <div class="stat-item">
    <span class="stat-number">100TB+</span>
    <span class="stat-label">资源总量</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-number">12</span>
    <span class="stat-label">资源分类</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-number">每日</span>
    <span class="stat-label">持续更新</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-number">10万+</span>
    <span class="stat-label">用户正在使用</span>
  </div>
</div>

<!-- 搜索区域 -->
<div class="search-section">
  <div class="search-container">
    <div class="search-icon">🔍</div>
    <input
      type="search"
      class="search-input"
      placeholder="搜索 AI教程 电子书 跨境电商 影视资源..."
      autocomplete="off"
    />
    <div class="search-hint">按 Enter 搜索全站</div>
  </div>
  <div class="search-tags">
    <span class="search-tag-label">热门:</span>
    <a href="/AIknowledge/" class="search-tag">AI教程</a>
    <a href="/book/" class="search-tag">电子书</a>
    <a href="/movies/" class="search-tag">电影资源</a>
    <a href="/cross-border/" class="search-tag">TikTok营销</a>
    <a href="/tools/" class="search-tag">软件工具</a>
    <a href="/self-media/" class="search-tag">自媒体运营</a>
  </div>
</div>

<!-- 分类网格 (核心区域) -->
<div class="category-section">
  <div class="section-header">
    <h2 class="section-title">📂 全部资源分类</h2>
    <span class="section-subtitle">点击任意分类，快速找到你需要的资源</span>
  </div>

  <div class="category-grid">
    <a
      v-for="(cat, index) in categories"
      :key="cat.name"
      :href="cat.link"
      class="category-card"
      :style="{ '--card-color': cat.color, '--card-delay': index * 0.05 + 's' }"
    >
      <div class="card-icon-wrap">
        <span class="card-icon">{{ cat.icon }}</span>
      </div>
      <div class="card-info">
        <h3 class="card-name">{{ cat.name }}</h3>
        <p class="card-desc">{{ cat.desc }}</p>
      </div>
      <div class="card-footer">
        <span class="card-count">{{ cat.count }}+ 份资源</span>
        <span class="card-arrow">→</span>
      </div>
      <div class="card-shine"></div>
    </a>
  </div>
</div>

<!-- 本月最新 -->
<div class="recent-section">
  <div class="section-header">
    <h2 class="section-title">🔥 本月最新资源</h2>
    <a href="/AIknowledge/" class="section-more">查看全部 →</a>
  </div>

  <div class="recent-grid">
    <a
      v-for="item in recentCategories"
      :key="item.name"
      :href="item.link"
      class="recent-card"
    >
      <span class="recent-icon">{{ item.icon }}</span>
      <div class="recent-info">
        <span class="recent-cat">{{ item.name }}</span>
        <span class="recent-update">{{ item.updated }}</span>
      </div>
      <span class="recent-date">{{ item.date }}</span>
    </a>
  </div>
</div>

<!-- 平台优势 -->
<div class="advantages-section">
  <div class="section-header">
    <h2 class="section-title">💡 为什么选择我们</h2>
  </div>

  <div class="advantages-grid">
    <div class="advantage-card">
      <div class="adv-icon">💯</div>
      <h3>完全免费</h3>
      <p>所有资源100%免费下载，永无隐藏费用，让知识传播无障碍</p>
    </div>
    <div class="advantage-card">
      <div class="adv-icon">🔄</div>
      <h3>持续更新</h3>
      <p>每日更新最新优质资源，紧跟时代潮流，保持内容新鲜度</p>
    </div>
    <div class="advantage-card">
      <div class="adv-icon">⭐</div>
      <h3>品质保证</h3>
      <p>专业团队精心筛选，严格把关资源质量，拒绝低质灌水内容</p>
    </div>
    <div class="advantage-card">
      <div class="adv-icon">🌐</div>
      <h3>多平台支持</h3>
      <p>支持夸克网盘、阿里网盘、百度网盘等主流平台，下载便捷</p>
    </div>
  </div>
</div>

<!-- 底部操作区 -->
<div class="cta-section">
  <div class="cta-card">
    <h2>📦 准备好了吗？</h2>
    <p>超过100TB资源，全部免费，持续更新中</p>
    <div class="cta-buttons">
      <a href="/AIknowledge/" class="cta-btn cta-btn-primary">🚀 立即开始探索</a>
      <a href="https://qm.qq.com/q/EkPkbcVMaY" class="cta-btn cta-btn-secondary" target="_blank">📞 加入交流群</a>
    </div>
  </div>
</div>

<!-- 页脚信息 -->
<div class="footer-info">
  <p>💡 <strong>温馨提示</strong>: 所有资源仅供学习交流使用，请支持正版。如有版权问题，请及时联系我们处理。</p>
  <p>📧 联系方式: 3511035605@qq.com | QQ群: <a href="https://qm.qq.com/q/EkPkbcVMaY" target="_blank">1095868992</a></p>
  <p class="footer-update"><UpdateTime /></p>
</div>

<GitHubLink />
<SupportSection />
