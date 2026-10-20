/* Fundo do hero: fios de cybersigil sobre gesso claro.
   O desenho é a curva de nível de um campo feito só de senos e cossenos, todos pares em x: a simetria
   do espelho sai da própria fórmula, sem dobra no eixo, e a curva é lisa em qualquer ponto (nada de
   ruído com quinas). A espessura é medida em pixels pela distância até a curva (|f|/|∇f|), então o
   traço fica fino e limpo em qualquer resolução, e um segundo campo afina o fio até ele sumir em ponta.
   Uma faixa de brilho prata corre devagar pelos fios.
   relevoGL(canvas, {eixo}) -> {tamanho(w,h), desenhar(fase, eixo)}; fase em [0, 2π) fecha o loop sem emenda.
   O mesmo shader gera os MP4 do celular (tools/gerar_video.py). */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uFase; uniform float uEixo;

/* campo par em x: f(x,y) = f(-x,y). O tempo entra só por sen/cos da fase, então o loop fecha */
float campo(vec2 p){
  float s=sin(uFase), c=cos(uFase);
  float x=p.x, y=p.y;
  y+=.22*cos(1.7*x+.4*s)*cos(.9*y-.6*c) + .10*cos(3.1*x)*sin(1.3*y+c);
  float xx=x*(1.+.06*c);
  return sin(2.1*y+1.25*cos(1.45*xx)+.35*s)
        +.55*cos(2.6*xx)*sin(1.6*y-.5*c+.8)
        +.32*sin(3.4*y-2.2*xx*xx+.4*c)
        -.18*x*x;
}
/* fios em pé: cos(k·x) com k variando em y, então eles se apertam e se abrem em volta do eixo,
   como a espinha de um cybersigil. Também par em x. */
float espinha(vec2 p){
  float s=sin(uFase), c=cos(uFase);
  float y=p.y+.12*sin(2.3*p.x*p.x+c);
  float k=2.6+4.2*pow(.5+.5*sin(1.05*y+.5*s+.6),2.)+.5*cos(2.1*y-.7*c);
  return cos(p.x*k+.35*sin(1.7*y+s)*p.x*p.x);
}
/* afinamento: onde este campo passa por zero o traço vira ponta. Cada fio vira uma sequência de
   traços que engordam no meio e terminam afiados nas duas pontas, como o pincel de um cybersigil. */
float afina(vec2 p,float k,float ph){
  float s=sin(uFase), c=cos(uFase);
  float g=sin(k*p.y+1.3*cos(1.7*p.x)+.5*s+ph)+.35*cos(2.2*p.x*p.x-.4*c+ph);
  g=clamp(g*.85+.15,0.,1.);
  return g*sqrt(g);
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  float esc=min(uRes.x,uRes.y);
  float ex=uEixo*uRes.x;
  vec2 p=vec2(fc.x-ex,fc.y-.5*uRes.y)/esc*2.2;
  float px=2.2/esc;                         /* 1 pixel no espaço do campo */

  /* gesso: luz larga e macia atrás do eixo, cinza para as bordas */
  float r=length(vec2((fc.x-ex)/esc*.9,(fc.y-.58*uRes.y)/esc));
  vec3 col=mix(vec3(.958,.955,.948),vec3(.80,.80,.79),smoothstep(.05,1.25,r));

  /* os fios se concentram em volta do eixo e somem antes do texto */
  float zona=smoothstep(1.7,.4,abs(p.x)*.6+abs(p.y)*.2);
  float tinta=0., brilho=0.;
  /* arcos: curvas de nível do campo; a do meio é a mais grossa */
  float f=campo(p);
  float gr=length(vec2(campo(p+vec2(px,0.))-f,campo(p+vec2(0.,px))-f))/px+1e-4;
  for(int i=0;i<5;i++){
    float lv=float(i)*.42-.84;
    float t=afina(p,4.1,float(i)*1.7);
    float d=abs(f-lv)/gr/px;               /* distância em pixels até a curva */
    float w=esc*(i==2?.0034:.0017)*t;      /* meia largura em pixels; a do meio é a mais grossa */
    tinta=max(tinta,(1.-smoothstep(w-.7,w+.7,d))*smoothstep(.0,.25,w));
    brilho=max(brilho,(1.-smoothstep(w+.5,w+esc*.004,d))*t);
  }
  /* espinha: fios em pé, mais fortes perto do eixo */
  float e=espinha(p);
  float ge=length(vec2(espinha(p+vec2(px,0.))-e,espinha(p+vec2(0.,px))-e))/px+1e-4;
  float te=afina(p,1.45,2.2)*smoothstep(1.45,.3,abs(p.y))*smoothstep(1.,.1,abs(p.x));
  float de=abs(e)/ge/px;
  float we=esc*.0024*te;
  tinta=max(tinta,(1.-smoothstep(we-.7,we+.7,de))*smoothstep(.0,.25,we));
  brilho=max(brilho,(1.-smoothstep(we+.5,we+esc*.004,de))*te);
  tinta*=zona; brilho*=zona;

  /* brilho prata que corre pelos fios, de baixo pra cima */
  float corre=pow(.5+.5*cos(p.y*1.4-uFase*2.-abs(p.x)*.5),6.);
  /* sombra fina embaixo do traço, como tinta sobre papel de algodão */
  col*=1.-brilho*.05;
  col=mix(col,vec3(.055,.055,.065),tinta*.9);
  col=mix(col,vec3(.78,.79,.82),tinta*corre*.5);

  vec2 gq=fc+vec2(5.588,2.37)*floor(fract(uFase*7.)*64.);
  col+=(fract(52.9829189*fract(dot(gq,vec2(.06711056,.00583715))))-.5)*.006;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

  g.relevoGL = function (cv, op = {}) {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(pr, n);
    const uR = u('uRes'), uF = u('uFase'), uE = u('uEixo');
    return {
      tamanho(w, h) { cv.width = w; cv.height = h; },
      desenhar(fase, eixo) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uF, fase); gl.uniform1f(uE, eixo ?? op.eixo ?? .5);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})(window);
