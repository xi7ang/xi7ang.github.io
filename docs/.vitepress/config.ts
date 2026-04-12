// @ts-nocheck
import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

function getSidebarItems(dir: string) {
  const files = fs.readdirSync(path.join(__dirname, '../', dir))
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .sort() // Sort files alphabetically or by date if naming convention allows

  return files.map(file => {
    const name = path.basename(file, '.md')
    return {
      text: name,
      link: `/${dir}/${name}`
    }
  })
}

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: '/',
  title: "超过 100T 的资源",
  titleTemplate: ":title - xi7ang 资源收集站 | 免费资源下载",
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,
  sitemap: {
    hostname: 'https://pan.devmini.space'
  },
  vite: {
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
    build: {
      rollupOptions: {
        // pagefind.js 是 pagefind CLI 构建后输出的 ES Module，不应被 Vite 打包
        // 浏览器从 /pagefind/ 路径直接加载，保留原样
        external: ['/pagefind/pagefind.js']
      },
      minify: 'esbuild',
      sourcemap: false,
    },
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    }
  },
  ignoreDeadLinks: true,
  description: "超过100T免费资源下载站，包含AI知识、书籍资料、跨境电商、自媒体、教育、健康、影视、工具等海量资源，持续更新中",
  head: [
    // 基础网站图标配置
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    
    // Apple 设备图标
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon-152x152.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-touch-icon-144x144.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon-114x114.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-touch-icon-76x76.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-touch-icon-72x72.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-touch-icon-60x60.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon-57x57.png' }],
    
    // Android Chrome 图标
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' }],
    
    // PWA 相关
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'alternate', type: 'application/atom+xml', title: 'xi7ang 资源收集站更新订阅', href: '/atom.xml' }],
    ['meta', { name: 'msapplication-TileColor', content: '#2d89ef' }],
    ['meta', { name: 'msapplication-TileImage', content: '/mstile-144x144.png' }],
    ['meta', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    
    // Open Graph / 社交媒体分享图标
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'xi7ang 资源收集站 | 超过 100T+ 资源' }],
    ['meta', { property: 'og:description', content: 'A collection of resources including AI, books, traditional Chinese culture, cross-border e-commerce, self-media, education, health, movies, and tools.' }],
    ['meta', { property: 'og:image', content: '/og-image.webp' }],
    ['meta', { property: 'og:image:width', content: '630' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:url', content: 'https://pan.devmini.space' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'xi7ang 资源收集站 | 超过 100T+ 资源' }],
    ['meta', { name: 'twitter:description', content: 'A collection of resources including AI, books, traditional Chinese culture, cross-border e-commerce, self-media, education, health, movies, and tools.' }],
    ['meta', { name: 'twitter:image', content: '/og-image.webp' }],
    
    // SEO 关键字和其他元标签
    ['meta', { name: 'keywords', content: '免费资源下载,AI知识,游戏资源,Steam游戏,安卓游戏,书籍资料,跨境电商,自媒体,教育资源,健康养生,影视资源,工具软件,100T资源,网盘资源,夸克网盘,阿里网盘' }],
    ['meta', { name: 'author', content: 'xi7ang 资源收集站' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
    ['meta', { name: 'revisit-after', content: '1 days' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: 'xi7ang 资源收集站' }],
    
    // 结构化数据 (JSON-LD)
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'xi7ang 资源收集站',
        description: '超过100T免费资源下载站，包含AI知识、书籍资料、跨境电商、自媒体、教育、健康、影视、工具等海量资源',
        url: 'https://pan.devmini.space',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://pan.devmini.space/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        },
        author: {
          '@type': 'Organization',
          name: 'xi7ang 资源收集站',
          url: 'https://pan.devmini.space'
        },
        publisher: {
          '@type': 'Organization',
          name: 'xi7ang 资源收集站',
          url: 'https://pan.devmini.space'
        }
      })
    ],
    
    [
      'meta',
      {
        name: 'google-site-verification',
        content: 'lI-wB0SQ6fXo-tUmUtTvz_9Qa65EMnPl_9PUuxhCJoI'
      }
    ],
    // Preconnect 加速第三方资源加载
    ['link', { rel: 'preconnect', href: 'https://busuanzi.ibruce.info' }],
    ['link', { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com' }],
    ['link', { rel: 'preconnect', href: 'https://js.stripe.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://busuanzi.ibruce.info' }],
    ['link', { rel: 'dns-prefetch', href: 'https://pagead2.googlesyndication.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://js.stripe.com' }],

    [
      'script',
      {
        async: true,
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2634092855285462',
        crossorigin: 'anonymous'
      },
    ],
    [
      'script',
      {
        defer: true,
        src: 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
      }
    ],
    [
      'script',
      {
        async: true,
        src: 'https://js.stripe.com/v3/buy-button.js'
      }
    ],
    [
      'script',
      { defer: true },
      `
        // 全局不蒜子统计管理（defer 脚本，不阻塞 HTML 解析）
        window.busuanziReady = false;
        window.refreshBusuanzi = function() {
          if (window.busuanziReady && window.bszCaller) {
            try {
              const timeout = setTimeout(function() { window.showBusuanziError(); }, 8000);
              window.bszCaller.fetch('//busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback', function(data) {
                clearTimeout(timeout);
                if (window.bszTag && data) { window.bszTag.texts(data); window.bszTag.shows(); }
                else { window.showBusuanziError(); }
              });
            } catch (e) { window.showBusuanziError(); }
          } else { setTimeout(function() { window.refreshBusuanzi(); }, 2000); }
        };
        window.showBusuanziError = function() {
          var uv = document.getElementById('busuanzi_value_site_uv');
          var pv = document.getElementById('busuanzi_value_site_pv');
          var uvc = document.getElementById('busuanzi_container_site_uv');
          var pvc = document.getElementById('busuanzi_container_site_pv');
          if (uv) uv.textContent = '统计服务暂时不可用';
          if (pv) pv.textContent = '统计服务暂时不可用';
          if (uvc) uvc.style.display = 'none';
          if (pvc) pvc.style.display = 'none';
        };
        (function() {
          var count = 0;
          function check() {
            if (window.bszCaller && window.bszTag) { window.busuanziReady = true; return; }
            if (++count < 50) setTimeout(check, 100);
          }
          check();
        })();
      `
    ]
  ],
  themeConfig: {
    nav: [
      { text: '点击加入QQ群：1095868992', link: 'https://qm.qq.com/q/EkPkbcVMaY' },
      { text: '📣 加入 Telegram 社群', link: 'https://t.me/xi7ang' },
      { text: '首页', link: '/' },
      { text: '所有资源', link: '/AIknowledge/' }, // 指向第一个资源分类，用户可以通过侧边栏切换
      { text: '💖 赞赏支持', link: '/support' },
      { text: '免责声明', link: '/disclaimer' }
    ],
    search: {
      provider: 'local'
    },
    sidebar: [
      {
        text: '资源分类', // 侧边栏的标题
        items: [
          {
            text: 'AI 知识',
            collapsed: true,
            items: [
              { text: 'AI 知识主页', link: '/AIknowledge/' },
              ...getSidebarItems('AIknowledge')
            ]
          },
          {
            text: '书籍资料',
            collapsed: true,
            items: [
              { text: '书籍资料主页', link: '/book/' },
              ...getSidebarItems('book')
            ]
          },
          {
            text: '传统文化',
            collapsed: true,
            items: [
              { text: '传统文化主页', link: '/chinese-traditional/' },
              ...getSidebarItems('chinese-traditional')
            ]
          },
          {
            text: '跨境电商',
            collapsed: true,
            items: [
              { text: '跨境电商主页', link: '/cross-border/' },
              ...getSidebarItems('cross-border')
            ]
          },
          {
            text: '课程资料',
            collapsed: true,
            items: [
              { text: '课程资料主页', link: '/curriculum/' },
              ...getSidebarItems('curriculum')
            ]
          },
          {
            text: '教育知识',
            collapsed: true,
            items: [
              { text: '教育知识主页', link: '/edu-knowlege/' },
              ...getSidebarItems('edu-knowlege')
            ]
          },
          {
            text: '游戏资源',
            collapsed: true,
            items: [
              { text: '游戏资源主页', link: '/games/' },
              ...getSidebarItems('games')
            ]
          },
          {
            text: '健康养生',
            collapsed: true,
            items: [
              { text: '健康养生主页', link: '/healthy/' },
              ...getSidebarItems('healthy')
            ]
          },
          {
            text: '影视媒体',
            collapsed: true,
            items: [
              { text: '影视媒体主页', link: '/movies/' },
              ...getSidebarItems('movies')
            ]
          },
          {
            text: '自媒体',
            collapsed: true,
            items: [
              { text: '自媒体主页', link: '/self-media/' },
              ...getSidebarItems('self-media')
            ]
          },
          {
            text: '工具合集',
            collapsed: true,
            items: [
              { text: '工具合集主页', link: '/tools/' },
              ...getSidebarItems('tools')
            ]
          },
        ]
      }
    ],
    footer: {
      message: '友情链接: <a href="https://devmini.space/blog">DevMini博客</a> | <a href="/disclaimer">免责声明</a> | 如有侵权，请联系删除。<br><span id="busuanzi_container_site_uv">访客数 <span id="busuanzi_value_site_uv"></span> 人次</span>，<span id="busuanzi_container_site_pv">本站总访问量 <span id="busuanzi_value_site_pv"></span> 次</span>',
      copyright: 'Copyright © 2025-present xi7ang · 3511035605@qq.com'
    }
  }
})
