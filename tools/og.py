"""Gera og.jpg (1200x630) com Playwright/Edge: relevo de gesso, logo e duas fotos. Uso: python tools/og.py"""
import os, pathlib
from playwright.sync_api import sync_playwright
B = pathlib.Path(__file__).resolve().parent.parent
logo = (B/'assets/img/logo.svg').read_text()
u = lambda p: (B/p).as_uri()
og = f"""<body style="margin:0;width:1200px;height:630px;background:#e7e6e3 url({u('assets/img/relevo.webp')}) 30% center/cover;color:#0d0d0f;font-family:'JetBrains Mono',monospace;position:relative;overflow:hidden">
<div style="position:absolute;inset:0;background:radial-gradient(ellipse 45% 60% at 36% 50%,rgba(231,230,227,.92),rgba(231,230,227,.2))"></div>
<img src="{u('assets/img/hero-1.webp')}" style="position:absolute;right:300px;top:70px;width:250px;height:312px;object-fit:cover;outline:1px solid #0d0d0f;outline-offset:6px">
<img src="{u('assets/img/hero-5.webp')}" style="position:absolute;right:40px;top:248px;width:250px;height:312px;object-fit:cover;outline:1px solid #0d0d0f;outline-offset:6px">
<div style="position:absolute;left:70px;top:0;width:520px;height:630px;display:flex;flex-direction:column;justify-content:center;gap:30px">
<div style="width:500px;color:#0d0d0f">{logo}</div>
<div style="font-size:21px;letter-spacing:.12em;text-transform:uppercase">Cybertribal · Free hand</div>
<div style="font-size:17px;letter-spacing:.12em;text-transform:uppercase;color:#c8102e">Santana · Zona Norte de SP</div></div></body>"""
with sync_playwright() as p:
    br = p.chromium.launch(channel='msedge'); pg = br.new_page(viewport={'width':1200,'height':630})
    tmp = B/'tools/_og.html'; tmp.write_text(og, encoding='utf8'); pg.goto(tmp.as_uri()); pg.wait_for_timeout(800); tmp.unlink(); pg.screenshot(path=str(B/'og.jpg'), type='jpeg', quality=82)
    br.close()
print('ok', os.path.getsize(B/'og.jpg')//1024, 'KB')
