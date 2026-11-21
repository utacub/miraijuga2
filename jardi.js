/* =========================================================
   ESCENARI: EL JARDÍ DE LES PAPALLONES
   Papallona i sis flors 3D (three.js, models fets amb Blender a partir dels concepts de ChatGPT de Marc).
   «Vola amb mi» (seguiment): entra una papallona i espera; només vola mentre la miren i, quan l'han seguida prou estona,
     va a un capoll del seu color, s'hi posa i el capoll s'obre. Si no la miren, fa piruetes que acaben al mateix lloc.
     Mirar una flor oberta amb papallona → la papallona fa una tombarella. Totes obertes → festa i jardí nou.
   «Cada una a la seva flor» (aparellar): papallones esperant a dalt i flors mig obertes a baix. S'activa una papallona
     i després la flor del mateix color: hi vola, s'hi posa i la flor s'obre del tot. Sense so d'error; ajuda als 6 s.
   Càmera fixa (cap zoom ni moviment de càmera). Sense veus.
   ========================================================= */
const JARDI=(()=>{
  const TX={ca:['Vola amb mi','Cada una a la seva flor'],es:['Vuela conmigo','Cada una a su flor'],eu:['Hegan egin nirekin','Bakoitza bere lorera'],
    gl:['Voa comigo','Cada unha á súa flor'],en:['Fly with me','Each to its flower'],fr:['Vole avec moi','Chacun sa fleur']};
  for(const l in TX)if(I18N[l]){I18N[l]['jardi.m1']=TX[l][0];I18N[l]['jardi.m2']=TX[l][1]}
  const COLORS=['vermell','taronja','groc','blau','lila','rosa'];
  const FLOR={vermell:'rosella',taronja:'calendula',groc:'girasol',blau:'blauet',lila:'pensament',rosa:'cosmos'};
  const HEX={vermell:0xe84a3c,taronja:0xff9a2e,groc:0xffd53a,blau:0x47a8ff,lila:0xa772e0,rosa:0xff6fa8};
  /* mesures de cada flor (unitats del model, alçada de la flor oberta = 1): tija, capoll, base dels pètals, radi del cap */
  const INFO={rosella:{bh:.318,zp:.575,sh:.505,Rw:.46},calendula:{bh:.309,zp:.635,sh:.524,Rw:.452},girasol:{bh:.359,zp:.666,sh:.543,Rw:.428},
    blauet:{bh:.286,zp:.802,sh:.536,Rw:.452},pensament:{bh:.353,zp:.773,sh:.653,Rw:.343},cosmos:{bh:.257,zp:.606,sh:.519,Rw:.444}};
  /* mides (gran, mitjana, petita). Mode 1: flors, envergadura (px del món), radi de la zona de seguiment, velocitat, segons de seguiment, alçada de la flor.
     Mode 2: parelles, envergadura, alçada de la flor */
  const SZ1=[{n:3,span:220,R:200,v:60,T:3,fh:270},{n:5,span:160,R:150,v:90,T:4,fh:220},{n:8,span:110,R:110,v:120,T:5,fh:165}];
  const SZ2=[{n:2,span:200,fh:270},{n:4,span:150,fh:220},{n:6,span:118,fh:178}];
  const HARP=[349.23,392,440,523.25,587.33,698.46,783.99,880,1046.5,1174.66];   // fa major pentatònica (la nota mostrejada és La 4)
  const TILT=.3,OPEN1=1.7,FEST=7,HELP=6,MID=.56;
  let R=null,S3,cam,cvs=null,on=false,ready=false,lq=null,MODE=0,NL=0;
  const PROTO={},CLIP={},TEX={},MAT={},fons=img('jardi/fons.webp');
  let hemi,sun,ROOT,blobTex,glowTex,petalTex,dotTex,trail,trailP=0;
  let FL=[],BF=[],active=null,nextAt=0,now=0,party=-1,round=0,bloomed=0,sel=null,idle=0,G={x:-999,y:-999,seen:false},confetti=[],followTotal=0;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3j';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.NoToneMapping;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(0,W,0,-H,-3000,3000);
    hemi=new THREE.HemisphereLight(0xffffff,0xd9e4c6,1);sun=new THREE.DirectionalLight(0xfff4e2,1);sun.position.set(-.5,1,1.3);S3.add(hemi,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    const TL=new THREE.TextureLoader(),tx=p=>{const t=TL.load(U(p));t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;t.anisotropy=2;return t};
    for(const c of COLORS){TEX['ales_'+c]=tx('jardi/ales_'+c+'.webp');TEX['flor_'+FLOR[c]]=tx('jardi/flor_'+FLOR[c]+'.webp')}
    TEX.cos=tx('jardi/cos.webp');
    const ct=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
    glowTex=ct(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,240,180,1)');r.addColorStop(.35,'rgba(255,225,140,.55)');r.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
    dotTex=ct(32,32,g=>{const r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,235,1)');r.addColorStop(.4,'rgba(255,225,130,.8)');r.addColorStop(1,'rgba(255,205,90,0)');g.fillStyle=r;g.fillRect(0,0,32,32)});
    petalTex=ct(32,48,g=>{g.fillStyle='#fff';g.beginPath();g.ellipse(16,24,12,22,0,0,7);g.fill()});
    blobTex=ct(64,32,g=>{const r=g.createRadialGradient(32,16,1,32,16,31);r.addColorStop(0,'rgba(40,60,20,.42)');r.addColorStop(.6,'rgba(40,60,20,.2)');r.addColorStop(1,'rgba(40,60,20,0)');g.setTransform(1,0,0,.5,0,8);g.fillStyle=r;g.fillRect(0,0,64,64)});
    /* rastre d'espurnes: un sol objecte de punts amb transparència per punt */
    {const N=90,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*4),4));
      trail=new THREE.Points(g,new THREE.PointsMaterial({map:dotTex,size:16,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
      trail.frustumCulled=false;trail.userData.p=Array.from({length:N},()=>({l:0,x:0,y:0,vx:0,vy:0}));S3.add(trail)}
    const L=new GLTFLoader(),ks=['papallona'].concat(COLORS.map(c=>'flor_'+FLOR[c]));
    for(const k of ks)L.load(U('jardi/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;
      if(g.animations.length){const c=g.animations[0];c.tracks=c.tracks.filter(t=>!/^(arrel|fulla_)/.test(t.name));CLIP[k]=c}
      if(++NL===ks.length){ready=true;quality();if(on)layout()}},undefined,e=>console.error(e));
    resize()}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(trail)trail.material.size=15*SC*pr}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: alta = Lambert amb la pintura com a emissió (com al Blender); ràpida = la pintura tal qual ───── */
  function mk(t){return LOWQ?new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide,color:0xf6f6f6})
    :new THREE.MeshLambertMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.66,color:0xffffff,side:THREE.DoubleSide})}
  function quality(){if(!R||!ready)return;lq=LOWQ;for(const k in MAT)MAT[k].dispose();
    for(const k in TEX)MAT[k]=mk(TEX[k]);hemi.intensity=Math.PI*.2;sun.intensity=Math.PI*.24;
    for(const f of FL)paint(f.g,f.key);for(const b of BF)paintB(b)}
  function paint(o,k){o.traverse(m=>{if(m.isMesh)m.material=MAT[k]})}
  function paintB(b){b.model.traverse(m=>{if(m.isMesh)m.material=/ala/.test(m.name)?MAT['ales_'+b.c]:MAT.cos})}

  /* ───── flors: còpia del model amb el seu esquelet i l'animació «obrir» (0 = capoll, 1 = oberta) ───── */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  function mkFlower(c,x,base,fh,t0){const nom=FLOR[c],key='flor_'+nom,m=cloneSkinned(PROTO[key]),g=new THREE.Group(),sw=new THREE.Group();
    m.scale.setScalar(fh);sw.add(m);g.add(sw);g.position.set(x,-base,(base-700)*20);paint(m,key);
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));
    sh.scale.set(fh*.62,fh*.16,1);sh.position.set(x,-base-2,-2500);sh.renderOrder=-1;ROOT.add(sh);
    const mx=new THREE.AnimationMixer(m),a=mx.clipAction(CLIP[key]);a.play();a.paused=true;
    const bone=n=>m.getObjectByName(n),f={c,nom,key,x,base,fh,g,sw,m,sh,mx,a,dur:CLIP[key].duration,t:t0,tt:t0,cap:bone('cap'),centre:bone('centre'),
      fD:bone('fulla_D'),fE:bone('fulla_E'),ph:Math.random()*9,grow:0,wig:0,hov:0,dw:0,inside:false,look:0,cool:0,bf:null,target:false,help:0,react:0};
    f.qD=f.fD.quaternion.clone();f.qE=f.fE.quaternion.clone();ROOT.add(g);setT(f,t0);return f}
  function setT(f,t){f.t=t;f.a.time=clamp(t,0,1)*f.dur*.9999;f.mx.update(0)}
  function freeFlower(f){ROOT.remove(f.g,f.sh);f.sh.material.dispose();f.sh.geometry.dispose();f.mx.stopAllAction();
    f.m.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()})}
  /* punt on es posa la papallona: dalt del capoll, o a la vora de dalt del cap obert (que s'inclina cap a nosaltres) */
  function perch(f,out){const I=INFO[f.nom],s=f.fh*f.g.scale.y*f.sw.scale.y;f.g.updateMatrixWorld(true);
    f.cap.getWorldPosition(V1);f.centre.getWorldPosition(V2);V3.subVectors(V2,V1).normalize();       // V3 = eix del cap
    const u=eOut(clamp((f.t-.25)/.75,0,1));
    const bx=V1.x+V3.x*I.bh*.9*s,by=V1.y+V3.y*I.bh*.9*s;                               // dalt del capoll
    const ox=V2.x+V3.x*.05*s,oy=V2.y+(V3.y*.05+V3.z*I.Rw*.5)*s;                        // vora de dalt del cap obert
    out.x=bx+(ox-bx)*u;out.y=-(by+(oy-by)*u);return out}

  /* ───── papallones ───── */
  function mkButterfly(c,span){const root=new THREE.Group(),rot=new THREE.Group(),tilt=new THREE.Group(),model=PROTO.papallona.clone(true);tilt.rotation.x=TILT;tilt.add(model);rot.add(tilt);root.add(rot);
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),new THREE.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
    glow.position.z=-.3;root.add(glow);ROOT.add(root);root.scale.setScalar(span);
    const b={c,span,root,rot,tilt,model,glow,wD:model.getObjectByName('papallona_ala_D'),wE:model.getObjectByName('papallona_ala_E'),
      x:-999,y:-999,hd:0,sp:0,state:'enter',prog:0,lost:9,tx:0,ty:0,flap:Math.random()*6,flapRate:6.5,amp:1,flower:null,spin:0,note:-1,sc:1,
      idle:0,trick:null,lastTrick:'',fw:0,ft:Math.random()*9,yaw:0,trY:0,trZ:0,hov:0,dw:0,inside:false,glowT:0,selT:0,help:0,PF:{x:0,y:0}};
    paintB(b);return b}
  function freeButterfly(b){ROOT.remove(b.root);b.glow.material.dispose();b.glow.geometry.dispose()}
  function spark(x,y,sz,n=1){const P=trail.userData.p;for(let i=0;i<n;i++){const p=P[trailP++%P.length];p.l=1;p.x=x+rnd(-.15,.15)*sz;p.y=y+rnd(-.1,.1)*sz;p.vx=rnd(-12,12);p.vy=rnd(12,34)}}
  function trick(b){const ks=['loop','vuit','gir','onada','tombarella'];let k;do{k=pick(ks)}while(k===b.lastTrick);b.lastTrick=k;
    b.trick={k,t:0,dur:{loop:2.2,vuit:3,gir:1.6,onada:2.4,tombarella:1.4}[k],dir:b.ax<W/2?1:-1};b.idle=0;play('j_fiu',.55)}
  function trickStep(b,a){const tr=b.trick;tr.t+=a;const u=Math.min(1,tr.t/tr.dur),e=.5-.5*Math.cos(Math.PI*u),P=TAU;let ox=0,oy=0;
    if(tr.k==='loop'){ox=Math.sin(P*e)*70*tr.dir;oy=-(1-Math.cos(P*e))*70}
    else if(tr.k==='vuit'){ox=Math.sin(P*e)*110*tr.dir;oy=Math.sin(2*P*e)*40}
    else if(tr.k==='gir'){oy=-Math.sin(Math.PI*e)*50;b.trY=2*P*e}
    else if(tr.k==='onada'){ox=Math.sin(P*e)*90*tr.dir;oy=-Math.sin(Math.PI*e)*60}
    else if(tr.k==='tombarella'){oy=-Math.sin(Math.PI*e)*60;b.trZ=P*e*tr.dir}
    const k=b.span/220;b.x=b.ax+ox*k;b.y=b.ay+oy*k;if(u>=1){b.trick=null;b.x=b.ax;b.y=b.ay;b.trY=b.trZ=0}}
  function harp(i,g=.32,when=0){play('j_arpa',g,HARP[clamp(i,0,HARP.length-1)]/440,when)}
  function chord(){const b=Math.floor(Math.random()*3);[0,2,3,5].forEach((k,i)=>harp(b+k,.3,i*.075))}

  /* ───── rondes ───── */
  function sz(){return MODE?SZ2[CFG.size]:SZ1[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function colors(n){let c=shuffle(COLORS.slice());while(c.length<n)c=c.concat(shuffle(COLORS.slice()).filter(x=>x!==c[c.length-1]));return c.slice(0,n)}
  function clearRound(){for(const f of FL)freeFlower(f);for(const b of BF)freeButterfly(b);for(const p of confetti){S3.remove(p.m);p.m.material.dispose()}
    FL=[];BF=[];confetti=[];active=null;sel=null;party=-1;bloomed=0;idle=0}
  function newRound(){if(!ready)return;clearRound();round++;const s=sz(),n=s.n,cols=colors(n);
    if(!MODE){const margin=n>=8?95:n>=5?150:260,st=(W-2*margin)/Math.max(1,n-1);
      for(let i=0;i<n;i++){const x=margin+st*i+rnd(-12,12),base=rnd(692,710)-(i%2)*(n>=8?16:0);FL.push(mkFlower(cols[i],x,base,s.fh*rnd(.96,1.04),0))}
      nextAt=now+1.4}
    else{const margin=n>=6?150:n>=4?200:380,st=(W-2*margin)/Math.max(1,n-1),fc=shuffle(cols.slice());
      for(let i=0;i<n;i++){const x=n===1?W/2:margin+st*i+rnd(-10,10),base=rnd(694,708);FL.push(mkFlower(fc[i],x,base,s.fh*rnd(.97,1.03),MID))}
      const bm=n>=6?170:n>=4?220:400,bs=(W-2*bm)/Math.max(1,n-1);
      cols.forEach((c,i)=>{const b=mkButterfly(c,s.span),left=i<n/2;b.hx=bm+bs*i+rnd(-14,14);b.hy=(n>=4?(i%2?300:195):245)+rnd(-12,12);
        b.x=left?-s.span*.7:W+s.span*.7;b.y=b.hy+rnd(-60,60);b.state='enter';b.dly=.25+i*.18;BF.push(b)});
      play('j_ales',.5)}
    FL.forEach((f,i)=>{f.grow=-.1*i;f.g.scale.setScalar(.001)})}
  function spawnNext(){const free=FL.filter(f=>f.t<.01&&!f.target);if(!free.length)return;const f=pick(free),s=sz();f.target=true;
    const b=mkButterfly(f.c,s.span);b.flower=f;const left=Math.random()<.5;b.x=left?-s.span*.6:W+s.span*.6;b.y=rnd(180,330);b.hd=left?0:Math.PI;
    const ex=s.span*.55+rnd(30,70);b.ax=left?ex:W-ex;b.ay=rnd(170,330);pickTarget(b);b.state='enter';BF.push(b);active=b;play('j_ales',.55)}
  function pickTarget(b){b.tx=rnd(200,1080);b.ty=rnd(110,400)}
  function land(b){const f=b.flower;b.state='sit';f.bf=b;f.opening=true;bloomed++;STATS.n++;$('#oN').textContent=STATS.n;
    play('j_pop',.7);play('j_obrir',.75,1,.12);chord();spark(b.x,b.y,b.span*1.4,22);
    if(FL.every(q=>q.bf)){party=-2.4}}                                   // festa al cap de 2,4 s (que es vegi obrir l'última flor)
  function startParty(){party=0;play('j_festa',.85);BF.forEach((b,i)=>{b.state='party';b.pi=i});
    for(let i=0;i<40;i++){const c=COLORS[i%6],m=new THREE.Mesh(new THREE.PlaneGeometry(14,21),new THREE.MeshBasicMaterial({map:petalTex,color:HEX[c],transparent:true,depthTest:false,opacity:0}));
      m.renderOrder=20;m.position.z=900;S3.add(m);confetti.push({m,x:rnd(0,W),y:rnd(-H*.9,-10),vy:rnd(45,80),ph:rnd(0,6),r:rnd(0,6),vr:rnd(-1.5,1.5)})}}

  /* ───── activació (mode 2) ───── */
  function hitB(b,wx,wy){return Math.hypot(wx-b.x,wy-b.y)<b.span*.5*b.sc}
  function hitF(f,wx,wy){const s=f.fh;return Math.abs(wx-f.x)<s*.42&&wy>f.base-s*1.02&&wy<f.base-s*.08}
  function targets(){const t=[];if(MODE&&party===-1){for(const b of BF)if(b.state==='wait'||b.state==='sel')t.push(b);for(const f of FL)if(!f.bf&&!f.target)t.push(f)}return t}
  function hit(wx,wy){const t=targets();for(const o of t)if(o.span&&hitB(o,wx,wy))return o;for(const o of t)if(!o.span&&hitF(o,wx,wy))return o;return null}
  function activate(o){if(!o)return;idle=0;STATS.n++;$('#oN').textContent=STATS.n;
    if(o.span){if(sel&&sel!==o){sel.state='wait'}sel=o;o.state='sel';o.selT=0;play('j_brilla',.6);play('j_ales',.45);spark(o.x,o.y,o.span,10);return}
    if(sel&&sel.c===o.c){const b=sel;sel=null;b.state='go';b.flower=o;o.target=true;b.t0=now;b.sx=b.x;b.sy=b.y;b.helpT=0;play('j_ales',.55);harp(3,.25);harp(5,.22,.12);return}
    o.wig=1;play('j_fulles',.5)}                                         // flor d'un altre color (o cap papallona triada): només es gronxa
  function help(){if(sel){const f=FL.find(f=>!f.bf&&!f.target&&f.c===sel.c);if(f){f.help=1.6;f.wig=1;play('j_brilla',.4)}}
    else{const w=BF.filter(b=>b.state==='wait'&&!b.trick);if(w.length){const b=pick(w);b.ax=b.hx;b.ay=b.hy;trick(b);b.glowT=1.5}}}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!FL.length&&!BF.length){if(ready&&on&&!FL.length)newRound();return}if(lq!==LOWQ)quality();
    const sp=CFG.speed,k=sp>0?Math.max(.4,sp):1,a=dt*k,free=!optsOpen&&view==='scene',s=sz();now+=a;
    /* mirada suavitzada (~150 ms) */
    const [wx,wy]=toWorld(cmx,cmy),has=free&&cmx>-999;
    if(has){if(!G.seen){G.x=wx;G.y=wy;G.seen=true}const q=1-Math.exp(-dt/.15);G.x+=(wx-G.x)*q;G.y+=(wy-G.y)*q}else G.seen=false;
    ringP=0;
    /* mode 2: mirada, permanència o pas del cursor sobre papallones i flors */
    if(MODE){const hv=has?hit(wx,wy):null,T=targets();
      for(const o of BF.concat(FL)){const onV=hv===o,rd=T.includes(o);
        if(CFG.mode===0){if(onV&&!o.inside&&rd)activate(o)}
        else if(CFG.mode===1){if(onV&&rd){o.dw+=dt;ringP=clamp(o.dw/CFG.dwell,0,1);if(o.dw>=CFG.dwell){o.dw=0;activate(o)}}else o.dw=0}
        o.inside=onV;o.hov+=((onV&&rd?1:0)-o.hov)*Math.min(1,dt*8)}
      if(party===-1){idle+=a;if(idle>HELP){idle=HELP-4;help()}}}
    /* flors */
    for(const f of FL){f.ph+=a;
      if(f.grow<1){f.grow+=dt/.55;const e=f.grow<=0?.001:eBack(clamp(f.grow,0,1));f.g.scale.set(Math.max(.001,e),Math.max(.001,e),Math.max(.001,e));f.sh.material.opacity=clamp(f.grow,0,1)}
      if(f.opening){const t=Math.min(1,f.t+a/OPEN1);setT(f,t);if(t>=1)f.opening=false}
      if(f.wig>0)f.wig=Math.max(0,f.wig-a/1.1);if(f.help>0)f.help=Math.max(0,f.help-a);
      const wob=Math.sin(f.ph*1.3)*.022+Math.sin(f.ph*2.1)*.009,wg=f.wig>0?.09*Math.sin((1-f.wig)*TAU*3)*f.wig:0;
      f.sw.rotation.z=wob*(f.t<.05?1.3:.8)+wg;
      const hs=1+.05*f.hov+(f.help>0?.05*Math.sin(now*9)*Math.min(1,f.help):0);f.sw.scale.setScalar(hs);
      f.fD.quaternion.copy(f.qD);f.fD.rotateZ(.06*Math.sin(f.ph*1.7+1));f.fE.quaternion.copy(f.qE);f.fE.rotateZ(-.06*Math.sin(f.ph*1.5+2));
      /* mode 1: mirar una flor oberta amb papallona → tombarella */
      if(!MODE&&f.bf&&f.bf.state==='sit'&&f.t>.95&&G.seen&&party===-1){const inside=Math.abs(G.x-f.x)<f.fh*.45&&G.y>f.base-f.fh*1.05&&G.y<f.base-f.fh*.3;
        f.cool-=a;if(inside){f.look+=dt;if(f.look>.6&&f.cool<=0){f.bf.spin=1;f.cool=2.4;f.look=0;play('j_fiu',.45);[5,7,9].forEach((n,i)=>harp(n,.18,i*.06))}}else f.look=Math.max(0,f.look-dt)}}
    /* mode 1: nova papallona */
    if(!MODE&&!active&&party===-1&&now>nextAt&&FL.some(f=>f.t<.01&&!f.target))spawnNext();
    for(const b of BF)(MODE?stepB2:stepB1)(b,a,dt,s);
    /* festa */
    if(party<-1){party+=a;if(party>=-1)startParty()}
    else if(party>=0){party+=a;for(const p of confetti){p.y+=p.vy*a;p.x+=Math.sin(now*1.5+p.ph)*20*a;p.r+=p.vr*a;p.m.position.set(p.x,-p.y,900);p.m.rotation.z=p.r;
        p.m.material.opacity=Math.min(1,p.m.material.opacity+dt*1.5)*(party>FEST-1?Math.max(0,FEST-party):1)}
      if(party>=FEST)newRound()}
    /* espurnes */
    {const P=trail.userData.p,pos=trail.geometry.attributes.position.array,col=trail.geometry.attributes.color.array;
      P.forEach((p,i)=>{if(p.l>0){p.l-=a*1.1;p.x+=p.vx*a;p.y+=p.vy*a}const l=Math.max(0,p.l);pos[i*3]=p.x;pos[i*3+1]=-p.y;pos[i*3+2]=450;col[i*4]=1;col[i*4+1]=1;col[i*4+2]=1;col[i*4+3]=l*.95});
      trail.geometry.attributes.position.needsUpdate=true;trail.geometry.attributes.color.needsUpdate=true}}

  /* mode 1: la papallona entra, espera, només vola mentre la miren i acaba posant-se al seu capoll */
  function stepB1(b,a,dt,s){const sp0=s.v,on=G.seen&&Math.hypot(G.x-b.x,G.y-b.y)<s.R;b.trY=b.trick?b.trY:0;b.trZ=b.trick?b.trZ:0;
    if(b.state==='enter'){const dx=b.ax-b.x,dy=b.ay-b.y,dd=Math.hypot(dx,dy),v=Math.max(25,Math.min(480,dd*3.2)),q=Math.min(1,v*a/Math.max(dd,1e-3));
      b.x+=dx*q;b.y+=dy*q;b.hd=Math.atan2(dy,dx);b.flapRate=6.5;b.amp=1;b.sp=0;if(dd<2){b.state='wait';b.idle=0}}
    else if(b.state==='wait'||b.state==='fly'||b.state==='land'){const landing=b.prog>=s.T;
      if(on){b.lost=0;b.idle=0;if(b.trick){b.trick=null;b.trY=b.trZ=0}if(!landing){b.prog=Math.min(s.T,b.prog+dt);followTotal+=dt}if(Math.random()<dt*22)spark(b.x,b.y,b.span)}
      else b.lost+=dt;
      if(!landing){const ni=Math.floor(b.prog/s.T*8);if(ni>b.note){b.note=ni;harp(ni,.26)}}
      if(landing&&!b.landSnd){b.landSnd=1;harp(9,.24)}
      if(landing){perch(b.flower,b.PF);b.tx=b.PF.x;b.ty=b.PF.y}
      const want=on?(landing?sp0*1.4:sp0):0;b.sp+=(want-b.sp)*Math.min(1,dt*(on?2.2:9));if(b.sp<1&&!on)b.sp=0;
      if(b.sp>0){
        if(!landing){if(Math.hypot(b.tx-b.x,b.ty-b.y)<45)pickTarget(b);
          let da=Math.atan2(b.ty-b.y,b.tx-b.x)-b.hd;da=Math.atan2(Math.sin(da),Math.cos(da));b.hd+=clamp(da,-1.1*a,1.1*a);
          b.x=clamp(b.x+Math.cos(b.hd)*b.sp*a,130,W-130);b.y=clamp(b.y+Math.sin(b.hd)*b.sp*a,90,440)}
        else{const dx=b.tx-b.x,dy=b.ty-b.y,dd=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-b.hd;da=Math.atan2(Math.sin(da),Math.cos(da));b.hd+=clamp(da,-2.5*a,2.5*a);
          const v=Math.min(b.sp,Math.max(40,dd*2.5)),q=Math.min(1,v*a/Math.max(dd,1e-3));b.x+=dx*q;b.y+=dy*q;b.sc+=(.62-b.sc)*Math.min(1,a*2*Math.min(1,b.sp/sp0));
          if(dd<4){b.x=b.tx;b.y=b.ty;land(b);active=null;nextAt=now+1.6}}}
      if(b.state!=='sit'){b.state=b.sp>0?(landing?'land':'fly'):'wait';
        if(b.state==='wait'){if(!b.trick){b.ax=b.x;b.ay=b.y;b.idle+=a;if(b.idle>3.5)trick(b)}else trickStep(b,a)}}
      const call=b.lost>2&&!b.trick?(.18+.18*Math.sin(now*3.2)):0,pr=b.prog/s.T;b.glow.material.opacity=Math.max(on?.35+pr*.4:0,call);if(!landing)b.sc=1}
    else if(b.state==='sit'){perch(b.flower,b.PF);b.x=b.PF.x;b.y=b.PF.y;b.glow.material.opacity*=Math.pow(.2,a)}
    else if(b.state==='party')partyB(b,a);
    pose(b,a,dt)}
  /* mode 2: entra fins al seu lloc, espera; triada brilla; vola a la flor del seu color */
  function stepB2(b,a,dt,s){b.trY=b.trick?b.trY:0;b.trZ=b.trick?b.trZ:0;
    if(b.state==='enter'){if(b.dly>0){b.dly-=a}else{const dx=b.hx-b.x,dy=b.hy-b.y,dd=Math.hypot(dx,dy),v=Math.max(25,Math.min(520,dd*3)),q=Math.min(1,v*a/Math.max(dd,1e-3));
      b.x+=dx*q;b.y+=dy*q;b.hd=Math.atan2(dy,dx);b.sp=dd>2?1:0;if(dd<2){b.state='wait';b.ax=b.hx;b.ay=b.hy}}}
    else if(b.state==='wait'||b.state==='sel'){b.sp=0;if(b.trick)trickStep(b,a);else{b.x+=(b.hx-b.x)*Math.min(1,a*3);b.y+=(b.hy-b.y)*Math.min(1,a*3)}
      const sl=b.state==='sel';if(sl)b.selT+=a;b.sc+=((sl?1.12:1)+.06*b.hov-b.sc)*Math.min(1,dt*6);
      b.glowT=Math.max(0,b.glowT-a);b.glow.material.opacity=sl?.5+.15*Math.sin(now*5):b.glowT>0?.3*Math.min(1,b.glowT):.12*b.hov}
    else if(b.state==='go'){perch(b.flower,b.PF);const u=clamp((now-b.t0)/1.3,0,1),e=.5-.5*Math.cos(Math.PI*u),arc=Math.sin(Math.PI*u)*-90;
      const nx=b.sx+(b.PF.x-b.sx)*e,ny=b.sy+(b.PF.y-b.sy)*e+arc;b.hd=Math.atan2(ny-b.y,nx-b.x);b.x=nx;b.y=ny;b.sp=1;b.sc+=(.66-b.sc)*Math.min(1,a*2.5);
      if(Math.random()<dt*20)spark(b.x,b.y,b.span);b.glow.material.opacity=.4;if(u>=1){land(b)}}
    else if(b.state==='sit'){perch(b.flower,b.PF);b.x=b.PF.x;b.y=b.PF.y;b.sc+=(.66-b.sc)*Math.min(1,a*2);b.glow.material.opacity*=Math.pow(.2,a)}
    else if(b.state==='party')partyB(b,a);
    pose(b,a,dt)}
  function partyB(b,a){const n=BF.length,an=now*.55+b.pi/n*TAU,tx=W/2+Math.cos(an)*300,ty=260+Math.sin(an)*130;
    b.x+=(tx-b.x)*Math.min(1,a*1.5);b.y+=(ty-b.y)*Math.min(1,a*1.5);b.hd=an+Math.PI/2;b.sp=1;b.sc+=(1-b.sc)*Math.min(1,a);b.glow.material.opacity=.3+.15*Math.sin(now*3+b.pi)}
  /* aleteig i postura: batec lent en repòs (2,2 Hz) i ràpid en vol (6,5 Hz); en espera flota i gira suaument sobre si mateixa */
  function pose(b,a,dt){const moving=b.sp>0||b.trick||b.state==='enter'||b.state==='party'||b.state==='go';
    if(b.state==='sit'){b.flapRate=1.4;b.amp=.45}else if(b.state==='sel'){b.flapRate=4.2;b.amp=.85}else if(moving){b.flapRate=6.5;b.amp=1}else{b.flapRate=2.2;b.amp=.65}
    b.flap+=a*b.flapRate*TAU;const fl=(.12+.95*(.5+.5*Math.sin(b.flap)))*b.amp+(1-b.amp)*.25;b.wD.rotation.y=fl;b.wE.rotation.y=-fl;
    if(b.spin>0)b.spin=Math.max(0,b.spin-a*1.2);
    const fly=b.sp>0&&b.state!=='sit',bank=fly?clamp(Math.cos(b.hd)*.35,-.35,.35):0;b.yaw+=((fly?Math.cos(b.hd)*.45:0)-b.yaw)*Math.min(1,dt*3);
    const idleW=(b.state==='wait'||b.state==='sel')&&!b.trick?1:0;b.fw+=(idleW-b.fw)*Math.min(1,dt*2.5);b.ft+=a;
    const fx=Math.sin(b.ft*.7)*9*b.fw,fy=(Math.sin(b.ft*1.1)*8+Math.sin(b.ft*.43)*4)*b.fw;
    b.rot.rotation.set(0,(b.spin>0?(1-b.spin)*TAU:0)+b.trY+b.yaw+Math.sin(b.ft*.5)*.55*b.fw,-bank+b.trZ+Math.sin(b.ft*.8+1)*.12*b.fw);
    b.root.position.set(b.x+fx,-(b.y+fy),500);b.root.scale.setScalar(b.span*b.sc)}

  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    if(!R||!ready)return;for(const f of FL)f.sh.visible=!CFG.simple;R.render(S3,cam)}
  function click(cx,cy){const [wx,wy]=toWorld(cx,cy);
    if(MODE){if(CFG.mode!==2)return;const o=hit(wx,wy);if(o)activate(o);return}
    const b=active,s=sz();if(b&&b.state!=='sit'&&b.state!=='enter'&&Math.hypot(wx-b.x,wy-b.y)<s.R){b.prog=Math.min(b.prog+1,s.T);b.lost=0;b.idle=0;spark(b.x,b.y,b.span,8)}}
  function layout(){if(!ready)return;newRound()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newRound()}
  function tray(){const t=$('#tray');t.innerHTML='';['jardi.m1','jardi.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;if(cvs)cvs.style.display='none';if(R)clearRound()}
  /* posició en píxels de pantalla (per a les proves) */
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,activate,hit,
    get ready(){return ready},get mode(){return MODE},get party(){return party},get bloomed(){return bloomed},get round(){return round},get followTotal(){return followTotal},
    get FL(){return FL},get BF(){return BF},get active(){return active},get sel(){return sel},scr,get R(){return R}};
})();
