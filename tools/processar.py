"""Gera as imagens do site a partir de _ref/ig (posts e destaques). Uso: python site/tools/processar.py"""
import json, os
from PIL import Image, ImageOps
R = os.path.join(os.path.dirname(__file__), '..', '..', '_ref', 'ig')
A = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img')
for d in ('obras', 'flash', 'fh'): os.makedirs(f'{A}/{d}', exist_ok=True)

# (post, categoria, título, fotos do post, desvio vertical do recorte da capa 0..1)
OBRAS = [
 (65,'sigil','Borboleta nas costas',['1','2'],.4),
 (28,'grande','Braço inteiro no free hand',['1','2','3','4'],.35),
 (20,'grande','Perna biomecânica',['1','2','3','4','5'],.45),
 (33,'sigil','Ombro no free hand',['1','2','3'],.45),
 (95,'tribal','Antebraço em preto chapado',['4'],.5),
 (3,'sigil','Braço com sigilos',['1','2','3v'],.4),
 (90,'cor','Braço em preto e vermelho',['1'],.4),
 (1,'grande','Perna cybertribal',['1v'],.4),
 (9,'grande','Bíceps biomecânico',['1','2'],.5),
 (102,'tribal','Mão e dedos',['3','1','2'],.5),
 (54,'sigil','Coluna',['1v'],.45),
 (64,'grande','Joelhos em par',['1','2'],.5),
 (109,'cor','Red & black na mão',['1','2'],.5),
 (10,'sigil','Mão e antebraço',['1v'],.5),
 (51,'tribal','Marca do Gyomei',['1','2'],.5),
 (129,'anime','Genya, Demon Slayer',['1','2v'],.5),
 (24,'grande','Perna em cyberpunk',['1','2','3','5'],.4),
 (18,'tribal','Cobertura de cicatrizes',['3','1','2'],.5),
 (66,'sigil','Ombro e braço',['1','2'],.4),
 (117,'tribal','Antebraço afiado',['1','2'],.5),
 (77,'cor','Tesoura em preto e vermelho',['1','2','3'],.5),
 (5,'sigil','Adaga no antebraço',['1'],.5),
 (63,'tribal','Peito cybertribal',['1','2'],.5),
 (99,'grande','Joelho biomecânico',['2','1'],.5),
 (69,'sigil','Pescoço',['1','2'],.4),
 (133,'anime','Obito Uchiha',['1','2'],.5),
 (86,'tribal','Coração cybertribal',['1','2'],.5),
 (73,'sigil','Mão com sigilo',['1','2','3'],.5),
 (110,'cor','Olho de Hórus',['1'],.5),
 (83,'grande','Coxa ornamental',['1','2'],.5),
 (108,'tribal','Mão em preto',['1','2'],.5),
 (47,'sigil','Deftones, Cherry Waves',['1','2'],.5),
 (131,'anime','Zoro',['1'],.5),
 (5,'sigil','Mão inteira',['2'],.5),
 (112,'tribal','Antebraço e mão',['1','2'],.5),
 (76,'sigil','Antebraço em traço fino',['1','2'],.5),
 (127,'anime','Killer Queen, JoJo',['1'],.5),
 (93,'tribal','Free hand na coxa',['1','2'],.5),
 (92,'sigil','Mão e punho',['1','2','3'],.5),
 (120,'tribal','Cotovelo',['1','2'],.5),
 (62,'sigil','Motionless in White',['1','2'],.5),
 (132,'anime','Sapinho sorridente',['1','2'],.5),
 (98,'tribal','Mão em espinhos',['1','2'],.5),
 (39,'sigil','Escrita com ornamento',['1','2'],.4),
 (124,'anime','Espadas do Zoro e chapéu do Luffy',['1'],.5),
 (67,'tribal','Corinthians cybertribal',['1'],.5),
 (107,'sigil','Antebraço ornamental',['1','2'],.5),
 (81,'tribal','Antebraço tribal',['1','2'],.5),
 (70,'sigil','Lombar',['1','2'],.5),
 (106,'sigil','Coração afiado',['1','2'],.5),
 (128,'anime','Jean Kirstein, Shingeki',['1'],.5),
 (80,'tribal','Cybertribal no braço',['1v'],.5),
 (53,'sigil','Coxa em cybersigil',['1v'],.5),
 (45,'tribal','Tribal no antebraço',['1v'],.5),
]
HERO = [('065_1',.3),('028_1',.35),('020_1',.45),('033_1',.45),('095_4',.5)]
# free hand: (desenho de caneta, tattoo pronta, título)
FH = [('033_4','033_1','Ombro'),('028_5','028_2','Braço inteiro'),('071_3','071_1','Peito'),('009_3','009_1','Bíceps')]
FLASH = ['011_2','011_12','011_13','011_15','011_17','011_19','011_20','011_6','011_1','021_1','021_7','026_1']

def corta(im, ar, dy=.5):
    w, h = im.size
    if w/h > ar: nw = int(h*ar); x = (w-nw)//2; return im.crop((x,0,x+nw,h))
    nh = int(w/ar); y = int((h-nh)*dy); return im.crop((0,y,w,y+nh))
def salva(im, p, w, q=80):
    im = im.convert('RGB')
    if im.width > w: im = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
    im.save(p, 'WEBP', quality=q, method=6)
dados = json.load(open(f'{R}/dados.json', encoding='utf8'))
img = lambda nome: ImageOps.exif_transpose(Image.open(f'{R}/{nome}.jpg'))
saida = []
for i,(n,cat,tit,fotos,dy) in enumerate(OBRAS, 1):
    p = dados[f'{n:03d}']; ids = []
    for k,f in enumerate(fotos, 1):
        im = img(f'{n:03d}_{f}')
        if k == 1: salva(corta(im, 4/5, dy), f'{A}/obras/{i:02d}.webp', 720, 78)
        salva(im, f'{A}/obras/{i:02d}-{k}.webp', 1280, 80); ids.append(f'{i:02d}-{k}')
    saida.append({'id': f'{i:02d}', 'cat': cat, 'titulo': tit, 'fotos': ids, 'data': p['data'], 'ig': p['code']})
for i,(f,dy) in enumerate(HERO, 1):
    salva(corta(img(f), 4/5, dy), f'{A}/hero-{i}.webp', 900, 82)
for i,(a,b,_) in enumerate(FH, 1):
    salva(corta(img(a), 4/5, .45), f'{A}/fh/{i}-a.webp', 900, 80)
    salva(corta(img(b), 4/5, .45), f'{A}/fh/{i}-b.webp', 900, 80)
for i,f in enumerate(FLASH, 1):
    im = img(f); salva(corta(im, 4/5, .5), f'{A}/flash/{i:02d}.webp', 720, 80); salva(im, f'{A}/flash/{i:02d}-g.webp', 1280, 82)
json.dump(saida, open(os.path.join(os.path.dirname(__file__), '..', 'assets', 'obras.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(saida), 'obras')
