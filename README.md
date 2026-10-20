# cinnamott · site

Site de apresentação da Carol ([@cinnamott](https://www.instagram.com/cinnamott/)), tatuadora em Santana, Zona Norte de São Paulo. Cybertribal, cybersigilismo e free hand.

Publicado em https://azeugral.github.io/cinnamott/ (com `noindex` até a cliente aprovar).

## Identidade

- **Gesso, tinta e sangue**, tirados das artes da própria Carol: ela apresenta os desenhos disponíveis em estátuas e manequins cinza, com tribal fantasma em relevo no fundo.
  Gesso `#e7e6e3`, papel `#f3f2ef`, tinta `#0d0d0f`, vermelho `#c8102e`.
- **Hero:** `assets/js/relevo.js`, fios de cybersigil em shader sobre gesso: curvas lisas (só senos, simétricas pela fórmula), espessura medida em pixels, traços que afinam até a ponta e um brilho prata correndo. A v1 era um relevo de gesso com veios (reprovado: "não fluido"). Desktop roda ao vivo (até 2x DPR, baixa sozinho se pesar); toque usa os MP4 de `tools/gerar_video.py`.
- **Logo:** lettering "cinnamott" gerado por IA no Figma (arquivo "Cinnamott - assets") e vetorizado (`tools/vetorizar.py`). Entra como máscara CSS.
- **Mascote:** o avatar do Instagram dela, vetorizado. Está no "Quem tatua" e no favicon (`tools/favicon.py`).
- Fontes Unbounded, IBM Plex Sans e JetBrains Mono. Botão reto em placa com filete interno, a tinta vermelha sobe no hover.

## Conteúdo

- Extração completa do Instagram em `../_ref/ig` (159 posts, 470 fotos, `dados.json` com legendas) e destaques em `../_ref/ig/hl` (dispo, freehand, cruz1, cruz2, outras, chaves = cicatrizadas). Folhas de contato em `../_ref/folhas` e `../_ref/folhas-hl`.
- Imagens do site saem de `tools/processar.py` (listas OBRAS, HERO, FH, CIC, FLASH).
- Contato: o link da bio (bit.ly/cinnamott) aponta para `https://wa.me/message/2ZP356FIXYL6A1`. O "Monte sua mensagem" copia o texto e abre esse link, porque link `wa.me/message` não aceita texto pré-preenchido.

## CONFIRMAR com a cliente

1. **Número do WhatsApp.** Com o número, trocar o link para `wa.me/55…?text=` e a mensagem montada já chega preenchida.
2. **Desenhos disponíveis:** os 12 do site saíram dos posts de 21/09/2026 (DISPONÍVEIS), 18/06 e 26/05. Confirmar quais ainda estão livres.
3. **Preços:** Cyberfaces R$ 450 (post de 26/05/2026), cruzes até 15 cm R$ 550 e escritas até 15 cm R$ 400 (destaque ★ DISPO ★). Confirmar se continuam valendo.
4. **Agenda:** o site diz que a agenda abre por mês com sessões nos fins de semana (legenda de 05/10). Confirmar dias e horários.
5. **Prazo de resposta de 1 a 2 dias úteis** veio de uma legenda de 2023.
6. **"Quatro anos de tattoo"** veio do post "4 anos atrás" de 17/10/2026.
7. **Fotos:** confirmar se pode usar as fotos de clientes do portfólio e das cicatrizadas (todas públicas no perfil dela).
8. **Sobre:** Corinthians, show de rock e pug saíram dos posts pessoais. Ela pode querer outro texto.
9. Domínio próprio, se ela quiser (hoje é GitHub Pages).

## Rodar

```
python -m http.server 8803
```

Ferramentas (Python + Playwright com Edge): `tools/processar.py`, `tools/gerar_video.py`, `tools/vetorizar.py` (rodar da pasta do projeto), `tools/favicon.py`, `tools/og.py`.
