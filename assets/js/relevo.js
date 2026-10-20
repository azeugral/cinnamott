/* Fundo do hero e da chamada final: drapeado de gesso.
   Um campo de altura liso (poucas ondas senoidais, com o espaço levemente torcido por outras ondas) dá dobras
   largas, como um pano de gesso molhado; a luz rasante de cima faz o relevo. Dois veios finos seguem as curvas
   de nível do mesmo campo, então correm junto com as dobras, longos e sem emenda, e afinam nas pontas como um
   traço de cybertribal sem nunca quebrar. Tudo é periódico em uFase: fase em [0, 2π) fecha o loop.
   relevoGL(canvas) -> {tamanho(w,h), desenhar(fase)}. tools/gerar_poster.py gera os pôsteres com este shader. */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uFase;

/* torção lenta do espaço: as dobras escorrem em vez de só deslizar */
vec2 torce(vec2 p,float t){
  p+=.20*vec2(sin(p.y*1.6+t+1.3),sin(p.x*1.3-t+.4));
  p+=.08*vec2(sin(p.y*2.7-t+2.2),sin(p.x*2.3+t*2.+5.1));
  return p;
}
/* dobras: ondas largas em direções diferentes */
float dobra(vec2 q,float t){
  return sin(dot(q,vec2(.83,.56))*3.0+t)*.55
        +sin(dot(q,vec2(-.42,.91))*3.9-t+1.1)*.33
        +sin(dot(q,vec2(.97,-.24))*5.4+t+.7)*.14;
}
/* veio: sulco fino na curva de nível n do campo; a distância até a curva é (h-n)/|∇h|.
   a = quanto o traço engrossa ao longo do caminho (nunca zera, então o veio não se parte) */
float veio(float h,float gl,float n,float w,float a){
  return (h-n)/max(gl,.25)/(w*(.25+.75*a));
}
/* sulco cavado: escuro no fundo e um fio de luz na parede que encara a luz */
vec3 cava(vec3 col,float d,float k){
  return col*(1.-k*.17*exp(-d*d))+k*.045*exp(-(d-1.4)*(d-1.4)*1.6);
}

void main(){
  float esc=min(uRes.x,uRes.y), t=uFase;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/esc;

  float e=1./esc;
  vec2 q=torce(p,t), qx=torce(p+vec2(e,0.),t), qy=torce(p+vec2(0.,e),t);
  float h=dobra(q,t), hx=dobra(qx,t), hy=dobra(qy,t);
  vec2 gr=vec2(hx-h,hy-h)/e;
  float gl=length(gr);

  /* luz de cima e um pouco da esquerda, rasante e macia */
  vec3 n=normalize(vec3(-gr*.1,1.));
  vec3 L=normalize(vec3(-.35,.6,.72));
  float dif=dot(n,L)-L.z;

  /* afinamento ao longo dos veios: segue a fase com o mesmo período, então também fecha o loop */
  float a1=.5+.5*sin(q.x*1.7-q.y*.9+t);
  float a2=.5+.5*sin(q.y*1.9+q.x*.6-t+2.);

  float zona=exp(-dot(p,p)*.45);
  vec3 base=mix(vec3(.84,.838,.832),vec3(.915,.912,.906),zona);
  vec3 col=base*(1.+dif*.9);
  col=cava(col,veio(h,gl,.5,.0095,a1),1.);
  col=cava(col,veio(h,gl,.02,.007,a2),.75);
  col=cava(col,veio(h,gl,-.46,.0085,1.-a1),.9);
  /* grão fino para o degradê não fazer faixas */
  col+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)*.006;
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
    const uR = gl.getUniformLocation(pr, 'uRes'), uF = gl.getUniformLocation(pr, 'uFase');
    return {
      tamanho(w, h) { cv.width = w; cv.height = h; },
      desenhar(fase) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uF, fase);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})(window);
