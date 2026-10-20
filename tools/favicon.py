"""Favicon e apple-touch-icon a partir do avatar da cliente (_ref/avatar-cliente.jpg).
O branco de fora do contorno vira transparente; o rosto fica inteiro (branco com traço preto).
Uso: python tools/favicon.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
im = Image.open(os.path.join(SITE, '..', '_ref', 'avatar-cliente.jpg')).convert('L')
bw = im.point(lambda v: 255 if v > 140 else 0)
for x, y in [(0, 0), (bw.width - 1, 0), (0, bw.height - 1), (bw.width - 1, bw.height - 1)]:
    if bw.getpixel((x, y)) == 255:
        ImageDraw.floodfill(bw, (x, y), 128)
fora = np.array(bw) == 128
alfa = Image.fromarray(np.where(fora, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
rgba = Image.merge('RGBA', (im, im, im, alfa))
x0, y0, x1, y1 = alfa.point(lambda v: 255 if v > 8 else 0).getbbox()
lado = max(x1 - x0, y1 - y0); meio = lado // 2 + int(lado * .03)
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
quad = Image.new('RGBA', (2 * meio, 2 * meio), (0, 0, 0, 0))
quad.paste(rgba.crop((cx - meio, cy - meio, cx + meio, cy + meio)), (0, 0))
for nome, tam in [('favicon-64.png', 64), ('apple-touch-icon.png', 180), ('favicon-32.png', 32)]:
    quad.resize((tam, tam), Image.LANCZOS).save(os.path.join(SITE, nome), optimize=True)
print('ok', quad.size)
