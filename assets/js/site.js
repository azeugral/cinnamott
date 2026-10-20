(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ZAP = 'https://wa.me/message/2ZP356FIXYL6A1';
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav sólida ao rolar + barra do WhatsApp no celular */
  const nav = $('.nav'), barra = $('.barra-zap'), hero = $('.hero');
  const rolou = () => {
    nav.classList.toggle('solida', scrollY > 20);
    barra.classList.toggle('on', scrollY > hero.offsetHeight * .7);
  };
  addEventListener('scroll', rolou, { passive: true }); rolou();

  /* link ativo */
  const links = $$('.nav-links a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('ativo', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); s && io.observe(s); });

  /* menu */
  const bm = $('.nav-menu'), menu = $('#menu');
  const abreMenu = on => {
    bm.setAttribute('aria-expanded', on); menu.hidden = !on;
    document.body.style.overflow = on ? 'hidden' : '';
  };
  bm.addEventListener('click', () => abreMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => abreMenu(false)));

  /* fundo: relevo de gesso espelhado, ao vivo no desktop (WebGL) e MP4 em loop no toque */
  const fundo = $('.hero-fundo'), cv = $('.fundo-gl', fundo), hv = $('.fundo-vid', fundo);
  const toque = matchMedia('(hover: none), (pointer: coarse), (max-width: 760px)').matches;
  const tocaVideo = (v, src) => {
    if (calmo) return;
    v.src = src;
    v.addEventListener('playing', () => v.classList.add('on'), { once: true });
    new IntersectionObserver(([e]) => e.isIntersecting ? v.play().catch(() => {}) : v.pause()).observe(v.parentElement);
  };
  /* eixo do espelho: no centro da foto do hero */
  const eixo = () => { const f = $('.hero-foto').getBoundingClientRect(); return Math.min(.85, Math.max(.5, (f.left + f.width / 2) / innerWidth)); };
  const vivo = () => {
    let T;
    try { T = relevoGL(cv); } catch (e) { T = null; }
    if (!T) return;
    /* resolução real da tela (até 2x); se o quadro passar de ~22 ms em média, baixa em degraus */
    const CICLO = 40000;
    let esc = Math.min(devicePixelRatio || 1, 2), ex = eixo();
    const ajusta = () => { T.tamanho(Math.round(fundo.clientWidth * esc), Math.round(fundo.clientHeight * esc)); ex = eixo(); };
    ajusta(); addEventListener('resize', ajusta);
    let ve = true, ult = 0, soma = 0, n = 0, t0 = performance.now();
    new IntersectionObserver(([e]) => { ve = e.isIntersecting; ult = 0; }).observe(fundo);
    const quadro = t => {
      requestAnimationFrame(quadro);
      if (!ve || document.hidden) { ult = 0; return; }
      if (ult) { soma += t - ult; n++; }
      ult = t;
      if (n === 40) {
        if (soma / n > 22 && esc > .6) { esc = Math.max(.6, esc * .8); ajusta(); }
        soma = 0; n = 0;
      }
      T.desenhar(((t - t0) % CICLO) / CICLO * 6.283185307179586, ex);
      cv.classList.add('on');
    };
    if (calmo) { T.desenhar(0, ex); cv.classList.add('on'); } else requestAnimationFrame(quadro);
  };
  if (toque) tocaVideo(hv, innerWidth > innerHeight ? 'assets/video/relevo-deitado.mp4?v=2' : 'assets/video/relevo-celular.mp4?v=2');
  else vivo();
  $$('.fim-fundo .fundo-vid').forEach(v => tocaVideo(v, v.dataset.src));

  /* hero: fotos passam sozinhas */
  const fotos = $$('.hero-quadro img'), tit = $('.hero-tit'), cont = $('.hero-cont b'), bar = $('.hero-barra i');
  const nomes = ['Borboleta nas costas', 'Braço inteiro no free hand', 'Perna biomecânica', 'Ombro no free hand', 'Antebraço em preto chapado'];
  let hi = 0;
  const corre = () => { bar.classList.remove('corre'); void bar.offsetWidth; bar.classList.add('corre'); };
  const troca = () => {
    fotos[hi].classList.remove('on');
    hi = (hi + 1) % fotos.length;
    fotos[hi].classList.add('on');
    tit.textContent = nomes[hi]; cont.textContent = hi + 1;
    corre();
  };
  if (!calmo) { corre(); setInterval(() => { if (!document.hidden) troca(); }, 6000); }

  /* free hand: a linha vermelha varre da caneta pra agulha */
  const fq = $('.fh-quadro'), fa = $('.fh-a', fq), fb = $('.fh-b', fq), fl = $('.fh-linha', fq);
  const ftabs = $$('.fh-tabs button');
  const ALT = { 1: 'ombro', 2: 'braço', 3: 'peito', 4: 'bíceps' };
  let fi = 1, fx = 0, fraf = 0, ftimer = 0, fvis = false;
  const pinta = v => { fb.style.clipPath = `inset(0 0 0 ${100 - v}%)`; fl.style.left = `${100 - v}%`; fq.classList.toggle('ver-b', v > 55); };
  const varre = (de, ate, ms, fim) => {
    cancelAnimationFrame(fraf); const t0 = performance.now();
    const passo = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; fx = de + (ate - de) * e; pinta(fx); k < 1 ? fraf = requestAnimationFrame(passo) : fim && fim(); };
    fraf = requestAnimationFrame(passo);
  };
  const carrega = i => {
    fi = i;
    ftabs.forEach(b => b.setAttribute('aria-selected', +b.dataset.i === i));
    fa.src = `assets/img/fh/${i}-a.webp`; fb.src = `assets/img/fh/${i}-b.webp`;
    fa.alt = `Desenho de caneta no ${ALT[i]}`; fb.alt = `Tatuagem pronta no ${ALT[i]}`;
    fx = 0; pinta(0);
  };
  const ciclo = () => {
    clearTimeout(ftimer);
    if (!fvis || calmo) { if (calmo) pinta(100); return; }
    ftimer = setTimeout(() => varre(0, 100, 1700, () => {
      ftimer = setTimeout(() => { carrega(fi % 4 + 1); ciclo(); }, 3200);
    }), 1300);
  };
  ftabs.forEach(b => b.addEventListener('click', () => { cancelAnimationFrame(fraf); carrega(+b.dataset.i); ciclo(); }));
  new IntersectionObserver(([e]) => { const era = fvis; fvis = e.isIntersecting; if (fvis && !era) ciclo(); if (!fvis) { clearTimeout(ftimer); } }, { threshold: .35 }).observe(fq);
  for (let i = 2; i <= 4; i++) { new Image().src = `assets/img/fh/${i}-a.webp`; }

  /* galeria (portfólio e disponíveis) */
  const gal = $('#galeria'), gimg = $('.gal-fig img', gal), gtit = $('.gal-tit', gal), gcont = $('.gal-cont', gal), gig = $('.gal-ig', gal), gres = $('.gal-reserva', gal);
  let lista = null, gi = 0, volta = null;
  const mostra = () => {
    const f = lista.fotos[gi];
    gimg.src = f.src; gimg.alt = f.alt;
    gtit.textContent = lista.titulo;
    gcont.textContent = lista.fotos.length > 1 ? `${gi + 1} de ${lista.fotos.length}` : '';
    $$('.gal-seta', gal).forEach(b => b.hidden = lista.fotos.length < 2);
  };
  const abre = (l, el) => {
    lista = l; gi = l.ini || 0; volta = el; mostra();
    gig.hidden = !l.ig; if (l.ig) gig.href = `https://www.instagram.com/p/${l.ig}/`;
    gres.hidden = !l.reserva; if (l.reserva) gres.href = ZAP;
    gal.hidden = false; document.body.style.overflow = 'hidden'; $('.gal-fechar').focus();
  };
  const fecha = () => { gal.hidden = true; document.body.style.overflow = ''; volta && volta.focus(); };
  const passa = d => { gi = (gi + d + lista.fotos.length) % lista.fotos.length; if (lista.porFoto) lista.titulo = lista.porFoto(gi); mostra(); };
  $('.gal-fechar').addEventListener('click', fecha);
  $('.gal-ant').addEventListener('click', () => passa(-1));
  $('.gal-prox').addEventListener('click', () => passa(1));
  gal.addEventListener('click', e => { if (e.target === gal) fecha(); });
  addEventListener('keydown', e => {
    if (gal.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') passa(-1);
    if (e.key === 'ArrowRight') passa(1);
  });
  let tx = null;
  gal.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  gal.addEventListener('touchend', e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40 && lista.fotos.length > 1) passa(dx < 0 ? 1 : -1);
  });

  /* portfólio */
  const grade = $('#grade'), mais = $('#mais');
  let obras = [], filtro = 'todos', limite = 16;
  const visiveis = () => obras.filter(o => filtro === 'todos' || o.cat === filtro);
  const desenha = () => {
    const l = visiveis();
    grade.innerHTML = l.slice(0, limite).map((o, i) => `
      <li style="animation-delay:${(i % 16) * 30}ms"><button data-id="${o.id}" aria-label="Ver fotos: ${o.titulo}">
        <div class="obra-img"><img src="assets/img/obras/${o.id}.webp" alt="${o.titulo}" loading="lazy" width="720" height="900">${o.fotos.length > 1 ? `<span class="qtd">${o.fotos.length} fotos</span>` : ''}</div>
        <p class="obra-leg"><span>${o.id}</span>${o.titulo}</p>
      </button></li>`).join('');
    mais.parentElement.hidden = l.length <= limite;
  };
  const filtra = f => {
    filtro = f; limite = 16;
    $$('.filtros button').forEach(b => b.setAttribute('aria-selected', b.dataset.f === f));
    desenha();
  };
  $$('.filtros button').forEach(b => b.addEventListener('click', () => filtra(b.dataset.f)));
  $$('.estilo[data-ir]').forEach(a => a.addEventListener('click', () => filtra(a.dataset.ir)));
  mais.addEventListener('click', () => { limite += 16; desenha(); });
  fetch('assets/obras.json').then(r => r.json()).then(d => { obras = d; desenha(); });
  grade.addEventListener('click', e => {
    const b = e.target.closest('button[data-id]'); if (!b) return;
    const o = obras.find(x => x.id === b.dataset.id);
    abre({ titulo: o.titulo, ig: o.ig, fotos: o.fotos.map(f => ({ src: `assets/img/obras/${f}.webp`, alt: o.titulo })) }, b);
  });

  /* disponíveis: a galeria passa por todos os desenhos, com o botão de reserva */
  const fbots = $$('#flash button');
  const flashes = fbots.map(b => ({ src: `assets/img/flash/${b.dataset.f}-g.webp`, alt: $('img', b).alt, n: b.dataset.f }));
  fbots.forEach((b, i) => b.addEventListener('click', () => abre({
    titulo: `Desenho ${flashes[i].n}`, ini: i, reserva: true, fotos: flashes,
    porFoto: k => `Desenho ${flashes[k].n}`
  }, b)));

  /* monte sua mensagem: organiza o texto, copia e abre o WhatsApp */
  const form = $('#msg'), aviso = $('.msg-aviso', form), saida = $('.msg-texto', form);
  const copia = async t => {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); return ok;
    }
  };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const nome = form.nome.closest('.campo');
    if (!d.nome.trim()) { nome.classList.add('erro'); aviso.className = 'msg-aviso erro'; aviso.textContent = 'Coloca seu nome pra Carol saber com quem fala.'; form.nome.focus(); return; }
    nome.classList.remove('erro');
    const dados = [
      `Nome: ${d.nome.trim()}`,
      d.pronomes && `Pronomes: ${d.pronomes.trim()}`,
      d.idade && `Idade: ${d.idade.trim()}`,
      `Tipo: ${d.tipo}`,
      d.local && `Local do corpo: ${d.local.trim()}`,
      d.tamanho && `Tamanho: ${d.tamanho.trim()} cm`,
      d.dias && `Disponibilidade: ${d.dias.trim()}`,
      d.ideia && `Ideia: ${d.ideia.trim()}`
    ].filter(Boolean);
    const texto = ['Oi, Carol! Vim pelo site e quero um orçamento.', '', ...dados].join('\n');
    const ok = await copia(texto);
    saida.textContent = texto; saida.hidden = false;
    aviso.className = 'msg-aviso ' + (ok ? 'ok' : '');
    aviso.textContent = ok ? 'Mensagem copiada. No WhatsApp, é só colar e enviar.' : 'Não deu pra copiar sozinho. Copia o texto abaixo e cola no WhatsApp.';
    window.open(ZAP, '_blank', 'noopener');
  });
  form.nome.addEventListener('input', () => form.nome.closest('.campo').classList.remove('erro'));
})();
