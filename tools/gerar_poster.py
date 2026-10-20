"""Renderiza o drapeado de gesso (assets/js/relevo.js) num Edge headless e salva os pôsteres que aparecem antes do
WebGL carregar, sem WebGL e com movimento reduzido: assets/img/relevo.webp (desktop) e relevo-m.webp (celular).
Uso: python tools/gerar_poster.py"""
import os, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
IMG = os.path.join(SITE, 'assets', 'img')
# arquivo, largura, altura (o site começa a animação na fase 0)
POSTERES = [('relevo.webp', 2560, 1440), ('relevo-m.webp', 864, 1872)]

if __name__ == '__main__':
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for nome, w, h in POSTERES:
            pg = b.new_page(viewport={'width': w, 'height': h})
            pg.set_content(f'<body style="margin:0"><canvas id="c" width="{w}" height="{h}"></canvas></body>')
            pg.add_script_tag(path=os.path.join(SITE, 'assets', 'js', 'relevo.js'))
            png = base64.b64decode(pg.evaluate("(relevoGL(document.getElementById('c'), {preserveDrawingBuffer: true}).desenhar(0), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])
            Image.open(io.BytesIO(png)).convert('RGB').save(os.path.join(IMG, nome), 'WEBP', quality=86)
            print(nome, w, 'x', h)
            pg.close()
        b.close()
