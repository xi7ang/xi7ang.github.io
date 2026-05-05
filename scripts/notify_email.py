#!/usr/bin/env python3
"""Send resource update notification via Resend Broadcast API."""
import os, json, urllib.request, sys

# Read JSON from stdin (list of {category, file, lines:[...]})
try:
    data = json.load(sys.stdin)
except:
    data = []

cat_map = {
    'AIknowledge': ('🔥', 'AI知识'),
    'book': ('📚', '书籍资料'),
    'curriculum': ('🎓', '课程资料'),
    'tools': ('🔧', '工具合集'),
    'games': ('🎮', '游戏资源'),
    'movies': ('🎬', '影视媒体'),
    'healthy': ('💪', '健康养生'),
    'self-media': ('🎙️', '自媒体'),
    'edu-knowlege': ('📖', '教育知识'),
    'chinese-traditional': ('🏯', '传统文化'),
    'cross-border': ('🌐', '跨境电商'),
    'auto': ('⚙️', '自动'),
}

# Flatten and limit to 15 total resource lines
all_lines = []
for entry in data:
    cat = entry.get('category', '')
    for line in entry.get('lines', []):
        if len(all_lines) >= 15:
            break
        all_lines.append((cat, line))

count = len(all_lines)

resource_html = ''
for cat, line in all_lines:
    # Parse "- 资源名称 | https://..." format
    parts = line.split('|')
    if len(parts) != 2:
        continue
    name = parts[0].strip()
    if name.startswith('- '):
        name = name[2:]
    link = parts[1].strip()
    emoji, cat_label = cat_map.get(cat, ('📦', cat))
    resource_html += (
        '<a href="' + link + '" style="display:block;padding:12px 16px;border-bottom:1px solid #f0f0f0;text-decoration:none;">'
        '<div style="display:flex;align-items:center;">'
        '<span style="font-size:18px;margin-right:10px;">' + emoji + '</span>'
        '<div><div style="font-weight:600;color:#222;font-size:14px;line-height:1.4;">' + name + '</div>'
        '<div style="color:#4A90E2;font-size:12px;margin-top:4px;">🔗 夸克网盘直达</div></div></div></a>'
    )

if count == 0:
    subject = '✅ devmini 本周无新增资源，保持关注'
elif count <= 3:
    subject = '🔥 新鲜出炉！' + str(count) + '个资源已更新，速来查看'
elif count <= 10:
    subject = '🎉 本周' + str(count) + '个新资源上线，建议收藏'
else:
    subject = '🔥 炸裂！本周' + str(count) + '个优质资源更新，点击查看'

html = (
    '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;">'
    '<div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:32px 24px;text-align:center;">'
    '<div style="font-size:28px;margin-bottom:8px;">🔥</div>'
    '<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">devmini 本周资源更新</h1>'
    '<p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">精选资源 · 持续更新 · 免费下载</p>'
    '</div>'
    '<div style="padding:24px 20px;background:#ffffff;">'
    '<h2 style="font-size:15px;color:#666;margin:0 0 16px;font-weight:500;">📦 本周新增 ' + str(count) + ' 个资源</h2>'
    '<div style="border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">' + resource_html + '</div>'
    '<a href="https://pan.devmini.space" style="display:block;text-align:center;background:#F5A623;color:#fff;text-decoration:none;padding:15px;border-radius:10px;font-weight:600;font-size:15px;margin-top:20px;">→ 查看全部资源</a>'
    '<div style="margin-top:24px;padding:16px;background:#f0f7ff;border-radius:8px;border-left:4px solid #4A90E2;">'
    '<p style="margin:0;font-size:13px;color:#555;line-height:1.6;">💡 <strong>提示：</strong>资源收集整理自全网，优先更新夸克网盘资源。如链接失效请在网站留言或加入社群反馈。</p>'
    '</div></div>'
    '<div style="padding:20px;background:#f0f2f5;text-align:center;border-top:1px solid #e0e0e0;">'
    '<p style="margin:0 0 6px;font-size:12px;color:#999;">你收到这封邮件是因为订阅了 devmini 资源更新通知 · 每周一更新</p>'
    '<div><a href="https://pan.devmini.space" style="color:#4A90E2;font-size:12px;text-decoration:none;">访问网站</a>'
    '<span style="color:#ccc;margin:0 8px;">|</span>'
    '<a href="https://t.me/xi7ang" style="color:#4A90E2;font-size:12px;text-decoration:none;">Telegram社群</a>'
    '<span style="color:#ccc;margin:0 8px;">|</span>'
    '<a href="https://qm.qq.com/q/EkPkbcVMaY" style="color:#4A90E2;font-size:12px;text-decoration:none;">QQ群</a></div>'
    '</div></body></html>'
)

payload = {'from': 'subscribe@devmini.space', 'segment_id': '0d91d539-9540-4cba-8554-c80cfd443b2e', 'subject': subject, 'html': html, 'send': True}
req = urllib.request.Request(
    'https://api.resend.com/broadcasts',
    data=json.dumps(payload).encode('utf-8'),
    headers={'Authorization': 'Bearer ' + os.environ['RESEND_KEY'], 'Content-Type': 'application/json', 'User-Agent': 'resend-python/1.0'},
    method='POST',
)
print('DEBUG RESEND_KEY prefix:', os.environ.get('RESEND_KEY', 'NOT SET')[:10])
print('Total resources:', count)
try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print('Broadcast sent! ID: ' + str(result.get('id', 'unknown')))
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code, e.read().decode())
