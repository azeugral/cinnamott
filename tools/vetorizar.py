"""Vetoriza o logo (gerado por IA no Figma, _ref/gerado/logo-ia-1.png) e o avatar da cliente -> SVG.
Uso, a partir da pasta do projeto: python site/tools/vetorizar.py"""
import numpy as np, potrace
from PIL import Image, ImageFilter
def vet(src, dst, escala, limiar=128, blur=2.0, inverter=False):
    im = Image.open(src).convert('L')
    im = im.resize((im.width*escala, im.height*escala), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
    a = np.array(im) > limiar
    if inverter: a = ~a
    bm = potrace.Bitmap(a)
    path = bm.trace(turdsize=30, alphamax=1.0, opticurve=True, opttolerance=0.3)
    h, w = a.shape
    ys,xs=np.where(~a if not inverter else a); pad=int(4*escala)  # caixa justa em volta da tinta
    x0,y0,x1,y1=max(xs.min()-pad,0),max(ys.min()-pad,0),min(xs.max()+pad,w),min(ys.max()+pad,h)
    parts = []
    for c in path:
        s = c.start_point; d = [f'M{s.x:.1f} {s.y:.1f}']
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}')
            else: d.append(f'C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}')
        parts.append(''.join(d)+'Z')
    open(dst,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}"><path fill="currentColor" fill-rule="evenodd" d="{"".join(parts)}"/></svg>')
    print(dst, len(parts), 'contornos', (x1-x0), (y1-y0))
vet('_ref/gerado/logo-ia-1.png', 'site/assets/img/logo.svg', 2, blur=1.2)
vet('_ref/avatar-cliente.jpg', 'site/assets/img/mascote.svg', 1, limiar=110, blur=1.6)
