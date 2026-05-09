#!/usr/bin/env python3
"""Send welcome email via Resend API (called by subscribe.yml workflow)."""
import json, os, urllib.request, sys

email = os.environ['EMAIL']
resend_key = os.environ['RESEND_KEY']

html = '''<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;">
  <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:32px 24px;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">🌟</div>
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">欢迎订阅 devmini</h1>
    <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">免费优质资源推荐 · 每周一更新</p>
  </div>
  <div style="padding:28px 24px;background:#ffffff;">
    <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#2d2d2d;line-height:1.6;">你好呀 👋 感谢订阅！</p>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.85;">我们持续挖掘真正好用、免费、有价值的资源——工具网站、学习课程、开发资源，以及各种稀奇古怪但超实用的好东西。</p>
    <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.85;">📅 <strong>每周一（北京时间）</strong>整理本周精选资源推送给你，欢迎常来看看 👇</p>
    <a href="https://pan.devmini.space" style="display:block;text-align:center;background:#F5A623;color:#fff;text-decoration:none;padding:15px;border-radius:10px;font-weight:600;font-size:15px;margin-bottom:24px;">→ 探索 devmini 全部资源</a>
    <p style="margin:0;font-size:14px;color:#555;line-height:1.7;">使用中遇到问题或有想看的资源主题，欢迎联系我们：<br>📧 <a href="mailto:xi7ang@devmini.space" style="color:#4A90E2;text-decoration:none;">xi7ang@devmini.space</a></p>
  </div>
  <div style="padding:20px;background:#f0f2f5;text-align:center;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 6px;font-size:12px;color:#999;">devmini · 专注免费优质资源推荐</p>
    <div><a href="https://pan.devmini.space" style="color:#4A90E2;font-size:12px;text-decoration:none;">访问网站</a><span style="color:#ccc;margin:0 8px;">|</span><a href="https://t.me/xi7ang" style="color:#4A90E2;font-size:12px;text-decoration:none;">Telegram社群</a><span style="color:#ccc;margin:0 8px;">|</span><a href="https://qm.qq.com/q/EkPkbcVMaY" style="color:#4A90E2;font-size:12px;text-decoration:none;">QQ群</a></div>
  </div>
</body></html>'''

payload = {
    "from": "subscribe@devmini.space",
    "to": [email],
    "subject": "欢迎来到 devmini 🌟",
    "html": html
}

data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
req = urllib.request.Request(
    'https://api.resend.com/emails',
    data=data,
    headers={
        'Authorization': 'Bearer ' + resend_key,
        'Content-Type': 'application/json; charset=utf-8'
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print('OK:', result.get('id', 'unknown'))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print('HTTP Error', e.code, body)
    sys.exit(1)
