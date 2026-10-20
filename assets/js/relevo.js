/* Fundo do hero: relevo de gesso espelhado, como o fundo cinza das artes da Carol.
   Tudo sai do shader, sem imagem e sem forma desenhada: um campo de altura feito de cristas finas
   (ruído dobrado) arrastadas por um fluxo lento, espelhado num eixo vertical para ganhar a simetria
   de um cybertribal. A luz rasante sobre esse campo dá o aspecto de gesso em baixo-relevo.
   relevoGL(canvas, {eixo}) -> {tamanho(w,h), desenhar(fase, eixo)}; fase em [0, 2π) fecha o loop sem emenda.
   O mesmo shader gera os MP4 do celular (tools/gerar_video.py). */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uFase; uniform float uEixo;
#define TAU 6.28318530718

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*ruido(p);p=rot(.6)*p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
/* versão lisa, de 3 oitavas, para os fios: curva longa sem serrilhado */
float liso(vec2 p){float s=0.,a=.55;for(int i=0;i<3;i++){s+=a*ruido(p);p=rot(.6)*p*1.9+vec2(1.7,9.2);a*=.42;}return s/.9;}
vec2 W; /* fluxo, calculado uma vez por pixel */
/* fio em relevo onde o campo passa por .5. A distância até a curva é (f-.5)/|∇f|, então a espessura é
   controlada de verdade; um segundo campo engrossa e afina o fio ao longo do caminho até ele sumir em
   ponta, como o traço de um cybertribal. w = meia largura máxima. */
float fio(vec2 p,float w,vec2 o){
  const float s=.004;
  float f=liso(p),fx=liso(p+vec2(s,0.)),fy=liso(p+vec2(0.,s));
  float g=length(vec2(fx-f,fy-f))/s;
  float t=smoothstep(.34,.78,liso(p*.62+o));
  float l=w*t+1e-4;
  float d=(f-.5)/max(g,.15)/l;
  return exp(-d*d)*sqrt(t);
}
float altura(vec2 q){
  return fio(q*1.9+W*1.5,.05,vec2(4.1,1.9))*.95
        +fio(q*3.1+W*2.1+vec2(7.3,2.1),.03,vec2(9.7,3.3))*.6
        +fio(q*1.3+W*.9+vec2(3.7,8.4),.06,vec2(2.2,6.6))*.85
        +fio(q*4.4+W*2.6+vec2(1.3,5.5),.02,vec2(6.1,.4))*.35;
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  float esc=min(uRes.x,uRes.y);
  vec2 c=vec2(cos(uFase),sin(uFase));
  float ex=uEixo*uRes.x;
  /* espelho no eixo; a vizinhança do eixo é suavizada para o vinco não virar uma costura */
  float dx=fc.x-ex;
  float ax=sqrt(dx*dx+esc*esc*.00004);
  vec2 p=vec2(ax,fc.y-.52*uRes.y)/esc;

  vec2 q=p*1.6+vec2(0.,.08)*sin(uFase);
  W=vec2(fbm(q*.8+c*.22),fbm(q*.8+vec2(5.2,1.3)-c.yx*.22))-.5;
  W+=vec2(0.,-.18)*p.y;

  float e=1.5/esc;
  float h=altura(q), hx=altura(q+vec2(e,0.)), hy=altura(q+vec2(0.,e));
  vec3 n=normalize(vec3(h-hx,h-hy,e*9.));
  /* luz de cima, no eixo do espelho: os dois lados ficam iguais e o vinco do meio não aparece */
  vec3 L=normalize(vec3(0.,.78,.62));
  float dif=dot(n,L)-L.z;              /* 0 no gesso plano, + na face que pega luz, - na sombra */
  vec3 H=normalize(L+vec3(0.,0.,1.));
  float spec=pow(max(dot(n,H),0.),60.)*.18*smoothstep(.1,.5,h);

  /* gesso: claro no miolo, mais cinza para as bordas */
  float zona=exp(-p.x*p.x*.5)*smoothstep(1.4,.1,abs(p.y));
  vec3 base=mix(vec3(.78,.78,.775),vec3(.905,.902,.896),.3+.7*zona);
  vec3 col=base*(1.+dif*.55)+spec;
  /* oclusão leve na base de cada fio */
  col*=1.-.05*smoothstep(.02,.25,h)*(1.-smoothstep(.3,.8,h));

  vec2 gq=fc+vec2(5.588,2.37)*floor(fract(uFase*7.)*64.);
  col+=(fract(52.9829189*fract(dot(gq,vec2(.06711056,.00583715))))-.5)*.008;
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
