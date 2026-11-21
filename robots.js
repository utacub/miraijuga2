/* =========================================================
   ESCENARI: EL TALLER DE ROBOTS
   En Biel, el castor enginyer, munta robots fets d'objectes reciclats: potes, cos, braços i cap (4 de cada, 256 robots).
   Fons pintat sobre taulons de caixes de fruita; tot el que es mou és 3D (models de Blender fets per ChatGPT, 18-11-2026).
   «Munta el teu robot!»: en Biel pregunta per cada peça, les opcions surten al prestatge; mirar-ne una fa que la grua
     la porti i la cargoli (cop de cua final). Amb el robot complet brilla la palanca; mirar-la l'encén i fa l'espectacle:
     l'acció de cada peça, 2 s cadascuna (potes, cos, braços, cap). Després el robot surt; cada 3 robots, foto de grup.
   «Igual que el plànol»: a l'esquerra hi ha un plànol de cianotípia amb el robot que cal copiar; la peça equivocada
     la grua la gronxa («no») i la deixa al prestatge, sense so d'error. Quan és igual, s'encén sol.
   Mides: gran 2 peces (potes i cap) × 2 opcions; mitjana 3 × 3; petita 4 × 4. Ajuda: 6 s brilla la bona; 12 s en Biel
     l'assenyala i diu «Mira aquí!». Sense flaixos ni moviments de càmera. Tecla P: canvia de mode.
   ========================================================= */
const ROBOTS=(()=>{
  const TX=__RBTX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['robots.'+k]=TX[l][k];
  const IX=__RBIX__;
  const PARTS={l:['rodes','molles','erugues','helix'],b:['bido','rellotge','caixa','gerra'],a:['pinca','molles','pinzells','ventalls'],h:['tetera','peixera','radio','bombeta']};
  const ORD=['l','b','a','h'],SOCK={l:[0,.8,0],b:[0,.7,0],a:[0,1.52,0],h:[0,1.62,0]};
  const SZ=[{pick:['l','h'],n:2,cw:250,ch:150},{pick:['l','b','h'],n:3,cw:215,ch:146},{pick:['l','b','a','h'],n:4,cw:178,ch:140}];
  const SFXA={l:{rodes:'rodes',molles:'molla',erugues:'erugues',helix:'helix'},b:{bido:'bido',rellotge:'cucut',caixa:'caixa',gerra:'engranatges'},
    a:{pinca:'pinca',molles:'aplaudiment',pinzells:'pinzell',ventalls:'ventall'},h:{tetera:'vapor',peixera:'bombolles',radio:'radio',bombeta:'bombeta'}};
  const P=165,PIT=5*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6,SEG=2,CARRY=2.2,CY=205;
  const RX=640,FY=560,OPY=641,LEV={x:968,y:560,h:160},BIEL={x:1060,y:560,h:250},PLAN={x:204,y:470,h:390},CIS={x:850,y:560,h:105};
  /* en Biel camina: a la feina (al costat del robot), al lloc d'espera (entre el robot i la palanca) i a la palanca; z = profunditat (la grua i la peça van a z .8, per davant d'en Biel) */
  const WORKX=RX+45,MIDX=868,BZ={work:1.05,mid:.2,lev:.2},GZ=.8,CZ=.55;   /* a la feina, d'esquena entre el jugador i el robot; la peça portada va a CZ, per darrere d'ell */
  const LEAF=['#7aa35a','#c9963a','#b75a3a','#d9b25a'],CONF=['#f6e7c8','#f3c84a','#e88b6b','#9cc38a','#8fb4d6'];
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,loading=0;
  const PROTO={},CL={},MAT={},TXS={},IM={},INST=[],BB={};
  let RP=[];let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],helpSaid=false,B=null,LV=null,PL=null;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const lerp=(a,b,t)=>a+(b-a)*t,c01=t=>clamp(t,0,1),ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3();
  const PK=(t,n)=>t+'_'+n;
  const angTo=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*Math.min(1,k)};

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3r';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3rf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.5);sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-3,6,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    IM.fons=img('robots/fons.webp');
    load();resize()}
  /* càrrega: 24 models (4,5 MB); BB = capsa de cada model en repòs (per encabir-los a les targetes i a la grua) */
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX);let n=keys.length*2;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const k of keys)tx(k,()=>done()); /* textures precarregades: sense això les opcions podien sortir negres un moment */
    for(const k of keys)L.load(U('robots/m/'+k+'.glb'),g=>{PROTO[k]=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name]=c;
        g.scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g.scene),s=new THREE.Vector3(),c=new THREE.Vector3();b.getSize(s);b.getCenter(c);BB[k]={min:b.min.clone(),max:b.max.clone(),s,c};
        g.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.userData.tex=k;o.userData.glass=/vidre/i.test(o.material&&o.material.name||'')}});done()},undefined,e=>{console.error(e);done()})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: alta = Standard (rugositat 0,55; vidre 0,15 i alfa 0,35); ràpid = Phong; plànol = dibuix pàl·lid ───── */
  function tx(n,cb){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('robots/t/'+n+'.webp'),cb,undefined,cb);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mat(n,glass,ghost){const key=n+(glass?'#v':'')+(ghost?'#g':'');if(MAT[key])return MAT[key];const c=tx(n);let m;
    if(ghost)m=new THREE.MeshBasicMaterial({map:c,color:0xdcecff,transparent:true,opacity:glass?.3:.82,depthWrite:!glass});
    else if(LOWQ)m=new THREE.MeshPhongMaterial({map:c,shininess:glass?120:30,specular:glass?0x888888:0x222222});
    else m=new THREE.MeshStandardMaterial({map:c,roughness:glass?.15:.55,metalness:0,envMap:ENV,envMapIntensity:.9});
    if(glass&&!ghost){m.transparent=true;m.opacity=.35;m.depthWrite=false}
    return MAT[key]=m}
  function paint(o,ghost){o.traverse(m=>{if(m.isMesh){m.userData.ghost=!!ghost;m.material=mat(m.userData.tex,m.userData.glass,ghost);if(m.userData.glass)m.renderOrder=2}})}
  function quality(){if(!R)return;lq=LOWQ;for(const k in MAT){MAT[k].dispose();delete MAT[k]}
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    S3.traverse(o=>{if(o.isMesh&&o.userData.tex)o.material=mat(o.userData.tex,o.userData.glass,o.userData.ghost)});
    amb.intensity=LOWQ?1.0:.5;sun.intensity=LOWQ?1.6:1.3;resize()}

  /* ───── pantalla (px, 1280×720) ↔ món (z=0) ───── */
  const gpos=(v,px,py,z=0)=>v.set((px-640)/P,(360-py)/(P*CP)+z*SP/CP,z);
  const proj=v=>[640+v.x*P,360-P*(v.y*CP-v.z*SP)];
  function later(t,f){wait.push({t:now+t,f})}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=2.8){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs v4: robots/v/<idioma>_<clau>.mp3; si no hi són, només el rètol) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('robots/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=2.8){cap(k,d);say([k])}
  const snd=(n,g=.6,r=1)=>play('rb_'+n,g,r);
  /* la ràdio toca un tros de la música del taller, filtrat com una ràdio antiga */
  function radio(){if(!AC||!CFG.sound||!BUF.m_robots)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;
    s.buffer=BUF.m_robots;f.type='bandpass';f.frequency.value=1100;f.Q.value=.8;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.15);g.gain.setValueAtTime(.9,t+1.6);g.gain.linearRampToValueAtTime(0,t+1.95);
    s.connect(f);f.connect(g);g.connect(SG);s.start(t,12.5);s.stop(t+2)}

  /* ───── instàncies (clons amb esquelet propi) i clips ───── */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  function inst(k,parent,ghost){const o=cloneSkinned(PROTO[k]),w=new THREE.Group();w.add(o);(parent||ROOT).add(w);paint(o,ghost);
    const x={k,w,o,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',ct:0,dur:0,ts:1,once:false,fired:{}};INST.push(x);return x}
  function free(x){if(!x)return;x.w.removeFromParent();x.mx.stopAllAction();x.o.traverse(n=>{if(n.isSkinnedMesh)n.skeleton.dispose()});const i=INST.indexOf(x);if(i>=0)INST.splice(i,1)}
  function clip(x,n,fade=.2,ts=1){if(!x)return;const c=CL[x.k][x.k+'_'+n],info=IX[x.k].clips[n];if(!c||!info)return;let a=x.A[n];if(!a)a=x.A[n]=x.mx.clipAction(c);
    const loop=!!info[1],prev=x.cur;a.enabled=true;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveTimeScale(ts);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a){if(fade>0)prev.crossFadeTo(a,fade,false);else prev.stop()}
    x.cur=a;x.cn=n;x.ct=0;x.ts=ts;x.dur=c.duration/ts;x.once=!loop;x.fired={}}
  const ends=(x,m=.06)=>x&&x.once&&x.ct>=x.dur-m;
  function evt(x,name){if(!x||!x.cn)return false;const e=IX[x.k].clips[x.cn][2][name];if(e==null||x.fired[name])return false;if(x.ct>=e/x.ts){x.fired[name]=1;return true}return false}
  /* col·loca un model perquè la seva capsa quedi centrada a (px,py) o amb la base a py (bottom) i alçada h px */
  function fitH(k,h){return h/(BB[k].s.y*P*CP)}
  function putBottom(x,px,py,s,z=0){const b=BB[x.k];gpos(x.w.position,px,py,z);x.w.position.x-=b.c.x*s;x.w.position.y-=b.min.y*s;x.w.scale.setScalar(s)}

  /* ───── robots: grup amb l'origen als peus; peces als endolls; sense cos es veu el bastidor; sense potes penja de la grua ───── */
  function mkRobot(p,X,Y,k,ghost,z=0){const g=new THREE.Group();ROOT.add(g);const rob={g,p:{},X,Y,k,ghost,z,parts:{},esq:null,hang:null,dx:0,dy:0,rz:0};
    for(const t of ORD)if(p[t])addPart(rob,t,p[t]);updFrame(rob);place(rob);return rob}
  function addPart(rob,t,n){if(rob.parts[t])free(rob.parts[t]);const x=inst(PK(t,n),rob.g,rob.ghost);x.w.position.set(...SOCK[t]);clip(x,'idle',0);x.mx.setTime(Math.random()*2);rob.parts[t]=x;rob.p[t]=n}
  function topOf(rob){let y=0;for(const t of ORD)if(rob.parts[t])y=Math.max(y,SOCK[t][1]+BB[PK(t,rob.p[t])].max.y);if(rob.esq)y=Math.max(y,BB.esquelet.max.y);return y}
  function updFrame(rob){
    if(!rob.p.b&&!rob.esq){rob.esq=inst('esquelet',rob.g,rob.ghost)}else if(rob.p.b&&rob.esq){free(rob.esq);rob.esq=null}
    if(!rob.p.l&&!rob.ghost){if(!rob.hang){rob.hang=inst('grua',rob.g);clip(rob.hang,'down',0)}const s=.62;rob.hang.w.scale.setScalar(s);rob.hang.w.position.set(0,topOf(rob)-BB.grua.min.y*s,0)}
    else if(rob.hang){free(rob.hang);rob.hang=null}}
  function freeRobot(rob){if(!rob)return;for(const t of ORD)free(rob.parts[t]);free(rob.esq);free(rob.hang);rob.g.removeFromParent()}
  function place(rob){gpos(rob.g.position,rob.X+rob.dx,rob.Y+rob.dy,rob.z);rob.g.scale.setScalar(rob.k);rob.g.rotation.set(0,rob.ry||0,rob.rz)}
  /* punts de pantalla d'un robot (px) a partir de l'alçada local (m) */
  const ry=(rob,yl)=>rob.Y+rob.dy-yl*rob.k*P*CP;
  function partC(rob,t){const n=rob.p[t];if(!n)return[rob.X,ry(rob,1.2)];const b=BB[PK(t,n)];return[rob.X+rob.dx+b.c.x*rob.k*P,ry(rob,SOCK[t][1]+b.c.y)]}

  /* ───── partida ───── */
  function clearAll(){while(INST.length)free(INST[INST.length-1]);while(ROOT.children.length)ROOT.remove(ROOT.children[0]);B=null;LV=null;PL=null}
  function newGame(){if(!ready)return;vStop();clearAll();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;
    st={rob:null,goal:null,opts:null,queue:[],ph:'none',t:0,cap:null,carry:null,no:null,built:[],count:0,paint:null,show:null,photo:null,first:true,ghost:null,cis:null,ball:null};
    B={x:inst('biel'),X:MIDX,Z:BZ.mid,yaw:-.55,at:'mid',ww:0,ph:0,mv:0,k:fitH('biel',BIEL.h)};clip(B.x,'idle',0);B.x.mx.update(0);B.rig=walkRig(B.x);
    LV=inst('palanca');putBottom(LV,LEV.x,LEV.y,fitH('palanca',LEV.h),-.5);   /* la palanca, més enrere: en Biel sempre hi passa per davant */clip(LV,'idle',0);
    newRobot()}
  const rndPart=t=>PARTS[t][Math.floor(Math.random()*4)];
  function newRobot(){const S=SZ[CFG.size];idle=0;helpSaid=false;st.t=0;st.paint=null;st.show=null;
    if(st.rob)freeRobot(st.rob);if(st.ghost)freeRobot(st.ghost);st.ghost=null;if(PL){free(PL);PL=null}
    const goal={};for(const t of ORD)goal[t]=rndPart(t);st.goal=MODE===1?goal:null;
    const p={};for(const t of ORD)if(!S.pick.includes(t))p[t]=goal[t];
    st.rob=mkRobot(p,-300,FY,1);st.queue=S.pick.slice();st.ph='enter';
    if(MODE===1){PL=inst('planol');putBottom(PL,PLAN.x,PLAN.y,fitH('planol',PLAN.h),-2.2);st.ghost=mkRobot(goal,PLAN.x,PLAN.y-38,.62,true,-1.8) /* plànol i dibuix ben al fons: el robot hi passa per davant */}
    clip(B.x,'wave',.2);
    if(st.first)later(.3,()=>tell('hola',2.2));else later(.3,()=>tell('nou',2));
    if(MODE===1)later(2.2,()=>{if(st&&(st.ph==='enter'||st.ph==='ask')&&st.queue.length===S.pick.length)tell('plano',2.2)});
    st.first=false}
  function nextAsk(){const S=SZ[CFG.size];freeOpts();
    if(!st.queue.length){st.t=0;idle=0;if(MODE===0){st.ph='lever';tell('encen',2.6)}else{st.ph='auto';clip(B.x,'laugh',.2);tell('igual',2.6)}return}
    const t=st.queue[0];let names;
    if(MODE===0)names=shuffle(PARTS[t].slice()).slice(0,S.n);
    else{const others=shuffle(PARTS[t].filter(n=>n!==st.goal[t])).slice(0,S.n-1);names=shuffle([st.goal[t],...others])}
    const tot=names.length*S.cw+(names.length-1)*26,x0=RX-tot/2+S.cw/2;
    st.opts=names.map((n,i)=>{const o={t,n,x:x0+i*(S.cw+26),y:OPY,w:S.cw,h:S.ch,react:0,pop:-i*.08};o.x3=inst(PK(t,n));clip(o.x3,'idle',0);
      const b=BB[PK(t,n)];o.s=Math.min(o.w*.84/(b.s.x*P),o.h*.76/(b.s.y*P*CP));placeOpt(o);return o});
    st.hintOpt=st.opts[Math.floor(Math.random()*st.opts.length)];
    st.ph='ask';st.t=0;idle=0;tell((MODE===0?'ask_':'plan_')+t,3)}
  function placeOpt(o){const b=BB[o.x3.k],pp=o.pop<0?0:o.pop<1?eBack(o.pop):1,s=Math.max(.001,o.s*pp),dx=o.react>0?Math.sin(o.react*16)*10:0;
    gpos(o.x3.w.position,o.x+dx,o.y,.3);o.x3.w.position.x-=b.c.x*s;o.x3.w.position.y-=b.c.y*s;o.x3.w.scale.setScalar(s);o.x3.w.rotation.z=o.react>0?Math.sin(o.react*16)*.05:0}
  function freeOpts(){if(st.opts)for(const o of st.opts)if(!st.carry||st.carry.o!==o)free(o.x3);st.opts=null}

  /* ───── la grua porta la peça: puja, travessa i baixa fins a l'endoll ───── */
  function startCarry(o){const r=st.rob,b=BB[o.x3.k],tc=[RX+b.c.x*r.k*P,ry(r,SOCK[o.t][1]+b.c.y)];
    const g=inst('grua');clip(g,'down',0);g.w.scale.setScalar(.62);
    st.carry={o,t:0,x0:o.x,y0:o.y,s0:o.s,tx:tc[0],ty:tc[1],g,down:0,z:CZ};st.ph='carry';st.t=0;snd('grua',.55);   /* en Biel hi va caminant (stepBiel) i cargola quan la peça baixa */
    for(const q of st.opts)if(q!==o)q.fade=1}
  function stepCarry(dA){const c=st.carry;c.t+=dA;const u=c.t,x3=c.o.x3,b=BB[x3.k];let x,y,s;
    if(u<.7){const k=ez(c01(u/.7));x=c.x0;y=lerp(c.y0,CY,k);s=lerp(c.s0,1,k)}
    else if(u<1.5){const k=ez(c01((u-.7)/.8));x=lerp(c.x0,c.tx,k);y=CY;s=1}
    else{const k=ez(c01((u-1.5)/.7));x=c.tx;y=lerp(CY,c.ty,k);s=1;c.z=lerp(CZ,.02,k);if(!c.down){c.down=1;clip(c.g,'down',.1)}}
    if(u>=1.3&&!c.scr&&B.at==='work'){c.scr=1;clip(B.x,'screw',.2)}
    gpos(x3.w.position,x,y,c.z);x3.w.position.x-=b.c.x*s;x3.w.position.y-=b.c.y*s;x3.w.scale.setScalar(s);x3.w.rotation.z=0;
    const top=x3.w.position.y+b.max.y*s;c.g.w.position.set(x3.w.position.x+b.c.x*s,top-BB.grua.min.y*.62,c.z);c.gx=x;c.gy=proj(c.g.w.position)[1]-BB.grua.s.y*.62*P*CP;
    if(u>=CARRY){const r=st.rob;addPart(r,c.o.t,c.o.n);updFrame(r);free(x3);st.queue.shift();freeOpts();snd('cargol',.6);
      clip(B.x,'tail_tap',.15);clip(c.g,'up',.1);st.lift={g:c.g,t:0,z:c.z};st.carry=null;STATS.n++;$('#oN').textContent=STATS.n;
      const [px,py]=partC(r,c.o.t);for(let i=0;i<9;i++)fxp.push({kind:'spark',x:px+rnd(-60,60),y:py+rnd(-40,40),vx:rnd(-80,80),vy:rnd(-80,20),t:0,d:.7,r:rnd(5,8)});
      st.ph='fixed';st.t=0}}
  function stepLift(dA){const l=st.lift;if(!l)return;l.t+=dA;l.g.w.position.y+=dA*l.t*14;if(l.t>1){free(l.g);st.lift=null}}
  /* «no»: la grua baixa damunt la peça equivocada, es gronxa i se'n torna (sense so) */
  function startNo(o){if(st.no)free(st.no.g);o.react=1.3;const g=inst('grua');g.w.scale.setScalar(.62);clip(g,'swing',.1);st.no={o,g,t:0}}
  function stepNo(dA){const n=st.no;if(!n)return;n.t+=dA;const b=BB[n.o.x3.k],s=n.o.s,top=n.o.y-b.s.y*s*P*CP/2-18;
    const k=n.t<.35?ez(n.t/.35):n.t>1.35?1-ez(c01((n.t-1.35)/.35)):1,yy=lerp(-60,top,k);
    gpos(n.g.w.position,n.o.x,yy,GZ);n.g.w.position.y-=BB.grua.min.y*.62;n.gx=n.o.x;n.gy=yy-BB.grua.s.y*.62*P*CP;
    if(n.t>1.75){free(n.g);st.no=null}}

  /* ───── l'espectacle: potes, cos, braços i cap, 2 s cadascun ───── */
  function startPull(){st.ph='pull';st.t=0;freeOpts();clip(B.x,'lever',.2);later(.25,()=>{if(st&&st.ph==='pull'){clip(LV,'pull',.1);snd('palanca',.65)}})}
  function startShow(){st.ph='show';st.t=0;st.show={sg:-1};clip(B.x,'clap',.25)}
  function stepShow(dA){const r=st.rob,sg=Math.floor(st.t/SEG),u=(st.t-sg*SEG)/SEG;
    if(sg!==st.show.sg&&sg<4){const pt=ORD[st.show.sg];if(pt&&r.parts[pt])clip(r.parts[pt],'idle',.25);st.show.sg=sg;const t=ORD[sg],n=r.p[t];clip(r.parts[t],'action',.15);
      const a=SFXA[t][n];if(a==='radio')radio();else if(a==='molla'){snd('molla',.55);later(.6,()=>snd('molla',.5,1.05));later(1.2,()=>snd('molla',.5,.95))}else snd(a,.6);
      if(t==='a'&&n==='pinzells')st.paint={pts:[]};
      if(t==='a'&&n==='pinca'){st.cis=inst('cistella');st.cis.pop=0;st.ball=inst('pilota');st.ball.fly=0}}
    r.dx=0;r.dy=0;r.rz=0;
    if(sg<4){const t=ORD[sg],n=r.p[t],s=Math.sin(u*Math.PI),x=r.parts[t];
      if(t==='l'&&n==='rodes')r.dx=Math.sin(u*Math.PI*2)*90;
      if(t==='l'&&n==='molles')r.dy=-Math.abs(Math.sin(u*Math.PI*3))*70;
      if(t==='l'&&n==='erugues'){r.dx=Math.sin(u*Math.PI)*60;r.rz=.08*Math.sin(u*Math.PI*2);r.dy=-24*s}
      if(t==='l'&&n==='helix')r.dy=-70*s+Math.sin(now*9)*3;
      if(t==='b'&&n==='bido'&&u<.6)r.dy=-Math.abs(Math.sin(u*Math.PI*3.4))*16;
      showFx(dA,t,n,u);
      if(t==='a'&&n==='pinca'&&st.ball)stepBall(u,x)}
    if(st.cis){const c=st.cis;c.pop=Math.min(1,c.pop+dA*3)*(sg>=3&&u>.6?0:1);if(sg>=3&&u>.6)c.out=(c.out||0)+dA*3;const pp=c.out?Math.max(0,1-c.out):eBack(c.pop);
      putBottom(c,CIS.x,CIS.y,Math.max(.001,fitH('cistella',CIS.h)*pp),.2);if(c.out>=1){free(c);st.cis=null}}
    if(st.t>SEG*4+.3){const pt=ORD[3];if(r.parts[pt])clip(r.parts[pt],'idle',.25);r.dx=r.dy=r.rz=0;st.ph='spin';st.t=0;snd('grua',.35,.8)}
    place(r)}
  function stepBall(u,arms){const b=st.ball,r=st.rob,ab=BB[arms.k],s=fitH('pilota',34);
    const hx=RX+r.dx+(ab.max.x-.08)*P,hy=ry(r,1.52+ab.min.y+.1),tx=CIS.x,ty=CIS.y-CIS.h*.85,rel=.9/2;
    let x,y,vis=true;if(u<rel){x=hx;y=hy}else{const k=c01((u-rel)/.32);x=lerp(hx,tx,k);y=lerp(hy,ty,k)-Math.sin(k*Math.PI)*120;if(k>=1){vis=false;if(!b.fly){b.fly=1;snd('cistella',.6);if(st.cis)clip(st.cis,'score',.05)}}}
    b.w.visible=vis;gpos(b.w.position,x,y,.4);b.w.position.x-=BB.pilota.c.x*s;b.w.position.y-=BB.pilota.c.y*s;b.w.scale.setScalar(s);
    if(!vis&&b.fly){free(b);st.ball=null}}
  function showFx(dA,t,n,u){const r=st.rob,[hx,hy]=partC(r,'h'),[bx,by]=partC(r,'b'),X=r.X+r.dx;
    if(n==='tetera'&&t==='h'&&Math.random()<dA*5)fxp.push({kind:'heart',x:hx+55,y:hy-40,vx:rnd(10,30),vy:-60,t:0,d:2,r:rnd(10,16)});
    if(n==='peixera'&&Math.random()<dA*8)fxp.push({kind:'bub',x:hx+rnd(-30,30),y:hy-10,vx:rnd(-8,8),vy:-50,t:0,d:1.6,r:rnd(4,8)});
    if(n==='radio'&&Math.random()<dA*4)fxp.push({kind:'note',x:hx+rnd(-60,60),y:hy-70,vx:rnd(-20,20),vy:-45,t:0,d:1.8,r:16});
    if(n==='gerra'&&Math.random()<dA*10)fxp.push({kind:'spark',x:bx+rnd(-40,40),y:by+rnd(-50,50),vx:rnd(-30,30),vy:rnd(-30,30),t:0,d:.8,r:rnd(3,5)});
    if(n==='ventalls'&&Math.random()<dA*10)fxp.push({kind:'leaf',x:X+rnd(-160,160),y:rnd(380,540),vx:rnd(-160,160),vy:rnd(-120,-40),g:40,t:0,d:2,r:rnd(8,13),rot:rnd(0,6),vr:rnd(-5,5),c:LEAF[Math.floor(Math.random()*4)]});
    if(t==='l'&&(n==='helix'||n==='rodes'||n==='erugues')&&Math.random()<dA*7)fxp.push({kind:'dust',x:X+rnd(-60,60),y:FY-5,vx:rnd(-40,40),vy:-8,t:0,d:.8,r:rnd(8,14)});
    if(n==='caixa'&&t==='b'&&u<.05&&!st.show.conf){st.show.conf=1;for(let i=0;i<12;i++)fxp.push({kind:'leaf',x:bx,y:by,vx:rnd(-160,160),vy:rnd(-260,-80),g:300,t:0,d:1.5,r:rnd(6,10),rot:rnd(0,6),vr:rnd(-5,5),c:CONF[i%5]})}
    if(t==='a'&&n==='pinzells'&&st.paint)st.paint.pts.push([RX-210+u*420,200+Math.sin(u*14)*40+Math.sin(u*5)*20])}

  /* ───── foto de grup cada 3 robots ───── */
  function startPhoto(){st.ph='photo';st.t=0;st.paint=null;LV.w.visible=false;if(PL)PL.w.visible=false;if(st.ghost)st.ghost.g.visible=false;
    st.photo={robs:st.built.map((p,i)=>mkRobot(p,[380,640,900][i]||640,FY,.78)),shot:0};clip(B.x,'photo',.2);tell('foto',3);later(1.7,()=>snd('festa',.55))}
  function stepPhoto(dA){const ph=st.photo;ph.robs.forEach((r,i)=>{r.dy=-Math.abs(Math.sin(now*4+i))*10;place(r)});
    if(evt(B.x,'click')&&!ph.shot){ph.shot=1;snd('foto',.6)}
    if(Math.random()<dA*14)fxp.push({kind:'leaf',x:rnd(0,W),y:-20,vx:rnd(-20,20),vy:rnd(70,130),g:0,t:0,d:4,r:rnd(7,12),rot:rnd(0,6),vr:rnd(-3,3),c:CONF[Math.floor(Math.random()*5)]});
    if(st.t>6.5){ph.robs.forEach(freeRobot);st.photo=null;st.built=[];LV.w.visible=true;newRobot()}}

  /* ───── mirada ───── */
  function inBox(o,x,y){return x>o.x-o.w/2&&x<o.x+o.w/2&&y>o.y-o.h/2&&y<o.y+o.h/2}
  function leverBox(){return{x:LEV.x,y:LEV.y-LEV.h/2-10,w:150,h:LEV.h+40}}
  function hit(x,y){if(!st)return null;
    if(st.ph==='ask'&&st.opts)for(const o of st.opts)if(inBox(o,x,y))return{k:'opt',o};
    if(st.ph==='lever'&&inBox(leverBox(),x,y))return{k:'lev'};
    return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.o===b.o);
  function actionable(g){if(!g||!st)return false;if(g.k==='opt')return st.ph==='ask'&&g.o.react<=0&&g.o.pop>=1;return g.k==='lev'&&st.ph==='lever'&&B.at==='lev'}   /* la palanca s'activa quan en Biel hi és */
  function activate(g){if(!actionable(g))return;idle=0;helpSaid=false;if(B.help){B.help=0;clip(B.x,'idle',.25)}
    if(g.k==='lev'){STATS.n++;$('#oN').textContent=STATS.n;startPull();return}
    const o=g.o;if(MODE===1&&o.n!==st.goal[o.t]){startNo(o);return}
    startCarry(o)}
  function hint(){if(!st)return null;
    if(st.ph==='ask'&&st.opts){const o=MODE===1?st.opts.find(o=>o.n===st.goal[o.t]):st.hintOpt;return o?{k:'opt',o,x:o.x,y:o.y}:null}
    if(st.ph==='lever'&&B.at==='lev'){const b=leverBox();return{k:'lev',x:b.x,y:b.y}}return null}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;st.t+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    if(B&&B.sv){for(const [b,q] of B.sv)b.quaternion.copy(q);B.sv=null}   /* desfà el pas del fotograma anterior: el mixer només reescriu un os si el clip el canvia */
    for(const x of INST){x.mx.update(dA);x.ct+=dA}
    const g=has?hit(wx,wy):null;
    if(!same(g,cur)){cur=g;dw=0}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur={k:'lock'};activate(g)}}else dw=0;
    /* en Biel */
    stepBiel(dA);
    if(B.x.cn==='tail_tap'&&evt(B.x,'tap'))snd('toc',.6);
    if(B.x.cn==='screw'&&evt(B.x,'screw'))snd('cargol',.35,1.1);
    if(B.x.once&&ends(B.x)&&!['photo'].includes(B.x.cn))clip(B.x,st.ph==='show'?'clap':'idle',.3);
    if(LV.cn==='pull'&&evt(LV,'on')){snd('espurna',.6);const r=st.rob;for(let i=0;i<14;i++)fxp.push({kind:'spark',x:r.X+rnd(-90,90),y:ry(r,rnd(.3,2.2)),vx:rnd(-60,60),vy:rnd(-90,10),t:0,d:1,r:rnd(5,9)})}
    if(LV.once&&ends(LV))clip(LV,'idle',.3);
    /* opcions */
    if(st.opts)for(const o of st.opts){if(st.carry&&st.carry.o===o)continue;o.react=Math.max(0,o.react-dA);if(o.pop<1)o.pop=Math.min(1,o.pop+dA*2.4);if(o.fade)o.pop=Math.max(0,o.pop-dA*3.5)+0;placeOpt(o)}
    const r=st.rob;
    if(st.ph==='enter'){r.X=lerp(-300,RX,ez(c01(st.t/1.6)));place(r);if(st.t>1.8){r.X=RX;place(r);nextAsk()}}
    else if(st.ph==='carry')stepCarry(dA);
    else if(st.ph==='fixed'){if(st.t>.9)nextAsk()}
    else if(st.ph==='auto'){if(st.t>2.4&&B.at==='lev')startPull()}
    else if(st.ph==='pull'){if(st.t>1.25)startShow()}
    else if(st.ph==='show')stepShow(dA);
    else if(st.ph==='spin'){/* el robot acabat gira sobre si mateix per veure'l amb volum */r.ry=ez(c01(st.t/2.6))*Math.PI*2;r.dy=-Math.sin(c01(st.t/2.6)*Math.PI)*6;place(r);if(st.t>2.8){r.ry=0;r.dy=0;place(r);st.ph='exit';st.t=0;clip(B.x,'wave',.2);tell('adeu',1.8)}}
    else if(st.ph==='exit'){r.X=lerp(RX,-320,ez(c01(st.t/2)));place(r);if(st.t>2.1){st.built.push(Object.assign({},r.p));st.count++;freeRobot(r);st.rob=mkRobot({},-400,FY,1);st.rob.g.visible=false;
        if(st.count%3===0)startPhoto();else newRobot()}}
    else if(st.ph==='photo')stepPhoto(dA);
    if(r&&r.hang&&st.ph!=='show'){/* la grua d'on penja es gronxa una mica */r.hang.w.rotation.z=Math.sin(now*1.6)*.03}
    stepLift(dA);stepNo(dA);
    for(const p of fxp){p.t+=dA;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA;if(p.rot!=null)p.rot+=p.vr*dA}fxp=fxp.filter(p=>p.t<p.d);
    /* ajuda: als 6 s brilla la bona; als 12 s en Biel l'assenyala */
    if(st.ph==='ask'||(st.ph==='lever'&&B.at==='lev'))idle+=dA;else idle=0;
    if(idle>HELP*2&&!helpSaid&&hint()){helpSaid=true;B.help=1;clip(B.x,'point',.25);say(['mira']);cap('mira',2.2)}
    ROOT.updateMatrixWorld(true)}

  /* ───── en Biel camina (19-11-2026): quan la grua agafa una peça va a l'estructura i la cargola; després torna a poc a poc
     al lloc d'espera, entre el robot i la palanca; amb totes les peces posades va a la palanca i espera. No té clip de caminar:
     el pas es fa a sobre del clip que toqui (cuixes, genolls i braços al voltant de l'eix lateral del model) ───── */
  function bielGoal(){const ph=st.ph;
    if(ph==='carry'||ph==='fixed')return['work',WORKX,BZ.work,Math.PI,2.1];
    if(ph==='photo')return['photo',1120,BZ.lev,-.5,2.1];   /* a la foto s'aparta una mica perquè no tapi el tercer robot */
    if(['lever','auto','pull','show','spin','exit'].includes(ph))return['lev',BIEL.x,BZ.lev,-.5,2.1];
    if(B.at==='work'&&B.x.cn==='tail_tap'&&!ends(B.x))return['work',WORKX,BZ.work,Math.PI,2.1];   /* acaba el cop de cua abans de tornar */
    return['mid',MIDX,BZ.mid,-.55,.75]}
  function stepBiel(dA){const [id,tx,tz,face,sp]=bielGoal(),dx=(tx-B.X)/P,dz=tz-B.Z,d=Math.hypot(dx,dz),s=sp*dA;
    if(d<=s+1e-4){B.X=tx;B.Z=tz;B.at=id;B.mv=0;B.yaw=angTo(B.yaw,face,dA*6)}
    else{B.at=null;B.mv=1;B.X+=dx/d*s*P;B.Z+=dz/d*s;B.yaw=angTo(B.yaw,Math.atan2(dx,dz),dA*9);B.ph+=dA*Math.PI*2*(sp>1?2.2:1.3);
      if(['point','clap','screw','lever','tail_tap'].includes(B.x.cn))clip(B.x,'idle',.2)}
    B.ww=c01(B.ww+(B.mv?1:-1)*dA*6);
    const w=B.x.w;gpos(w.position,B.X,BIEL.y+B.Z*P*SP,B.Z);w.position.y+=Math.abs(Math.sin(B.ph))*.035*B.ww;w.scale.setScalar(B.k);w.rotation.y=B.yaw;
    if(B.ww>.001){const a=Math.sin(B.ph),c=Math.cos(B.ph),k=B.ww*(sp>1?1:.75);
      bone('thigh_L',.42*a*k);bone('thigh_R',-.42*a*k);bone('shin_L',.6*Math.max(0,-c)*k);bone('shin_R',.6*Math.max(0,c)*k);
      if(!['wave','point','screw','lever','photo'].includes(B.x.cn)){bone('arm_L',-.32*a*k);bone('arm_R',.32*a*k)}}}
  const QW=new THREE.Quaternion();
  function bone(n,a){const r=B.rig[n];if(!r)return;(B.sv=B.sv||[]).push([r.b,r.b.quaternion.clone()]);QW.setFromAxisAngle(r.a,a);r.b.quaternion.multiply(QW)}
  function walkRig(x){const o=x.o,q0=new THREE.Quaternion(),q=new THREE.Quaternion(),rg={};o.updateMatrixWorld(true);o.getWorldQuaternion(q0);q0.invert();
    for(const n of ['thigh_L','thigh_R','shin_L','shin_R','arm_L','arm_R']){const b=o.getObjectByName(n);if(!b)continue;b.getWorldQuaternion(q);q.premultiply(q0).invert();
      rg[n]={b,a:new THREE.Vector3(1,0,0).applyQuaternion(q).normalize()}}return rg}
  /* cordes de la grua en 3D (a la profunditat de la grua): així queden per davant o per darrere del robot i d'en Biel com toca */
  function rope3(i,x,y,z){let m=RP[i];if(!m){m=RP[i]=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,1,6),new THREE.MeshBasicMaterial({color:0x6b4b2c,toneMapped:false}));m.frustumCulled=false;S3.add(m)}
    gpos(V1,x,-12,z);gpos(V2,x,y,z);m.position.set(V1.x,(V1.y+V2.y)/2,z);m.scale.set(1,Math.max(.001,V1.y-V2.y),1);m.visible=true}

  /* ───── dibuix ───── */
  function glow(c,x,y,rx,ry_,k=1){const p=.5+.5*Math.sin(now*2.6);c.fillStyle=`rgba(255,240,170,${(.22+.25*p)*k})`;c.beginPath();c.ellipse(x,y,rx+6*p,ry_+4*p,0,0,7);c.fill()}
  function rope(c,x,y){c.strokeStyle='#6b4b2c';c.lineWidth=4;c.beginPath();c.moveTo(x,-4);c.lineTo(x,y);c.stroke()}
  function shadowE(c,x,y,rx,ry_,a=.2){c.fillStyle=`rgba(60,35,15,${a})`;c.beginPath();c.ellipse(x,y,rx,ry_,0,0,7);c.fill()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&IM.fons&&IM.fons.complete)c.drawImage(IM.fons,0,0,W,H);
    if(!R||!ready||!st)return;
    c.fillStyle='#8a6a3e';c.fillRect(300,6,680,10);   /* el rail de la grua */
    /* pintura dels pinzells a la paret */
    if(st.paint&&st.paint.pts.length>1){const p=st.paint.pts;c.save();c.lineCap='round';c.lineJoin='round';c.lineWidth=16;
      for(const [col,oy] of [['#3d7fc4',0],['#d0443a',30]]){c.strokeStyle=col;c.beginPath();c.moveTo(p[0][0],p[0][1]+oy);for(const q of p)c.lineTo(q[0],q[1]+oy);c.stroke()}c.restore()}
    const r=st.rob;
    if(st.ph==='show'&&r){const sg=Math.floor(st.t/SEG),u=(st.t-sg*SEG)/SEG;if(sg===3&&r.p.h==='bombeta'){const k=Math.sin(u*Math.PI),[hx,hy]=partC(r,'h'),g=c.createRadialGradient(hx,hy,5,hx,hy,190);
      g.addColorStop(0,`rgba(255,230,140,${.55*k})`);g.addColorStop(1,'rgba(255,230,140,0)');c.fillStyle=g;c.beginPath();c.arc(hx,hy,190,0,7);c.fill()}}
    /* ombres */
    if(r&&r.g.visible&&r.X>-200){const lift=-r.dy;shadowE(c,r.X+r.dx,FY+2,95*(1-lift/300),12*(1-lift/300),r.p.l?.22:.1)}
    if(st.photo)for(const q of st.photo.robs)shadowE(c,q.X,FY+2,74,10);
    shadowE(c,B.X,BIEL.y+B.Z*P*SP+2,70,11);shadowE(c,LEV.x,LEV.y+2,55,9,.18);
    /* cordes de la grua */
    for(const m of RP)if(m)m.visible=false;
    if(r&&r.hang&&r.g.visible){const [gx,gy]=proj(r.hang.w.getWorldPosition(V1));rope3(0,gx,gy-BB.grua.s.y*.62*P*CP*r.k+6,r.z)}
    if(st.carry&&st.carry.gy!=null)rope3(1,st.carry.gx,st.carry.gy+6,st.carry.z);
    if(st.lift){const [gx,gy]=proj(st.lift.g.w.position);rope3(2,gx,gy-BB.grua.s.y*.62*P*CP+6,st.lift.z)}
    if(st.no&&st.no.gy!=null)rope3(3,st.no.gx,st.no.gy+6,GZ);
    /* targetes del prestatge i brillantors */
    const H0=idle>HELP?hint():null;
    if(st.opts)for(const o of st.opts){if(st.carry&&st.carry.o===o)continue;const pp=o.pop<0?0:Math.min(1,o.pop);if(pp<=0)continue;const dx=o.react>0?Math.sin(o.react*16)*10:0;
      if(H0&&H0.o===o)glow(c,o.x,o.y,o.w*.58,o.h*.6,1.3);
      c.save();c.globalAlpha=pp;c.translate(o.x+dx,o.y);c.fillStyle='rgba(255,248,230,.6)';c.strokeStyle='rgba(120,80,40,.55)';c.lineWidth=3;c.beginPath();c.roundRect(-o.w/2,-o.h/2,o.w,o.h,22);c.fill();c.stroke();c.restore();
      if(cur&&cur.o===o&&actionable(cur))glow(c,o.x,o.y,o.w*.55,o.h*.56,.55)}
    if(st.ph==='lever'){const b=leverBox();glow(c,b.x,b.y,b.w*.55,b.h*.55,idle>HELP?1.4:.6)}
    R.render(S3,cam);
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    drawMarks(f);
    for(const p of fxp)drawP(f,p);f.globalAlpha=1;
    if(st.photo&&st.t>1.2){const k=c01((st.t-1.2)/.3);f.strokeStyle=`rgba(255,255,255,${k})`;f.lineWidth=14;f.strokeRect(220,110,840,480)}
    drawCap(f)}
  /* senyals verds al plànol per a les peces ja posades */
  function drawMarks(f){if(MODE!==1||!st.ghost||!PL||!PL.w.visible)return;const g=st.ghost,pw=BB.planol.s.x*fitH('planol',PLAN.h)*P;
    for(const t of SZ[CFG.size].pick)if(st.rob&&st.rob.parts[t]&&st.ph!=='enter'){const x=PLAN.x+pw*.38,y=t==='a'?ry(g,1.52+BB[PK('a',g.p.a)].max.y-.05):partC(g,t)[1];
      f.fillStyle='#4f9a4a';f.beginPath();f.arc(x,y,15,0,7);f.fill();f.strokeStyle='#fff';f.lineWidth=4;f.beginPath();f.moveTo(x-7,y);f.lineTo(x-2,y+6);f.lineTo(x+8,y-6);f.stroke()}}
  function drawP(f,p){const a=Math.max(0,1-p.t/p.d);f.save();f.globalAlpha=clamp(a*1.6,0,1);f.translate(p.x,p.y);
    if(p.kind==='heart'){f.fillStyle='rgba(255,255,255,.85)';const r=p.r*(1+p.t*.5);f.beginPath();f.moveTo(0,r*.4);f.bezierCurveTo(-r*1.2,-r*.4,-r*.5,-r*1.2,0,-r*.5);f.bezierCurveTo(r*.5,-r*1.2,r*1.2,-r*.4,0,r*.4);f.fill()}
    else if(p.kind==='bub'){f.strokeStyle='rgba(220,245,255,.95)';f.lineWidth=2;f.beginPath();f.arc(0,0,p.r,0,7);f.stroke()}
    else if(p.kind==='note'){f.fillStyle='#4a3420';f.font='700 30px serif';f.fillText('♪',0,0)}
    else if(p.kind==='spark'){f.fillStyle='#ffe28a';f.beginPath();f.arc(0,0,p.r*(1-p.t/p.d*.5),0,7);f.fill()}
    else if(p.kind==='dust'){f.fillStyle='rgba(240,230,210,.6)';f.beginPath();f.arc(0,0,p.r*(1+p.t),0,7);f.fill()}
    else if(p.kind==='leaf'){f.rotate(p.rot);f.fillStyle=p.c;f.beginPath();f.ellipse(0,0,p.r,p.r*.5,0,0,7);f.fill()}
    f.restore()}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('robots.'+c.k);f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=W/2,y=152,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,250,238,.94)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,54,27);f.fill();f.fillStyle='#5a3a1e';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+3);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function layout(){if(!ready)return;newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newGame()}
  function tray(){const t=$('#tray');t.innerHTML='';['robots.m1','robots.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  function mus(){return 'm_robots'}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:()=>null,hit,hint,activate,actionable,scr,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},get B(){return B},PROTO,IX,INST,BB}
})();
