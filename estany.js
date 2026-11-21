/* =========================================================
   ESCENARI: L'ESTANY DE GRANOTES
   Granotes de vinil 3D, flor de nenúfar i barret de jonc (three.js, models fets amb Blender a partir dels concepts de ChatGPT de Marc).
   Fons de gouache i nenúfars pintats en 2D (canvas del fons); les granotes, les flors i les sorpreses que volen, en 3D a sobre.
   «El camí de nenúfars»: una granota espera a la riba de davant i cada nenúfar que la deixa arribar brilla; quan el mira,
     hi salta. Fila a fila arriba a la riba del fons, amb la seva família. Alguns nenúfars amaguen sorpreses (flor, libèl·lula,
     peixet, cargol). Mirar un nenúfar que no toca només el fa gronxar. Cada 3 granotes que arriben, festa.
   «Repeteix la cançó»: la directora (granota lila amb barret) fa cantar les granotes del cor una per una; després li toca
     a l'infant mirar-les en el mateix ordre. Cada encert allarga la cançó una nota; si s'equivoca, la directora la torna
     a cantar (sense so d'error). Cançó completa → festa i cançó nova.
   Càmera fixa (cap zoom ni moviment de càmera). Sense veus.
   ========================================================= */
const ESTANY=(()=>{
  const TX={ca:['El camí de nenúfars','Repeteix la cançó'],es:['El camino de nenúfares','Repite la canción'],eu:['Nenufarren bidea','Errepikatu abestia'],
    gl:['O camiño de nenúfares','Repite a canción'],en:['The lily pad path','Repeat the song'],fr:['Le chemin de nénuphars','Répète la chanson']};
  for(const l in TX)if(I18N[l]){I18N[l]['estany.m1']=TX[l][0];I18N[l]['estany.m2']=TX[l][1]}
  const COLORS=['verda','groga','blava','vermella','taronja','lila'];
  const HEX={verda:0x5cc84a,groga:0xffd23a,blava:0x4aa8ff,vermella:0xf0564a,taronja:0xff9a2e,lila:0xb07ae6};
  /* mides (gran, mitjana, petita). Camí: files de nenúfars, nenúfars per fila, amplada del nenúfar, quants de la fila següent
     es poden triar, salt lateral, sorpreses per granota. Cançó: granotes del cor, notes màximes, amplada del nenúfar */
  const SZ1=[{rows:2,per:[3,3],pad:220,k:2,side:false,surp:1},{rows:3,per:[3,3,3],pad:170,k:2,side:true,surp:2},{rows:4,per:[3,4,4,3],pad:130,k:3,side:true,surp:3}];
  const SZ2=[{n:2,max:3,pad:270},{n:3,max:4,pad:230},{n:4,max:5,pad:195}];
  const MARI=[392,440,493.88,587.33,659.25,783.99,880,987.77,1174.66];   // sol major pentatònica (la nota mostrejada és La 4)
  const CHOIR={2:[0,3],3:[0,2,4],4:[0,2,3,5]};                          // notes del cor, d'esquerra a dreta (com un xilòfon)
  const SQ=.42,PITCH=.43,HELP=6,FEST=6.5;                              // aixafament dels nenúfars = sin(elevació de la vista); la mateixa inclinació en 3D
  const P=y=>.5+.5*(y-200)/420,K=y=>P(y)/P(575);                       // perspectiva: escala relativa al primer pla
  let R=null,S3,cam,cvs=null,on=false,ready=false,lq=null,MODE=0,NL=0,ENV=null;
  const PROTO={},CLIPS={},TEX={},fons=img('estany/fons.webp'),PADI=[0,1,2].map(i=>img('estany/pad'+i+'.webp')),SNAIL=img('estany/cargol.webp');
  let amb,sun,back,ROOT,petalTex,MAT={};
  let pads=[],frogs=[],family=[],frog=null,flowers=[],ripples=[],fx=[],confetti=[],queue=[],arrived=0,party=-1,round=0,now=0,nextAt=0,partyPending=false;
  let idle=0,helpFly=null,G={x:-999,y:-999,seen:false},bankHov=0,bankIn=false,jumps=0;
  let helped=false,choir=[],dir=null,song=[],L=1,prog=0,phase='',phT=0,demoI=0,songs=0,lastDone=0;
  const V1=new THREE.Vector3(),EU=new THREE.Euler();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3e';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(0,W,0,-H,-4000,4000);
    amb=new THREE.AmbientLight(0xffffff,.12);sun=new THREE.DirectionalLight(0xffffff,1.35);sun.position.set(-2,5,4);
    back=new THREE.DirectionalLight(0xffffff,.8);back.position.set(1.5,3,-4.5);S3.add(amb,sun,back);
    ROOT=new THREE.Group();S3.add(ROOT);
    const TL=new THREE.TextureLoader(),tx=(p,fy)=>{const t=TL.load(U(p));t.colorSpace=THREE.SRGBColorSpace;t.flipY=!!fy;t.anisotropy=2;return t};
    for(const c of COLORS)TEX['granota_'+c]=tx('estany/granota_'+c+'.webp');
    TEX.flor=tx('estany/flor_nenufar.webp');TEX.barret=tx('estany/barret.webp');
    for(const k of ['libellula','peixet'])TEX[k]=tx('estany/'+k+'.webp',true);
    const ct=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
    petalTex=ct(32,48,g=>{g.fillStyle='#fff';g.beginPath();g.ellipse(16,24,12,22,0,0,7);g.fill()});
    const L=new GLTFLoader(),ks=['granota','flor_nenufar','barret'];
    for(const k of ks)L.load(U('estany/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;CLIPS[k]={};for(const c of g.animations)CLIPS[k][c.name]=c;
      if(++NL===ks.length){ready=true;quality();if(on)layout()}},undefined,e=>console.error(e));
    resize()}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'})}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: alta = vinil brillant (física + reflexos de RoomEnvironment) i gouache mat; ràpida = Lambert i bàsic ───── */
  function vinyl(t){return LOWQ?new THREE.MeshLambertMaterial({map:t})
    :new THREE.MeshPhysicalMaterial({map:t,roughness:.3,metalness:0,clearcoat:.5,clearcoatRoughness:.15,envMap:ENV,envMapIntensity:.42})}
  function matte(t){return LOWQ?new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.5,color:0x888888,side:THREE.DoubleSide})}
  function quality(){if(!R||!ready)return;lq=LOWQ;for(const k in MAT)MAT[k].dispose();MAT={};
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const c of COLORS)MAT[c]=vinyl(TEX['granota_'+c]);MAT.flor=matte(TEX.flor);MAT.barret=matte(TEX.barret);
    if(LOWQ){amb.intensity=1.5;sun.intensity=1.6;back.intensity=.5}else{amb.intensity=.12;sun.intensity=1.35;back.intensity=.8}
    for(const f of frogs)paintF(f);for(const f of flowers)paint(f.m,MAT.flor)}
  function paint(o,m){o.traverse(n=>{if(n.isMesh)n.material=m})}
  function paintF(f){paint(f.m,MAT[f.c]);if(f.hat)paint(f.hat,MAT.barret)}

  /* còpia d'un model amb esquelet (el paquet de three no porta SkeletonUtils) */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  const zOf=y=>y*1.4-500;                                               // més avall a la pantalla = més a prop

  /* ───── granotes ───── */
  function mkFrog(c,x,y,h,yaw){const g=new THREE.Group(),pt=new THREE.Group(),yw=new THREE.Group(),m=cloneSkinned(PROTO.granota);
    pt.rotation.x=PITCH;yw.add(m);pt.add(yw);g.add(pt);ROOT.add(g);
    const mx=new THREE.AnimationMixer(m),A={};for(const n in CLIPS.granota)A[n]=mx.clipAction(CLIPS.granota[n]);
    const bone=n=>m.getObjectByName(n);
    const f={c,g,pt,yw,m,mx,A,cur:null,x,y,h,lift:0,yaw:yaw||0,yawT:yaw||0,at:-1,jump:null,grow:0,hat:null,ct:0,next:null,
      ullE:bone('ull_E'),ullD:bone('ull_D'),ex:0,ey:0,etx:0,ety:0,ph:Math.random()*9,hov:0,dw:0,inside:false,glow:0,help:0,cd:0};
    paintF(f);clip(f,'repos',true,0);f.A.repos.time=Math.random()*3;frogs.push(f);return f}
  function freeFrog(f){ROOT.remove(f.g);f.mx.stopAllAction();f.m.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()});frogs=frogs.filter(q=>q!==f)}
  function clip(f,n,loop,fd=.1,then){const a=f.A[n],p=f.cur;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);a.clampWhenFinished=!loop;
    a.setEffectiveWeight(1);a.play();if(p&&p!==a){if(fd>0)p.crossFadeTo(a,fd,false);else p.stop()}f.cur=a;f.ct=0;f.next=loop?null:(then||'repos')}
  function hat(f){const b=PROTO.barret.clone(true);f.m.getObjectByName('cap').add(b);f.hat=b;paint(b,MAT.barret)}
  function croak(f,rate=1,g=.6,alt){clip(f,'rauc',false,.08);play(alt?'e_rauc2':'e_rauc',g,rate)}
  function note(i,g=.5,when=0){play('e_marimba',g,MARI[clamp(i,0,MARI.length-1)]/440,when)}
  function chord(b=0){[0,2,4,5].forEach((k,i)=>note(b+k,.32,i*.07))}

  /* ───── nenúfars (2D) ───── */
  function padImg(i,w,rot){const im=PADI[i],h=w*(im.naturalHeight||1)/(im.naturalWidth||1),k=2,c=document.createElement('canvas'),Rr=Math.ceil(Math.hypot(w,h));
    c.width=Rr*k;c.height=(Math.ceil(Rr*SQ)+2)*k;const g=c.getContext('2d');g.scale(k,k);g.translate(Rr/2,c.height/k/2);g.scale(1,SQ);g.rotate(rot);if(im.complete)g.drawImage(im,-w/2,-h/2,w,h);
    c.ww=Rr;c.hh=c.height/k;return c}
  function mkPad(row,x,y,w){const v=Math.random()*3|0,rot=rnd(0,6.28);return {row,x,y,w,h:w*SQ,v,rot,img:padImg(v,w,rot),bob:0,wob:0,hov:0,dw:0,inside:false,surp:null,flower:null,snail:0,glow:0,help:0}}
  function ripple(x,y,r,g=1){ripples.push({x,y,r0:r*.6,r1:r*1.6,t:0,dur:1.1,g})}
  function padBob(p){return Math.sin(now*9)*p.bob*4*K(p.y)+Math.sin(now*7)*p.wob*3}

  /* ───── flors de nenúfar (3D) ───── */
  function mkFlower(p,dl=0){if(p.flower)return p.flower;const m=cloneSkinned(PROTO.flor_nenufar),g=new THREE.Group(),pt=new THREE.Group();pt.rotation.x=PITCH;pt.add(m);g.add(pt);
    const s=p.w*.56;m.scale.setScalar(s);const x=p.x+p.w*(MODE?.34:.22)*(p.x<W/2?1:-1),y=p.y-p.h*.05;g.position.set(x,-y,zOf(y));paint(m,MAT.flor);ROOT.add(g);
    const mx=new THREE.AnimationMixer(m),a=mx.clipAction(CLIPS.flor_nenufar.obrir);a.play();a.paused=true;a.time=0;mx.update(0);
    const f={p,m,g,mx,a,t:0,dl,x,y,s};flowers.push(f);p.flower=f;return f}
  function freeFlower(f){ROOT.remove(f.g);f.mx.stopAllAction();f.m.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose()})}

  /* ───── sorpreses que volen (plans 3D amb la pintura de ChatGPT) ───── */
  function sprite(k,h){const ar={libellula:360/202,peixet:360/262}[k],m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:TEX[k],transparent:true,depthWrite:false,toneMapped:false}));
    m.scale.set(h*ar,h,1);m.renderOrder=10;ROOT.add(m);return m}
  function freeSprite(m){ROOT.remove(m);m.material.dispose();m.geometry.dispose()}

  /* ───── rondes ───── */
  function sz(){return MODE?SZ2[CFG.size]:SZ1[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function clearRound(){for(const f of frogs.slice())freeFrog(f);for(const f of flowers)freeFlower(f);for(const x of fx)if(x.m)freeSprite(x.m);if(helpFly)freeSprite(helpFly.m);
    for(const p of confetti){ROOT.remove(p.m);p.m.material.dispose();p.m.geometry.dispose()}
    pads=[];frogs=[];family=[];frog=null;flowers=[];ripples=[];fx=[];confetti=[];helpFly=null;party=-1;partyPending=false;idle=0;nextAt=0;choir=[];dir=null;song=[];phase=''}
  function newRound(){if(!ready)return;clearRound();round++;if(MODE)newSong(true);else newPond()}
  function newPond(){const s=sz(),ys=[];arrived=0;
    for(let r=0;r<s.rows;r++)ys.push(545-r*(545-278)/(s.rows-1));
    for(let r=0;r<s.rows;r++){const n=s.per[r],y0=ys[r],w0=s.pad*K(y0),x0=150+w0*.5,x1=1130-w0*.5,sp=(x1-x0)/(n-1||1),off=(r%2?.5:-.5)*sp*.35;
      for(let i=0;i<n;i++){const x=clamp(x0+i*sp+off+rnd(-.14,.14)*sp,x0,x1),y=y0+rnd(-10,10);pads.push(mkPad(r,x,y,s.pad*K(y)*rnd(.92,1.08)))}}
    queue=shuffle(COLORS.slice());for(let i=0;i<2;i++)addFamily(queue.pop(),null);layoutFamily(true);nextAt=now+.6}

  /* família a la riba del fons */
  function famH(){return (sz().pad*.55+30)*K(176)*1.05}
  function addFamily(c,f){if(!f)f=mkFrog(c,640,176,famH(),0);f.yawT=0;f.at=-2;family.push(f);return f}
  function layoutFamily(snap){const n=family.length,sp=80;family.forEach((f,i)=>{f.tx=640+(i-(n-1)/2)*sp;f.ty=176+(i%2)*8;if(snap){f.x=f.tx;f.y=f.ty}})}
  function bankBox(){const n=family.length;return{x0:640-n*40-95,x1:640+n*40+95,y0:100,y1:222}}
  function spawnFrog(){if(!queue.length)queue=shuffle(COLORS.filter(c=>!family.some(f=>f.c===c)));
    const c=queue.pop(),s=sz();frog=mkFrog(c,640,692,(s.pad*.55+30)*K(692),Math.PI);frog.grow=0;frog.g.scale.setScalar(.001);
    idle=0;assignSurprises();setTimeout(()=>{if(frog&&frog.c===c)croak(frog,1.05,.45)},350)}
  function assignSurprises(){const s=sz();pads.forEach(p=>{if(p.surp&&!p.surp.done)p.surp=null});
    const free=shuffle(pads.filter(p=>!p.surp&&!p.flower&&!p.snail)),types=shuffle(['flor','libellula','peixet','cargol']);
    for(let i=0;i<s.surp&&i<free.length;i++)free[i].surp={t:types[i%4],done:false}}

  /* ───── camí: què es pot triar ───── */
  function frogPad(){return frog&&frog.at>=0?pads[frog.at]:null}
  function reachable(){const s=sz();if(!frog||frog.jump||frog.grow<1||party!==-1||partyPending)return[];const cur=frogPad(),row=cur?cur.row:-1,cx=frog.x,out=[];
    if(row===s.rows-1)return['bank'];
    pads.filter(p=>p.row===row+1).sort((a,b)=>Math.abs(a.x-cx)-Math.abs(b.x-cx)).slice(0,s.k).forEach(p=>out.push(p));
    if(s.side&&cur){const same=pads.filter(p=>p.row===row&&p!==cur).sort((a,b)=>Math.abs(a.x-cx)-Math.abs(b.x-cx));if(same[0]&&Math.abs(same[0].x-cx)<380)out.push(same[0])}
    return out}
  function hitPad(x,y){let best=null,bd=1e9;for(const p of pads){const dx=(x-p.x)/(p.w*.62),dy=(y-p.y)/(p.h*.62+22);const d=dx*dx+dy*dy;if(d<1&&d<bd){bd=d;best=p}}return best}
  function hit1(x,y){const b=bankBox();if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1)return 'bank';return hitPad(x,y)}
  function bestHelp(){const r=reachable();if(!r.length)return null;if(r[0]==='bank')return 'bank';const cur=frogPad(),row=cur?cur.row:-1;
    return r.filter(p=>p.row>row).sort((a,b)=>Math.abs(a.x-640)-Math.abs(b.x-640))[0]||r[0]}
  function act1(t){if(!t||party!==-1)return;const r=reachable();idle=0;
    if(t==='bank'){if(r[0]==='bank')jumpTo('bank');else familyWave();return}
    if(r.includes(t))jumpTo(t);else{t.wob=1;play('e_plop',.12,1.5)}}
  function familyWave(){let any=false;family.forEach((f,i)=>{if(f.cd<=0&&!f.jump){f.cd=1.8;any=true;setTimeout(()=>{if(family.includes(f))clip(f,'botet',false,.08)},i*120)}});
    if(any){const f=pick(family);play('e_rauc',.35,.9+Math.random()*.2,.1)}}
  function jumpTo(t){const f=frog;let to;
    if(t==='bank'){to={x:640+family.length*40,y:182}}else to={x:t.x,y:t.y-t.h*.06};
    const d=Math.hypot(to.x-f.x,to.y-f.y);f.yawT=Math.atan2(to.x-f.x,to.y-f.y);
    f.jump={t:-.25,from:{x:f.x,y:f.y},to,hgt:60+d*.3,target:t,h0:f.h};idle=0;jumps++;STATS.n++;$('#oN').textContent=STATS.n;
    if(helpFly)helpFly.leave=1;clip(f,'preparar',false,.06,'_hold')}
  function land(){const f=frog,t=f.jump.target;f.jump=null;
    if(t==='bank'){f.at=-2;addFamily(f.c,f);frog=null;layoutFamily(false);clip(f,'aterrar',false,.05);
      setTimeout(()=>{if(family.includes(f)){croak(f,1,.55)}},450);play('e_plop',.35,.8);arrived++;STATS.n++;$('#oN').textContent=STATS.n;
      setTimeout(()=>{family.forEach(q=>{if(q!==f)clip(q,'botet',false,.08)});chord(1)},900);
      if(arrived%3===0){partyPending=true;nextAt=now+2}else nextAt=now+2.1;return}
    f.at=pads.indexOf(t);f.x=t.x;f.y=t.y-t.h*.06;t.bob=1;ripple(t.x,t.y,t.w*.6);play('e_plop',.6,rnd(.92,1.08));clip(f,'aterrar',false,.05);
    if(t.surp&&!t.surp.done)setTimeout(()=>surprise(t),260)}
  function surprise(p){const s=p.surp;if(!s||s.done)return;s.done=true;
    if(s.t==='flor'){const fl=mkFlower(p);fl.dl=0;[0,2,4].forEach((n,i)=>note(n+2,.3,i*.09))}
    if(s.t==='libellula'){const m=sprite('libellula',110),d=p.x<W/2?1:-1;fx.push({k:'lib',m,x:p.x,y:p.y-p.h-40,t:0,dir:d,dur:3.2});play('e_libel',.6);for(let i=0;i<5;i++)note(7-i%3,.12,i*.06)}
    if(s.t==='peixet'){const d=p.x<W/2?1:-1,k=K(p.y),m=sprite('peixet',105*k);m.visible=false;fx.push({k:'fish',m,x0:p.x+d*p.w*.7,y0:p.y+8,x1:p.x+d*(p.w*.7+190*k),t:0,s:k,dur:1.5});play('e_peix',.6)}
    if(s.t==='cargol'){p.snail=.001;note(3,.3);note(5,.3,.12)}}
  function startParty(){party=0;partyPending=false;play('e_festa',.8);pads.forEach((p,i)=>{const f=mkFlower(p);if(f.t<=0)f.dl=.15+i*.1});
    family.forEach((f,i)=>{f.yawT=0;setTimeout(()=>{if(family.includes(f))clip(f,'ball',true,.12)},i*150)});if(frog)clip(frog,'ball',true,.12);spins(family.concat(frog?[frog]:[]));
    confettiOn()}
  /* girs de festa: cada granota fa un gir sobre si mateixa, desincronitzades i unes cap a cada costat */
  function spins(L){const sp=spinPlan(L.length,.8,.5);L.forEach((f,i)=>f.sp=sp[i])}
  function confettiOn(){for(let i=0;i<40;i++){const c=COLORS[i%6],m=new THREE.Mesh(new THREE.PlaneGeometry(14,21),new THREE.MeshBasicMaterial({map:petalTex,color:HEX[c],transparent:true,depthTest:false,opacity:0,toneMapped:false}));
      m.renderOrder=20;m.position.z=3000;ROOT.add(m);confetti.push({m,x:rnd(0,W),y:rnd(-H*.9,-10),vy:rnd(45,80),ph:rnd(0,6),r:rnd(0,6),vr:rnd(-1.5,1.5)})}}

  /* ───── cançó ───── */
  function newSong(fresh){const s=sz(),n=s.n;songs++;
    if(fresh||!choir.length){
      const cols=shuffle(COLORS.filter(c=>c!=='lila')).slice(0,n),xs=n===2?[420,860]:n===3?[300,640,980]:[230,500,780,1050];
      pads.push(mkPad(-1,640,322,170*K(322)));
      dir=mkFrog('lila',640,322-170*K(322)*SQ*.06,150*K(322),0);hat(dir);dir.at=-3;dir.grow=0;dir.g.scale.setScalar(.001);
      choir=cols.map((c,i)=>{const y=530+(n===4?(i%2?18:-6):0)+rnd(-6,6),w=s.pad*K(y),p=mkPad(0,xs[i]+rnd(-12,12),y,w);pads.push(p);
        const f=mkFrog(c,p.x,p.y-p.h*.06,(s.pad*.6+30)*K(y),0);f.pad=p;f.note=CHOIR[n][i];f.rate=.82+i*.12;f.at=pads.length-1;f.grow=-.15*i-.2;f.g.scale.setScalar(.001);return f})}
    else{choir.forEach(f=>clip(f,'repos',true,.15));clip(dir,'repos',true,.15)}
    song=[];L=1;prog=0;addNote();phase='intro';phT=fresh?1.6:1.1;idle=0}
  function addNote(){let i;do{i=Math.random()*choir.length|0}while(song.length>=2&&song[song.length-1]===i&&song[song.length-2]===i||choir.length>1&&song.length&&song[song.length-1]===i&&Math.random()<.5);song.push(i)}
  function sing(f,g=.55){croak(f,f.rate,g*.9);note(f.note,g*.85,.04);f.glow=1;f.pad.bob=.8;ripple(f.pad.x,f.pad.y,f.pad.w*.55,.8)}
  function demo(){phase='demo';demoI=-1;phT=.9;prog=0;idle=0;helped=false;croak(dir,.78,.4,true);dir.yawT=0}
  function hit2(x,y){for(const f of choir){const p=f.pad,dx=(x-p.x)/(p.w*.6),dy=(y-p.y)/(p.h*.6+24);if(dx*dx+dy*dy<1)return f;
      if(Math.abs(x-f.x)<f.h*.5&&y<f.y&&y>f.y-f.h*1.05)return f}return null}
  function act2(f){if(!f||phase!=='turn')return;idle=0;STATS.n++;$('#oN').textContent=STATS.n;
    const want=choir[song[prog]];
    if(f===want){sing(f);prog++;lastDone=now;helped=false;idle=0;
      if(prog>=song.length){phase='good';phT=1.3;setTimeout(()=>{if(phase!=='good')return;chord(2);choir.forEach((q,i)=>setTimeout(()=>{if(choir.includes(q))clip(q,'botet',false,.08)},i*90));clip(dir,'botet',false,.08)},420)}}
    else{f.pad.wob=1;clip(f,'aterrar',false,.06);phase='oops';phT=1.1}}            // sense so d'error: es gronxa i la directora la torna a cantar
  function help2(){const f=choir[song[prog]];if(!f)return;f.help=2.2;f.pad.wob=.5}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready){return}if(!pads.length){if(on)newRound();return}if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,a=dt*kk,free=!optsOpen&&view==='scene';now+=a;
    const [wx,wy]=toWorld(cmx,cmy),has=free&&cmx>-999;
    if(has){if(!G.seen){G.x=wx;G.y=wy;G.seen=true}const q=1-Math.exp(-dt/.12);G.x+=(wx-G.x)*q;G.y+=(wy-G.y)*q}else G.seen=false;
    ringP=0;
    if(MODE)step2(a,dt,has,wx,wy);else step1(a,dt,has,wx,wy);
    /* granotes: animació, gir, mida i ulls que segueixen la mirada */
    for(const f of frogs){f.ct+=a;f.cd-=a;
      if(f.next&&f.cur&&f.ct>=f.cur.getClip().duration-.02){const n=f.next;f.next=null;if(n!=='_hold')clip(f,n,n==='repos'||n==='ball',.12)}
      if(f.grow<1){f.grow+=a/.5;const e=f.grow<=0?.001:eBack(clamp(f.grow,0,1));f.g.scale.setScalar(Math.max(.001,e))}
      let da=f.yawT-f.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));f.yaw+=da*Math.min(1,a*(f.jump?14:5));const fsp=party>=0?spinA(f.sp,party):0;if(party<0)f.sp=null;f.yw.rotation.y=f.yaw+fsp;
      f.mx.update(a);
      /* ulls: es queden quiets i només canvien de direcció quan la mirada es mou prou (com una sacada), i hi van suaument;
         així el tremolor del lector ocular no fa tremolar els ulls */
      {const fy=f.yaw+fsp,fr=Math.abs(Math.atan2(Math.sin(fy),Math.cos(fy)))<1.2;let rx=0,ry=0;
        if(fr&&G.seen){rx=clamp((G.x-f.x)/700,-.3,.3);ry=clamp((G.y-(f.y-f.h))/900,-.25,.25)}
        if(Math.hypot(rx-f.etx,ry-f.ety)>.1||!fr||!G.seen){f.etx=rx;f.ety=ry}
        const q=1-Math.exp(-a/.12);f.ex+=(f.etx-f.ex)*q;f.ey+=(f.ety-f.ey)*q;if(Math.abs(f.etx-f.ex)<.002)f.ex=f.etx;if(Math.abs(f.ety-f.ey)<.002)f.ey=f.ety;
        EU.set(f.ey,f.ex,0,'YXZ');f.ullE.quaternion.setFromEuler(EU);f.ullD.quaternion.setFromEuler(EU)}   // valor absolut: el mixer no reescriu una pista constant, i sumar-hi acumulava el gir
      f.glow=Math.max(0,f.glow-a*1.4);f.help=Math.max(0,f.help-a);
      const p=f.at>=0?pads[f.at]:null,by=p&&!f.jump?padBob(p):0,hs=1+.05*f.hov;
      f.g.position.set(f.x,-(f.y+by-f.lift),zOf(f.y+(f.jump?30:0)));if(f.grow>=1)f.g.scale.setScalar(hs);f.m.scale.setScalar(f.h)}
    /* nenúfars, flors, ones, sorpreses */
    for(const p of pads){p.bob=Math.max(0,p.bob-a*1.4);p.wob=Math.max(0,p.wob-a*1.2);p.glow+=((p.reach?1:0)-p.glow)*Math.min(1,a*5);p.help=Math.max(0,p.help-a);if(p.snail&&p.snail<1)p.snail=Math.min(1,p.snail+a/.8)}
    for(const f of flowers){if(f.dl>0){f.dl-=a;continue}if(f.t<1){f.t=Math.min(1,f.t+a/1.3);f.a.time=f.t*f.a.getClip().duration*.9999;f.mx.update(0)}
      const by=padBob(f.p);f.g.position.y=-(f.y+by);f.g.scale.setScalar(.55+.45*eOut(Math.min(1,f.t*1.6)))}
    for(const r of ripples)r.t+=a/r.dur;ripples=ripples.filter(r=>r.t<1);
    fx=fx.filter(x=>{x.t+=a;
      if(x.k==='lib'){const u=x.t/x.dur,X=x.x+x.dir*u*700,Y=x.y-Math.sin(u*Math.PI*.8)*240-u*110+Math.sin(x.t*6)*6;x.m.position.set(X,-Y,3500);x.m.scale.x=Math.abs(x.m.scale.x)*-x.dir;
        x.m.material.opacity=Math.min(1,x.t*3,(x.dur-x.t)*2);x.m.scale.y=110*(1+.05*Math.sin(x.t*40))}
      if(x.k==='fish'){const u=clamp((x.t-.05)/1.05,0,1),d=Math.sign(x.x1-x.x0);x.m.visible=u>0&&u<1;x.m.position.set(x.x0+(x.x1-x.x0)*u,-(x.y0-Math.sin(u*Math.PI)*150*x.s),3500);
        x.m.rotation.z=-(u-.5)*1.6*d;x.m.scale.x=Math.abs(x.m.scale.x)*d;
        if(!x.sp&&x.t>.05){x.sp=1;ripple(x.x0,x.y0,40*x.s)}if(!x.sp2&&x.t>1.1){x.sp2=1;ripple(x.x1,x.y0,50*x.s)}}
      if(x.t>=x.dur){freeSprite(x.m);return false}return true});
    if(party>=0){party+=a;for(const p of confetti){p.y+=p.vy*a;p.x+=Math.sin(now*1.5+p.ph)*20*a;p.r+=p.vr*a;p.m.position.set(p.x,-p.y,3000);p.m.rotation.z=p.r;
        p.m.material.opacity=Math.min(1,p.m.material.opacity+dt*1.5)*(party>FEST-1?Math.max(0,FEST-party):1)}
      if(party>=FEST)newRound()}}

  function step1(a,dt,has,wx,wy){const r=reachable(),tg=has?hit1(wx,wy):null,dwell=CFG.mode===1;
    for(const p of pads){const onP=tg===p,rd=r.includes(p);p.reach=rd;
      if(onP&&!p.inside&&!rd&&party===-1)p.wob=Math.max(p.wob,.5);
      if(CFG.mode===0){if(onP&&!p.inside&&rd)act1(p)}
      else if(dwell){if(onP&&rd){p.dw+=dt;ringP=clamp(p.dw/CFG.dwell,0,1);if(p.dw>=CFG.dwell){p.dw=0;act1(p)}}else p.dw=0}
      p.inside=onP;p.hov+=((onP&&rd?1:0)-p.hov)*Math.min(1,dt*8)}
    /* riba del fons: si toca, hi salta; si no, la família saluda */
    const onB=tg==='bank',rdB=r[0]==='bank';
    if(onB&&rdB){if(CFG.mode===0&&!bankIn)act1('bank');else if(dwell){bankHov+=dt;ringP=clamp(bankHov/CFG.dwell,0,1);if(bankHov>=CFG.dwell){bankHov=0;act1('bank')}}}
    else if(onB&&party===-1){bankHov+=dt;if(bankHov>(CFG.mode===1?CFG.dwell:.5)){bankHov=-1.5;familyWave()}}else bankHov=0;
    bankIn=onB;
    /* nova granota, festa */
    if(!frog&&party===-1&&nextAt&&now>=nextAt){nextAt=0;if(partyPending)startParty();else spawnFrog()}
    const f=frog;
    if(f&&!f.jump&&party===-1&&f.grow>=1){idle+=a;if(f.ct>.3)f.yawT=Math.PI}
    if(f&&f.jump){const j=f.jump;j.t+=a;
      if(j.t>=0&&!j.go){j.go=1;clip(f,'salt',false,0,'_hold');play('e_salt',.45,rnd(.95,1.08));if(f.at>=0)pads[f.at].bob=.7;f.at=-1}
      if(j.go){const u=clamp((j.t-1/24)/(16/24),0,1),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;f.x=j.from.x+(j.to.x-j.from.x)*e;f.y=j.from.y+(j.to.y-j.from.y)*e;
        f.lift=Math.sin(Math.PI*u)*j.hgt*(K(f.y)*.6+.4);f.h=j.target==='bank'?j.h0+(famH()-j.h0)*e:(sz().pad*.55+30)*K(f.y);
        if(j.t>=.708){f.lift=0;land()}}}
    /* ajuda: als 6 s el nenúfar bo brilla més; als 12 s arriba la libèl·lula i s'hi posa a sobre */
    const bh=idle>HELP?bestHelp():null;for(const p of pads)p.strong=p===bh;
    if(f&&!f.jump&&idle>HELP*2&&!helpFly&&bh){const m=sprite('libellula',80);helpFly={m,t:0,leave:0,target:bh,x:bh==='bank'?1320:bh.x+320,y:bh==='bank'?60:bh.y-280};play('e_libel',.45)}
    if(helpFly){const h=helpFly;h.t+=a;
      if(h.leave){h.leave+=a;h.x+=280*a;h.y-=170*a;if(h.leave>3){freeSprite(h.m);helpFly=null}}
      else{const tg2=h.target==='bank'?{x:640,y:105}:{x:h.target.x,y:h.target.y-h.target.h-28*K(h.target.y)};h.x+=(tg2.x-h.x)*Math.min(1,a*1.6);h.y+=(tg2.y+Math.sin(h.t*2.2)*8-h.y)*Math.min(1,a*1.6)}
      if(helpFly){h.m.position.set(h.x,-h.y,3500);h.m.scale.x=-Math.abs(h.m.scale.x);h.m.scale.y=80*(1+.05*Math.sin(h.t*40))}}
    /* la família s'acomoda a la riba */
    for(const m of family){if(m.jump)continue;m.x+=(m.tx-m.x)*Math.min(1,a*3);m.y+=(m.ty-m.y)*Math.min(1,a*3);m.yawT=0}}

  function step2(a,dt,has,wx,wy){const tg=has&&phase==='turn'?hit2(wx,wy):null;
    for(const f of choir){const onF=tg===f,rd=phase==='turn';
      if(CFG.mode===0){if(onF&&!f.inside&&rd)act2(f)}
      else if(CFG.mode===1){if(onF&&rd){f.dw+=dt;ringP=clamp(f.dw/CFG.dwell,0,1);if(f.dw>=CFG.dwell){f.dw=0;act2(f)}}else f.dw=0}
      f.inside=onF;f.hov+=((onF&&rd?1:0)-f.hov)*Math.min(1,dt*8);f.pad.reach=rd;f.pad.strong=f.help>0}
    if(party!==-1)return;
    phT-=a;
    if(phase==='intro'&&phT<=0)demo();
    else if(phase==='demo'&&phT<=0){demoI++;if(demoI<song.length){const f=choir[song[demoI]];dir.yawT=Math.atan2(f.x-dir.x,f.y-dir.y)*.8;sing(f,.5);phT=song.length>3?.78:.92}
      else{phase='turn';dir.yawT=0;idle=0;phT=0}}
    else if(phase==='turn'){idle+=a;if(idle>HELP&&!helped){helped=true;help2()}if(idle>HELP*2.2){demo()}}
    else if(phase==='good'&&phT<=0){if(song.length>=sz().max){party=0;play('e_festa',.8);pads.forEach((p,i)=>{const f=mkFlower(p);f.dl=.1+i*.15});
        choir.forEach((f,i)=>setTimeout(()=>{if(choir.includes(f))clip(f,'ball',true,.12)},i*140));clip(dir,'ball',true,.12);spins(choir.concat([dir]));confettiOn()}
      else{addNote();phase='intro';phT=.5}}
    else if(phase==='oops'&&phT<=0)demo()}

  /* ───── dibuix: fons i nenúfars en 2D, la resta en 3D a sobre ───── */
  function drawPad(c,p){const by=padBob(p),R2=p.reach&&party===-1;
    c.save();c.translate(p.x,p.y+by);
    c.fillStyle='rgba(20,70,70,.18)';c.beginPath();c.ellipse(4,6,p.w*.5,p.h*.5,0,0,7);c.fill();
    if(R2&&p.glow>.02){const pu=.5+.5*Math.sin(now*3),s=p.strong?1:0;c.fillStyle=`rgba(255,250,210,${(.22+.16*pu+.3*s)*p.glow})`;c.beginPath();c.ellipse(0,0,p.w*.62+6*pu+9*s,p.h*.62+4*pu+6*s,0,0,7);c.fill()}
    if(p.wob>0)c.rotate(Math.sin(now*14)*p.wob*.03);
    if(!p.img.ok&&PADI[p.v].complete){p.img=padImg(p.v,p.w,p.rot);p.img.ok=1}
    c.drawImage(p.img,-p.img.ww/2,-p.img.hh/2,p.img.ww,p.img.hh);
    c.restore()}
  function drawSnail(c,p){if(!p.snail||!SNAIL.complete)return;const k=K(p.y),h=254*.32*k,w=h*360/254,u=eOut(p.snail),x=p.x-p.w*.28*(p.x<W/2?-1:1),y=p.y+p.h*.12+padBob(p);
    c.save();c.translate(x,y);c.scale(p.x<W/2?1:-1,1);c.globalAlpha=u;c.drawImage(SNAIL,-w/2,-h*(.3+.7*u),w,h*(.3+.7*u)+Math.sin(now*2)*1.5);c.restore()}
  function shadow(c,f){if(f.grow<=0)return;const p=f.at>=0?pads[f.at]:null,by=p&&!f.jump?padBob(p):0,w=f.h*.8*(1-Math.min(.5,f.lift/300))*Math.min(1,f.grow);
    c.fillStyle='rgba(10,50,45,.25)';c.beginPath();c.ellipse(f.x,f.y+by+f.h*.02,w*.5,w*.16,0,0,7);c.fill()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    if(!R||!ready)return;
    for(const r of ripples){const rr=r.r0+(r.r1-r.r0)*r.t;c.strokeStyle=`rgba(255,255,255,${.5*(1-r.t)*r.g})`;c.lineWidth=2.5;c.beginPath();c.ellipse(r.x,r.y,rr,rr*SQ,0,0,7);c.stroke()}
    if(!MODE&&party===-1&&reachable()[0]==='bank'){const b=bankBox(),pu=.5+.5*Math.sin(now*3),s=idle>HELP?1:0;c.fillStyle=`rgba(255,250,210,${.16+.14*pu+.2*s})`;c.beginPath();c.ellipse((b.x0+b.x1)/2,184,(b.x1-b.x0)/2,46,0,0,7);c.fill()}
    const sorted=pads.slice().sort((p,q)=>p.y-q.y);for(const p of sorted)drawPad(c,p);for(const p of sorted)drawSnail(c,p);
    if(MODE&&dir){/* notes de la cançó: un punt per nota, s'omplen a mesura que l'infant les encerta */
      const n=song.length,sp=34,x0=dir.x-(n-1)*sp/2,y=dir.y-dir.h*1.55;
      for(let i=0;i<n;i++){const done=phase==='turn'||phase==='good'?i<prog:phase==='demo'?i<=demoI:false,f=choir[song[i]];
        c.beginPath();c.arc(x0+i*sp,y,11,0,7);c.fillStyle=done?'#'+HEX[f.c].toString(16).padStart(6,'0'):'rgba(255,255,255,.55)';c.fill();c.lineWidth=3;c.strokeStyle='rgba(30,70,60,.55)';c.stroke()}}
    for(const f of frogs)shadow(c,f);
    for(const f of choir)if(f.glow>0||f.help>0){const p=f.pad,g=Math.max(f.glow,f.help>0?.6+.4*Math.sin(now*6):0);c.fillStyle=`rgba(255,240,170,${.45*g})`;c.beginPath();c.ellipse(p.x,p.y+padBob(p),p.w*.66,p.h*.68,0,0,7);c.fill()}
    R.render(S3,cam)}
  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy);if(MODE)act2(hit2(wx,wy));else act1(hit1(wx,wy))}
  function layout(){if(!ready)return;newRound()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newRound()}
  function tray(){const t=$('#tray');t.innerHTML='';['estany.m1','estany.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;if(cvs)cvs.style.display='none';if(R)clearRound()}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,reachable,act1,act2,hit1,hit2,
    get ready(){return ready},get mode(){return MODE},get party(){return party},get arrived(){return arrived},get round(){return round},get jumps(){return jumps},
    get pads(){return pads},get frog(){return frog},get family(){return family},get frogs(){return frogs},get choir(){return choir},get song(){return song},get prog(){return prog},
    get phase(){return phase},get songs(){return songs},get idle(){return idle},get helpFly(){return helpFly},get flowers(){return flowers},scr,get R(){return R}};
})();
