/* =========================================================
   ESCENARI: L'HORT MÀGIC
   Hortalisses, eines i la talpa Tina de ganxet (amigurumi) en 3D real (three.js; models fets amb Blender a partir dels
   concepts de ChatGPT de Marc). Fons pintat amb llapis de colors en 2D (canvas del fons); tot el que es mou, en 3D a sobre.
   Cada bancal passa per quatre passos: llavors → regar → sol → collir. L'hortalissa madura surt, saluda i salta a la cistella.
   «L'hort de la Tina» (guiat): només cal mirar el bancal; l'eina que toca hi vola sola.
   «Petits jardiners»: es mira una eina de la barra (llavors, regadora, sol, cistella, segons la mida), l'eina segueix la
     mirada i després es mira el bancal. Si no toca, el bancal es gronxa i l'eina torna a lloc (sense so d'error).
     Les eines que no són a la barra hi van soles.
   Quan tot és collit, «El nap gegant»: la Tina i les hortalisses l'estiren 3/4/5 vegades amb la mirada; surt, i festa.
   Ajuda: als 6 s brilla el que toca; als 12 s la Tina treu el cap d'un forat al costat i ho assenyala.
   Càmera ortogràfica fixa, inclinada 12° (cap zoom ni moviment de càmera). Sense veus.
   ========================================================= */
const HORT=(()=>{
  const TX={ca:["L'hort de la Tina",'Petits jardiners'],es:['El huerto de Tina','Pequeños jardineros'],eu:['Tinaren baratzea','Baratzezain txikiak'],
    gl:['A horta da Tina','Pequenos xardineiros'],en:["Tina's garden",'Little gardeners'],fr:['Le potager de Tina','Petits jardiniers']};
  for(const l in TX)if(I18N[l]){I18N[l]['hort.m1']=TX[l][0];I18N[l]['hort.m2']=TX[l][1]}
  const VEG=['pastanaga','tomaquet','carbassa','pesol','rave','maduixa'];
  /* mides (gran, mitjana, petita): bancals [x, y de la base, amplada], eines de la barra al mode 2, estirades del nap */
  const SIZES=[
    {beds:[[330,505,270],[640,505,270],[950,505,270]],tools:['llavors','regadora'],pulls:3},
    {beds:[[460,385,200],[820,385,200],[290,560,225],[640,560,225],[990,560,225]],tools:['llavors','regadora','cistella'],pulls:4},
    {beds:[[250,370,155],[505,370,155],[765,370,155],[1025,370,155],[185,552,175],[465,552,175],[760,552,175],[1050,552,175]],tools:['llavors','regadora','sol','cistella'],pulls:5}];
  const NEED=['llavors','regadora','sol','cistella'];
  /* eines: model, escala, distància en px del centre a l'origen del model */
  const TOOL={llavors:{m:'sac',sc:.6,dy:34},regadora:{m:'regadora',sc:.6,dy:43},sol:{m:'sol',sc:.6,dy:0},cistella:{m:'cistella',sc:.72,dy:52}};
  const ACT={llavors:1.25,regadora:1.7,sol:1.85},IN=.55,OUT=.5,HELP=6,TOOLC=652,BASKX=1150,SKY={x:1240,y:-70};
  const P=100,PIT=12*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),FRONT=790;
  const BAN_H=.62,banZ=r=>BAN_H*Math.pow(Math.max(0,1-Math.pow(Math.min(1,Math.abs(r)/.75),2.25)),1/2.25);
  /* dades dels models (hort_models.json, eixos de three): alçada, enterrat, punt de penjar, escala sobre la planta */
  const VM={pastanaga:{top:1.93,radi:.495,ent:.62},rave:{top:1.62,radi:.54,ent:.34},tomaquet:{top:1.17,penja:[.02,1.17,0]},carbassa:{top:1.27},
    pesol:{top:1.82,penja:[-.035,1.58,0]},maduixa:{top:1.31,penja:[.015,1.31,0]}};
  const PM={tomaquet:{penja:[-.4,1.38,.28],e:.7,top:2.09},maduixa:{penja:[.6,1.24,.26],e:.62,top:1.95},pesol:{penja:[.52,1.8,.26],e:.62,top:2.34},carbassa:{seu:[0,.52,0],e:.8,top:.71}};
  const HOLE=new THREE.Vector3(0,.583,.301);
  const NOTE={pastanaga:1,tomaquet:1.122,carbassa:.84,pesol:1.335,rave:1.189,maduixa:1.498};     // cada hortalissa saluda amb la seva nota
  const PILE=[[-.28,.34,-.12],[.28,.36,-.1],[0,.4,-.24],[-.14,.48,.1],[.2,.5,.06],[-.38,.54,.12],[.4,.55,-.02],[0,.64,0]];
  const LOOPS=new Set(['repos','ballar','vent','guaitar','brillar']);
  const MODELS=['bancal','forat','vora','llavor','brot','planta_jove','pastanaga','rave','tomaquet','carbassa','pesol','maduixa',
    'planta_tomaquet','planta_maduixa','planta_pesol','planta_carbassa','nap','talpa','sac','regadora','sol','cistella'];
  let R=null,S3,cam,cvs=null,on=false,ready=false,lq=null,MODE=0,NL=0,ENV=null,TC=null,TN=null,amb,sun,ROOT;
  const PROTO={},CLIPS={},OFF={},MAT={},fons=img('hort/fons.webp');
  let beds=[],INST=[],anims=[],parts=[],outs=[],wait=[],slots={},held=null,heldT=0,idle=0,mole=null,fin=null,pile=[],nextAt=0,round=0,now=0,acts=0,harvests=0,finales=0;
  let cur=null,dw=0,SPH=null,DISC=null,STAR=null,PETAL=null,M_DROP=null,M_SOIL=null,M_HOLE=null;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lerp=(a,b,t)=>a+(b-a)*t;

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3h';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    R.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),0)];      // res es veu sota terra: cua del rave, nap enterrat, talpa al forat
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.45);sun=new THREE.DirectionalLight(0xffffff,1.5);sun.position.set(-3,5,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    const TL=new THREE.TextureLoader(),tx=(p,srgb)=>{const t=TL.load(U(p));t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t};
    TC=tx('hort/ganxet_color.webp',true);TN=tx('hort/ganxet_normal.webp',false);
    const ct=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
    STAR=ct(64,64,(g,w)=>{const r=g.createRadialGradient(32,32,0,32,32,30);r.addColorStop(0,'rgba(255,255,240,1)');r.addColorStop(.25,'rgba(255,240,150,.9)');r.addColorStop(1,'rgba(255,220,80,0)');
      g.fillStyle=r;g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,q=i%2?9:31;g.lineTo(32+Math.cos(a)*q,32+Math.sin(a)*q)}g.fill()});
    PETAL=ct(32,48,g=>{g.fillStyle='#fff';g.beginPath();g.ellipse(16,24,12,22,0,0,7);g.fill()});
    SPH=new THREE.SphereGeometry(1,8,6);DISC=new THREE.CircleGeometry(1,28);DISC.rotateX(-Math.PI/2);
    M_DROP=new THREE.MeshBasicMaterial({color:0x8fd2ff,toneMapped:false});M_SOIL=new THREE.MeshBasicMaterial({color:0x9a6440});M_HOLE=new THREE.MeshBasicMaterial({color:0x3a2314});
    const L=new GLTFLoader();
    for(const k of MODELS)L.load(U('hort/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;CLIPS[k]={};for(const c of g.animations)CLIPS[k][c.name]=c;
      g.scene.traverse(n=>{if(n.isMesh)n.userData.ll=!!(n.material&&n.material.name==='llis')});
      if(++NL===MODELS.length){prep();ready=true;quality();if(on)layout()}},undefined,e=>console.error(e));
    resize()}
  /* punts de les eines en l'espai de l'os arrel (boca del sac, broc de la regadora): segueixen l'animació */
  function prep(){const off=(k,p)=>{const o=PROTO[k];o.updateMatrixWorld(true);const b=o.getObjectByName('arrel');return new THREE.Vector3(...p).applyMatrix4(b.matrixWorld.clone().invert())};
    OFF.sac=off('sac',[0,1.1,0]);OFF.regadora=off('regadora',[1.17,.99,0])}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'})}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: alta = fil amb relleu (normal map + RoomEnvironment); ràpida = Lambert sense relleu ───── */
  function quality(){if(!R||!ready)return;lq=LOWQ;for(const k in MAT)MAT[k].dispose();
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const t of [TC,TN]){t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    MAT.g=LOWQ?new THREE.MeshLambertMaterial({map:TC,vertexColors:true})
      :new THREE.MeshStandardMaterial({map:TC,vertexColors:true,normalMap:TN,normalScale:new THREE.Vector2(.7,-.7),roughness:.93,metalness:0,envMap:ENV,envMapIntensity:.6});
    MAT.l=LOWQ?new THREE.MeshPhongMaterial({vertexColors:true,shininess:90,specular:0x666666})
      :new THREE.MeshStandardMaterial({vertexColors:true,roughness:.14,metalness:0,envMap:ENV,envMapIntensity:1});
    if(LOWQ){amb.intensity=1.25;sun.intensity=1.9}else{amb.intensity=.45;sun.intensity=1.5}
    for(const b of beds){if(b.mat)b.mat.dispose();b.mat=MAT.g.clone();wetCol(b)}
    for(const x of INST)paint(x)}
  function paint(x){const gm=x.gm?x.gm():MAT.g;x.o.traverse(n=>{if(n.isMesh){n.material=n.userData.ll?MAT.l:gm;n.frustumCulled=false}})}
  function wetCol(b){const w=b.wet;b.mat.color.setRGB(1-.38*w,1-.42*w,1-.44*w)}

  /* còpia d'un model amb esquelet (el paquet de three no porta SkeletonUtils) */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  function inst(k,parent,gm){const o=cloneSkinned(PROTO[k]),w=new THREE.Group();w.add(o);(parent||ROOT).add(w);
    const x={k,w,o,gm:gm||null,mx:null,A:{},cur:null,next:null,ct:0,root:o.getObjectByName('arrel')};
    const cl=CLIPS[k];if(cl&&Object.keys(cl).length){x.mx=new THREE.AnimationMixer(o);for(const n in cl)x.A[n]=x.mx.clipAction(cl[n])}
    paint(x);INST.push(x);return x}
  function free(x){if(!x)return;x.w.removeFromParent();if(x.mx)x.mx.stopAllAction();x.o.traverse(n=>{if(n.isSkinnedMesh)n.skeleton.dispose()});const i=INST.indexOf(x);if(i>=0)INST.splice(i,1)}
  function clip(x,n,loop,fd=.12,then,ts=1){if(!x||!x.A[n])return;const a=x.A[n],p=x.cur;a.reset();a.timeScale=ts;a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);
    a.clampWhenFinished=!loop;a.setEffectiveWeight(1);a.play();if(p&&p!==a){if(fd>0)p.crossFadeTo(a,fd,false);else p.stop()}
    x.cur=a;x.ct=0;x.next=loop?null:(then!==undefined?then:(x.A.repos?'repos':null))}
  function rest(x,fd=.35){if(x&&x.cur){x.cur.fadeOut(fd);x.cur=null;x.next=null}}      // torna a la postura de repòs
  function later(t,f){wait.push({t:now+t,f})}
  function shrink(x,d=.35){if(x)outs.push({x,t:0,d,s0:x.w.scale.clone()})}

  /* pantalla (px) ↔ món: l'objecte es posa de manera que el seu origen es vegi a (px, py); «by» és la y de pantalla del
     terra que hi ha a sota (fa d'ordre de profunditat). Tot el que vola va a FRONT, davant de tot. */
  const gpos=(px,py)=>new THREE.Vector3((px-640)/P,0,(py-360)/(P*SP));
  function place(o,px,py,by){o.position.set((px-640)/P,(by-py)/(CP*P),(by-360)/(P*SP))}
  function proj(v){return [640+v.x*P,360+v.z*SP*P-v.y*CP*P]}
  const WV=new THREE.Vector3();
  function tipOf(x){x.w.updateMatrixWorld(true);return proj(WV.copy(OFF[x.k]).applyMatrix4(x.root.matrixWorld))}

  /* ───── bancals ───── */
  function sz(){return SIZES[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function need(b){return NEED[b.st]}
  function isAuto(t){return MODE===1&&!sz().tools.includes(t)}
  function mkBed(i,x,y,w,veg){const s=w/(1.5*P),g=new THREE.Group();g.position.copy(gpos(x,y));g.scale.setScalar(.001);ROOT.add(g);
    const b={i,x,y,w,s,g,veg,st:0,busy:0,wet:0,dry:0,shake:0,wob:0,hov:0,inside:false,app:-.15-i*.09,ready:false,leave:0,giggle:0,mat:MAT.g.clone(),
      hole:null,holeS:0,sprout:null,young:null,plant:null,vv:null,vora:null,ripeT:-1,hv:null};
    b.mound=inst('bancal',g,()=>b.mat);return b}
  function topU(b){if(b.st>=4)return BAN_H;if(b.vv&&b.st>=2&&b.ripeT>=0){const p=PM[b.veg];return p?p.top:ripeY(b)+VM[b.veg].top*.75}
    if(b.young)return HOLE.y+.95;if(b.sprout)return HOLE.y+.5;return BAN_H}
  const topPx=b=>topU(b)*b.s*P*CP;
  function ripeY(b){const m=VM[b.veg];return banZ(m.radi*.75)-m.ent*.75}
  function bedBox(b){const h=topPx(b);return{x0:b.x-b.w*.58,x1:b.x+b.w*.58,y0:b.y-h-12,y1:b.y+b.w*.1+8}}
  function makeHole(b){const h=inst('forat',b.g);h.w.position.copy(HOLE);h.o.position.copy(HOLE).negate();h.w.scale.setScalar(.001);b.hole=h;b.holeS=0;b.holeTo=1}
  function sprout(b){b.holeTo=0;const x=inst('brot',b.g);x.w.position.set(HOLE.x,HOLE.y-.03,HOLE.z);clip(x,'brotar',false,0,'vent');b.sprout=x;b.st=2;play('h_brot',.7,rnd(.95,1.05))}
  function young(b){shrink(b.sprout,.3);b.sprout=null;const x=inst('planta_jove',b.g);x.w.position.set(HOLE.x,HOLE.y-.03,HOLE.z);clip(x,'brotar',false,0,'vent');b.young=x}
  function ripen(b){const v=b.veg,m=VM[v];shrink(b.young,.3);b.young=null;b.ripeT=0;
    if(m.ent!==undefined){const e=.75,zt=banZ(m.radi*e);b.vora=inst('vora',b.g);b.vora.w.position.y=zt-.02;b.vora.k0=m.radi*e/.5*1.12;
      b.vv=inst(v,b.g);b.vv.w.position.set(0,zt-m.ent*e,0);b.vv.k0=e}
    else{const p=PM[v];b.plant=inst('planta_'+v,b.g);b.plant.k0=1;b.vv=inst(v,b.g);b.vv.k0=p.e;
      if(p.penja){const a=p.penja,q=m.penja;b.vv.w.position.set(a[0]-q[0]*p.e,a[1]-q[1]*p.e,a[2]-q[2]*p.e)}else b.vv.w.position.fromArray(p.seu)}
    for(const x of [b.vora,b.plant,b.vv])if(x)x.w.scale.setScalar(.001);clip(b.vv,'repos',true,0);b.vv.A.repos.time=Math.random()*2}
  function hello(v,veg){clip(v,'saludar',false,.1);const r=NOTE[veg]||1;play('h_kalimba',.5,r);play('h_kalimba',.45,r*1.335,.14)}
  function no(b){b.shake=1;play('h_fulles',.7,rnd(.9,1.1))}
  function chord(k=1){[1,1.26,1.5,2].forEach((r,i)=>play('h_kalimba',.28,r*k,i*.07))}

  /* ───── eines (barra a baix: llavors, regadora, sol; cistella a la dreta) ───── */
  function mkSlots(){slots={};const list=MODE===0?['llavors','regadora','sol']:sz().tools.filter(t=>t!=='cistella');
    list.forEach((t,i)=>slots[t]=mkSlot(t,190+i*185,i));slots.cistella=mkSlot('cistella',BASKX,4)}
  function mkSlot(t,x,i){const T=TOOL[t],o=inst(T.m);o.w.scale.setScalar(.001);
    if(t==='sol')clip(o,'brillar',true,0,null,.5);return{t,x,ry:TOOLC,cx:x,cy:TOOLC,x3:o,away:0,busy:0,held:0,hov:0,app:-.3-i*.1,leave:0,bump:0}}
  function hit(x,y){
    if(fin){const f=fin;if(f.ready&&!f.done&&Math.abs(x-f.x)<205&&y>f.y-300&&y<f.y+40)return{k:'nap'};return null}
    if(MODE===1)for(const t of sz().tools){const s=slots[t];if(s&&Math.hypot(x-s.x,y-TOOLC)<88)return{k:'tool',t}}
    let best=null,bd=1e9;for(const b of beds){if(b.leave)continue;const q=bedBox(b);if(x>q.x0&&x<q.x1&&y>q.y0&&y<q.y1){const d=Math.abs(x-b.x)+Math.abs(y-(b.y-topPx(b)/2))*.5;if(d<bd){bd=d;best=b}}}
    return best?{k:'bed',b:best}:null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.t===b.t&&a.b===b.b);
  function actionable(g){if(!g)return false;
    if(g.k==='nap')return fin.ready&&!fin.busy&&!fin.done;
    if(g.k==='tool'){const s=slots[g.t];return !!s&&held!==g.t&&!s.away&&s.app>=1}
    const b=g.b;if(b.busy||b.st>=4||!b.ready)return false;
    if(MODE===0)return true;
    if(held)return true;                                  // amb una eina a la mà sempre (si no toca, el bancal diu que no)
    return need(b)==='cistella'&&isAuto('cistella')}
  function activate(g){if(!g)return;idle=0;if(mole&&!mole.leave)mole.leave=.001;acts++;STATS.n++;$('#oN').textContent=STATS.n;
    if(g.k==='nap')return pull();
    if(g.k==='tool'){if(held)slots[held].held=0;held=g.t;heldT=0;slots[g.t].held=1;play('h_agafa',.6);return}
    const b=g.b;
    if(MODE===0){useTool(need(b),b,null);return}
    if(held){const t=held,s=slots[t];held=null;s.held=0;if(need(b)===t)useTool(t,b,s);else no(b);return}
    if(need(b)==='cistella'&&isAuto('cistella'))useTool('cistella',b,null)}
  function useTool(t,b,slot){b.busy=1;
    if(t==='cistella'&&!slot){harvest(b,null);return}
    let x,from;const s=slots[t];
    if(slot){x=slot.x3;slot.away=1;from={x:slot.cx,y:slot.cy}}                    // mode 2: vola l'eina que porta l'infant
    else{x=inst(TOOL[t].m);if(t==='sol')clip(x,'brillar',true,0,null,.5);from=s?{x:s.cx,y:s.cy}:{...SKY};if(s)s.busy++}
    const top=t==='llavors'?{x:b.x-22,y:b.y-topPx(b)-82}:t==='regadora'?{x:b.x-62-b.w*.06,y:b.y-topPx(b)-70}
      :t==='sol'?{x:b.x,y:b.y-topPx(b)-125}:{x:b.x+b.w*.5+52,y:b.y-30};
    top.y=Math.max(70,top.y);anims.push({t,b,slot,x,from,top,ph:0,tt:0,e:{},acc:0})}
  function backPos(a){const s=a.slot||slots[a.t];return s?{x:s.x,y:s.ry}:{...SKY}}

  function actStart(a){const b=a.b,x=a.x;
    if(a.t==='llavors'){clip(x,'abocar',false,.08,null,1.25);play('h_llavor',.8,1,.15);makeHole(b)}
    if(a.t==='regadora'){clip(x,'regar',false,.08,null,1.2);play('h_aigua',.85,1,.12)}
    if(a.t==='sol'){clip(x,'brillar',true,.1,null,1.4);play('h_creix',.8);a.cone=cone()}
    if(a.t==='cistella')harvest(b,a)}
  function actStep(a,u,dA){const b=a.b,e=a.e;
    if(a.t==='llavors'&&u>.32&&!e.s){e.s=1;seeds(a)}
    if(a.t==='regadora'){if(u>.1&&u<.86){a.acc+=dA;while(a.acc>.028){a.acc-=.028;drop(a)}}
      if(u>.3)b.wet=Math.max(b.wet,clamp((u-.3)/.45,0,1));if(u>.84&&!e.s){e.s=1;sprout(b)}}
    if(a.t==='sol'){a.acc+=dA;while(a.acc>.07){a.acc-=.07;sparkle(b)}
      const o=.2*Math.min(1,u*5,(1-u)*5);a.cone.material.opacity=o*(1+.15*Math.sin(now*9));coneAt(a);
      if(u>.12&&!e.y){e.y=1;young(b)}if(u>.6&&!e.r){e.r=1;ripen(b)}if(u>.8&&!e.h){e.h=1;hello(b.vv,b.veg)}}}
  function actEnd(a){const b=a.b;if(a.slot)rest(a.x);
    if(a.t==='sol'){ROOT.remove(a.cone);a.cone.material.dispose();b.st=3;b.busy=0}
    if(a.t==='llavors')b.busy=0;
    if(a.t==='regadora'){if(isAuto('sol'))later(.45,()=>{if(beds.includes(b))useTool('sol',b,null)});else b.busy=0}}
  function finish(a){if(a.slot){a.slot.away=0;a.slot.cx=a.slot.x;a.slot.cy=a.slot.ry}else{free(a.x);const s=slots[a.t];if(s)s.busy=Math.max(0,s.busy-1)}
    anims.splice(anims.indexOf(a),1)}
  function cone(){const m=new THREE.Mesh(new THREE.CylinderGeometry(.34,1,1,28,1,true),new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,opacity:0,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));m.renderOrder=5;ROOT.add(m);return m}
  function coneAt(a){const b=a.b,y0=a.top.y+28,y1=b.y-topPx(b)*.55,h=Math.max(.2,(y1-y0)/(CP*P)),rw=b.w*.55/P;
    a.cone.scale.set(rw,h,rw);place(a.cone,a.top.x,(y0+y1)/2,FRONT)}

  /* ───── partícules (en coordenades de pantalla, davant de tot) ───── */
  function part(m,x,y,o){ROOT.add(m);const p=Object.assign({m,x,y,vx:0,vy:0,g:0,t:0,life:1,by:FRONT,kill:1e9,s:1},o);parts.push(p);place(m,x,y,p.by);return p}
  function seeds(a){const b=a.b,[sx,sy]=tipOf(a.x),hw=b.g.localToWorld(WV.copy(HOLE)),[ex,ey]=proj(hw);
    for(let i=0;i<3;i++){const x=inst('llavor');x.w.scale.setScalar(b.s*.85);
      parts.push({k:'seed',x,m:x.w,sx:sx+rnd(-6,6),sy,ex:ex+(i-1)*b.w*.05,ey:ey+2,t:-i*.11,dur:.45,b,last:i===2});x.w.visible=false}}
  function drop(a){const [x,y]=tipOf(a.x),b=a.b,m=new THREE.Mesh(SPH,M_DROP),r=.028+Math.random()*.012;m.scale.set(r,r*1.5,r);
    const k=b.y-banZ(clamp((x+60-b.x)/(b.s*P),-1,1))*b.s*P*CP;
    part(m,x+rnd(-3,3),y,{vx:rnd(35,95),vy:rnd(20,70),g:1150,life:1.2,kill:k+rnd(-4,b.w*.12),splash:1})}
  function crumbs(x,y,n,sp=1){for(let i=0;i<n;i++){const m=new THREE.Mesh(SPH,M_SOIL),r=(.03+Math.random()*.03)*sp;m.scale.setScalar(r);
    const an=rnd(-2.6,-.55);part(m,x+rnd(-12,12)*sp,y,{vx:Math.cos(an)*rnd(90,220)*sp,vy:Math.sin(an)*rnd(180,330)*sp,g:1200,life:.75})}}
  function sparkle(b){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:STAR,color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
    const s=rnd(.1,.2);m.scale.set(s,s,1);m.renderOrder=6;const an=rnd(0,6.28),rx=b.w*rnd(.25,.55),cy=b.y-topPx(b)*.5;
    part(m,b.x+Math.cos(an)*rx,cy+Math.sin(an)*rx*.4,{vx:rnd(-20,20),vy:rnd(-90,-40),life:rnd(.6,1),spr:1,s})}
  function confetti(){const C=[0xffd23a,0xff7aa8,0x6fd3ff,0x9be15d,0xffa34d,0xb38cff];
    for(let i=0;i<46;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:PETAL,color:C[i%6],transparent:true,depthTest:false,toneMapped:false}));
      m.scale.set(.14,.21,1);m.renderOrder=20;part(m,rnd(0,W),rnd(-H*.9,-10),{vy:rnd(45,85),life:7,spr:1,conf:1,ph:rnd(0,6),vr:rnd(-1.5,1.5),s:1})}}
  function stepParts(dA){const old=parts;parts=[];const keep=old.filter(p=>{p.t+=dA;
      if(p.k==='seed'){if(p.t<0)return true;const u=Math.min(1,p.t/p.dur);p.x.w.visible=true;const px=lerp(p.sx,p.ex,u),py=lerp(p.sy,p.ey,u*u);
        place(p.x.w,px,py,FRONT);p.x.w.rotation.z=u*5;if(u>.8)p.x.w.scale.setScalar(p.b.s*.85*Math.max(.01,(1-u)/.2));
        if(u>=1){free(p.x);if(p.last&&beds.includes(p.b)){p.b.st=1;p.b.holeS=Math.min(p.b.holeS,.85);crumbs(p.ex,p.ey,3,.5)}return false}return true}
      p.vy+=p.g*dA;p.x+=p.vx*dA;p.y+=p.vy*dA;
      if(p.conf){p.x+=Math.sin(now*1.5+p.ph)*20*dA;p.m.material.rotation+=p.vr*dA;p.m.material.opacity=Math.min(1,p.t*2,(p.life-p.t)*1.5)}
      else if(p.spr)p.m.material.opacity=Math.min(1,p.t*6,(p.life-p.t)*3);
      place(p.m,p.x,p.y,p.by);
      if(p.y>=p.kill||p.t>=p.life){ROOT.remove(p.m);if(p.spr)p.m.material.dispose();
        if(p.splash&&p.y>=p.kill&&Math.random()<.35){const m=new THREE.Mesh(SPH,M_DROP);m.scale.setScalar(.018);part(m,p.x,p.y-2,{vx:rnd(-60,60),vy:rnd(-120,-60),g:900,life:.25})}
        return false}return true});parts=keep.concat(parts)}      // les gotetes d'esquitx creades durant el filtre s'afegeixen al final

  /* ───── collita: l'hortalissa surt, puja dalt del bancal, saluda i salta a la cistella ───── */
  function basket(){return slots.cistella}
  function harvest(b,a){b.busy=1;const v=b.vv;if(!v){b.busy=0;return}ROOT.attach(v.w);
    const g=b.g,p1=gpos(b.x,b.y).add(new THREE.Vector3(0,BAN_H*.97*b.s,.1*b.s));
    b.hv={t:0,ph:1,a,v,p0:v.w.position.clone(),p1,s0:v.w.scale.x,s1:b.s*.78,q0:v.w.quaternion.clone()};
    clip(v,'sortir',false,.06);play('h_sortir',.85,rnd(.95,1.05));
    const [cx,cy]=proj(p1);crumbs(cx,cy+6,9,b.s*.9);
    shrink(b.plant);shrink(b.vora);b.plant=b.vora=null;b.dry=1}
  function stepHarvest(b,dA){const h=b.hv,v=h.v;h.t+=dA;
    if(h.ph===1){const u=eOut(Math.min(1,h.t/.42));v.w.position.lerpVectors(h.p0,h.p1,u);v.w.scale.setScalar(lerp(h.s0,h.s1,u));v.w.quaternion.slerpQuaternions(h.q0,new THREE.Quaternion(),u);
      if(h.t>=1.2){h.ph=2;hello(v,b.veg)}}
    else if(h.ph===2){if(h.t>=2.6){h.ph=3;jumpTo(h,b)}}
    else if(h.ph===3){const j=h.j;j.t+=dA;const u=Math.min(1,j.t/j.dur),px=lerp(j.sx,j.ex,u),py=lerp(j.sy,j.ey,u)-Math.sin(u*Math.PI)*j.h,
        by=u<.62?FRONT:lerp(FRONT,j.bz,(u-.62)/.38);place(v.w,px,py,by);v.w.scale.setScalar(lerp(j.s0,j.s1,u));v.w.rotation.set(0,0,-j.dir*u*Math.PI*2);
      if(u>=1)land(b)}}
  function jumpTo(h,b){const v=h.v,bk=basket(),i=pile.length,pp=PILE[i%PILE.length],[sx,sy]=proj(v.w.position);
    bk.x3.w.updateMatrixWorld(true);const w=new THREE.Vector3(pp[0],pp[1]+.14*Math.floor(i/PILE.length),pp[2]).applyMatrix4(bk.x3.w.matrixWorld),[ex,ey]=proj(w);
    h.j={t:0,dur:.85,sx,sy,ex,ey,bz:360+w.z*SP*P,s0:v.w.scale.x,s1:TOOL.cistella.sc*.42,h:110+Math.abs(ex-sx)*.22,dir:Math.sign(ex-sx)||1,i,pp,lay:Math.floor(i/PILE.length)};
    clip(v,'saltar',false,.06);play('h_boing',.65,rnd(.95,1.1))}
  function land(b){const h=b.hv,v=h.v,j=h.j,bk=basket();bk.x3.w.attach(v.w);v.w.position.set(j.pp[0],j.pp[1]+.14*j.lay,j.pp[2]);
    v.w.rotation.set(rnd(-.12,.12),rnd(-.5,.5),rnd(-.2,.2));v.w.scale.setScalar(.42);pile.push({v,veg:b.veg});clip(v,'repos',true,.1);
    play('h_cistella',.75);chord(NOTE[b.veg]);bk.bump=1;b.st=4;b.busy=0;b.vv=null;b.hv=null;harvests++;
    if(h.a)h.a.got=h.a.tt;
    if(beds.every(q=>q.st>=4)&&!nextAt)nextAt=now+1.5}

  /* ───── el nap gegant ───── */
  function startFinale(){const S=sz(),n=pile.length;idle=0;finales++;
    beds.forEach((b,i)=>b.leave=.001+i*.04);for(const t in slots)if(t!=='cistella')slots[t].leave=.001;if(held){slots[held].held=0;held=null}
    const f=fin={x:560,y:545,t:0,pulls:0,need:S.pulls,busy:0,pt:0,done:0,popT:-1,ready:false,E:3.3,Et:1.75,line:[],app:0,cheer:0};
    f.bed=inst('bancal');f.bed.w.position.copy(gpos(f.x,f.y));f.bed.w.scale.setScalar(.001);
    f.nap=inst('nap');f.nap.w.position.copy(gpos(f.x,f.y));clip(f.nap,'repos',true,0);
    f.tx=820;f.ty=568;f.tina=inst('talpa');f.tina.w.position.copy(gpos(f.tx,f.ty));f.tina.w.position.y=-1.7;f.tina.w.scale.setScalar(.8);
    f.hill=inst('vora');f.hill.w.position.copy(gpos(f.tx,f.ty));f.hill.w.scale.setScalar(.001);
    later(.5,()=>{if(fin!==f)return;clip(f.tina,'sortir',false,0,'saludar');f.up=1;play('h_talpa',.75)});
    const sp=n>1?Math.min(78,300/(n-1)):0;
    pile.forEach((q,i)=>later(.9+i*.2,()=>{if(fin!==f)return;const v=q.v;ROOT.attach(v.w);const [sx,sy]=proj(v.w.position),ex=915+i*sp,ey=548+(i%2?42:0);
      q.j={t:0,dur:.7,sx,sy,ex,ey,s0:v.w.scale.x,s1:.62,q0:v.w.quaternion.clone()};clip(v,'saltar',false,.06);play('h_boing',.5,rnd(.95,1.15));f.line.push(q)}));
    later(1.4+n*.2,()=>{if(fin===f){f.ready=true;idle=0}})}
  function pull(){const f=fin;if(!f||f.busy||f.done)return;f.busy=1;f.pt=0;f.pulls++;
    play('h_estira',.8,.9+f.pulls*.05);clip(f.nap,'tremolar',false,.08);clip(f.tina,'estirar',false,.08);
    f.line.forEach((q,i)=>later(i*.04,()=>{if(fin===f&&!q.j)clip(q.v,'estirar',false,.08)}));
    f.Et=1.75-(1.75-1.2)*f.pulls/f.need;
    if(f.pulls>=f.need){f.done=1;later(.75,()=>{if(fin===f)pop(f)})}}
  function pop(f){f.popT=0;play('h_nap',.95);const w=f.nap.w;f.j={p0:w.position.clone(),p1:gpos(330,615),t:0};clip(f.nap,'sortir',false,.06,'_hold');
    const [cx,cy]=proj(gpos(f.x,f.y).setY(BAN_H*2.3));crumbs(cx,cy,18,1.6);
    later(.15,()=>{if(fin!==f)return;clip(f.tina,'caure',false,.06,'_hold');f.line.forEach(q=>clip(q.v,'caure',false,.06,'_hold'));play('h_cau',.75)});
    later(1.5,()=>{if(fin!==f)return;const L=[f.nap,f.tina,...f.line.map(q=>q.v)];for(const x of L)clip(x,'ballar',true,.25);confetti();play('h_festa',.9);chord(1);
      /* girs de festa: cadascú fa un gir sobre si mateix, desincronitzats i uns cap a cada costat */
      const sp=spinPlan(L.length,f.popT+.6,.5);f.sp=L.map((x,i)=>({x,p:sp[i],r0:x.w.rotation.y}))})}
  function stepFinale(dA){const f=fin;f.t+=dA;
    f.app=Math.min(1,f.app+dA/.6);{const e=Math.max(.001,2.3*eBack(f.app));f.bed.w.scale.set(e*1.15,e,e*1.15)}   // més ample: tapa els bracets del nap enterrat
    f.hill.w.scale.setScalar(Math.max(.001,.95*eOut(f.app)));
    if(f.up)f.tina.w.position.y+=(0-f.tina.w.position.y)*Math.min(1,dA*12);
    if(f.busy){f.pt+=dA;if(f.pt>1.1)f.busy=0}
    if(f.popT<0){f.E+=(f.Et-f.E)*Math.min(1,dA*(f.t<1.5?2.2:4));f.nap.w.position.y=BAN_H*2.3-f.E}
    else{f.popT+=dA;const j=f.j;j.t+=dA;const u=Math.min(1,j.t/1.05),w=f.nap.w;w.position.lerpVectors(j.p0,j.p1,ease(u));w.position.y=lerp(j.p0.y,0,u)+Math.sin(u*Math.PI)*2.6;
      w.rotation.z=Math.sin(u*Math.PI)*.5;w.scale.setScalar(lerp(1,.82,u));if(f.popT>=9)newRound()}
    for(const q of f.line)if(q.j){const j=q.j;j.t+=dA;const u=Math.min(1,j.t/j.dur),px=lerp(j.sx,j.ex,u),py=lerp(j.sy,j.ey,u)-Math.sin(u*Math.PI)*120;
      place(q.v.w,px,py,u<.7?FRONT:lerp(FRONT,j.ey,(u-.7)/.3));q.v.w.scale.setScalar(lerp(j.s0,j.s1,u));q.v.w.quaternion.slerpQuaternions(j.q0,new THREE.Quaternion(),u);
      if(u>=1){q.v.w.position.copy(gpos(j.ex,j.ey));q.j=null;clip(q.v,'repos',true,.1)}}
    if(f.sp)for(const q of f.sp)q.x.w.rotation.y=q.r0+spinA(q.p,f.popT);
    if(f.ready&&!f.busy&&!f.done&&idle>HELP*2&&now>f.cheer){f.cheer=now+5;clip(f.tina,'aplaudir',false,.1)}}

  /* ───── la Tina d'ajuda: treu el cap d'un forat al costat del que toca i ho assenyala ───── */
  function hint(){
    if(fin)return fin.done||!fin.ready?null:{k:'nap'};
    const fr=beds.filter(b=>!b.busy&&b.st<4&&b.ready&&!b.leave);if(!fr.length)return null;
    const bySt=fr.slice().sort((a,b)=>b.st-a.st);
    if(MODE===0)return{k:'bed',b:bySt[0]};
    if(held){const b=fr.find(b=>need(b)===held);if(b)return{k:'bed',b}}
    const au=fr.find(b=>need(b)==='cistella'&&isAuto('cistella'));if(au&&!held)return{k:'bed',b:au};
    for(const b of bySt){const t=need(b);if(sz().tools.includes(t)&&t!==held&&slots[t]&&!slots[t].away)return{k:'tool',t}}
    return null}
  function hintPos(h){if(h.k==='tool'){const s=slots[h.t];return{x:s.x+98,y:TOOLC+10}}return{x:h.b.x+h.b.w*.47,y:h.b.y+30}}   // davant del bancal, a la dreta
  function moleUp(h){const p=hintPos(h),sc=h.k==='bed'?Math.max(.55,.42*h.b.s):.55,m={h,x:p.x,y:p.y,t:0,leave:0,sc,pt:0};
    m.tina=inst('talpa');m.tina.w.position.copy(gpos(p.x,p.y));m.tina.w.position.y=-.72*sc;m.tina.w.scale.setScalar(sc);
    clip(m.tina,'sortir',false,0,'assenyalar_E');m.tina.next='assenyalar_E';
    m.hill=inst('vora');m.hill.w.position.copy(gpos(p.x,p.y));m.hill.w.scale.setScalar(.001);
    m.hole=new THREE.Mesh(DISC,M_HOLE);m.hole.position.copy(gpos(p.x,p.y)).setY(.004);m.hole.scale.setScalar(.001);ROOT.add(m.hole);
    mole=m;play('h_talpa',.7);const [hx,hy]=[p.x,p.y-4];crumbs(hx,hy,6,.6)}
  function stepMole(dA){const m=mole;m.t+=dA;const k=m.leave?Math.max(0,1-m.leave/.45):eOut(Math.min(1,m.t/.3));
    m.hill.w.scale.setScalar(Math.max(.001,.78*k*m.sc/.55));m.hole.scale.setScalar(Math.max(.001,.33*k*m.sc/.55));
    if(m.leave){m.leave+=dA;m.tina.w.position.y=-.72*m.sc-m.leave*2.6*m.sc;if(m.leave>.5){free(m.tina);free(m.hill);ROOT.remove(m.hole);mole=null}return}
    if(m.tina.cur===m.tina.A.guaitar||!m.tina.cur){m.pt+=dA;if(m.pt>3.2){m.pt=0;clip(m.tina,'assenyalar_E',false,.12,'guaitar')}}
    if(m.tina.next==='repos')m.tina.next='guaitar';
    const h=hint();if(!h||!same(h,m.h))m.leave=.001}

  /* ───── rondes ───── */
  function clearAll(){for(const x of INST.slice())free(x);for(const p of parts)if(p.spr&&p.m.material)p.m.material.dispose();for(const b of beds)if(b.mat)b.mat.dispose();
    for(const a of anims)if(a.cone)a.cone.material.dispose();
    if(ROOT)while(ROOT.children.length)ROOT.remove(ROOT.children[0]);
    beds=[];anims=[];parts=[];outs=[];wait=[];slots={};held=null;heldT=0;idle=0;mole=null;fin=null;pile=[];nextAt=0;cur=null;dw=0}
  function newRound(){if(!ready)return;clearAll();round++;const S=sz(),vs=shuffle(VEG.slice());
    beds=S.beds.map(([x,y,w],i)=>mkBed(i,x,y,w,i<6?vs[i]:VEG[Math.random()*6|0]));mkSlots();play('h_brot',.4,.8,.2)}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready)return;if(!beds.length&&!fin){if(on)newRound();return}if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;
    ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(nextAt&&now>=nextAt){nextAt=0;startFinale()}
    /* mirada: on és, què s'hi pot fer i activació (passar, mirar una estona o clic) */
    const g=has?hit(wx,wy):null,ok=actionable(g);
    for(const b of beds){const h=!!(g&&g.k==='bed'&&g.b===b);
      if(h&&!b.inside&&b.ready){if(b.st===3&&!b.busy&&b.vv&&now>b.giggle&&!ok){b.giggle=now+3;clip(b.vv,'riure',false,.1)}else if(!ok&&!b.busy&&b.st<4)b.wob=1}
      b.inside=h;b.hov+=((h&&ok?1:0)-b.hov)*Math.min(1,dt*8)}
    for(const t in slots){const s=slots[t],h=!!(g&&g.k==='tool'&&g.t===t);s.hov+=((h&&ok?1:0)-s.hov)*Math.min(1,dt*8)}
    const entered=!same(g,cur);if(entered){cur=g;dw=0}
    if(ok){if(CFG.mode===0){if(entered)activate(g)}else if(CFG.mode===1){dw+=dt;ringP=clamp(dw/CFG.dwell,0,1);if(dw>=CFG.dwell){dw=0;activate(g)}}}else dw=0;
    /* eina a la mà: segueix la mirada; si no es fa servir en 6 s, torna sola */
    if(held){const s=slots[held];heldT+=dA;const tx=has?wx:s.x,ty=has?wy-70:s.ry;s.cx+=(tx-s.cx)*Math.min(1,dt*7);s.cy+=(ty-s.cy)*Math.min(1,dt*7);
      if(g&&g.k==='bed')heldT=Math.min(heldT,3);if(heldT>6){s.held=0;held=null}}
    for(const t in slots){const s=slots[t],T=TOOL[t],x=s.x3;
      if(s.app<1)s.app=Math.min(1,s.app+dA/.45);let k=s.app<=0?.001:eBack(Math.max(0,s.app));
      if(s.leave){s.leave+=dA;k*=Math.max(.001,1-s.leave/.35)}
      s.bump=Math.max(0,s.bump-dA*3);
      if(s.away)continue;
      if(!s.held){s.cx+=(s.x-s.cx)*Math.min(1,dt*5);s.cy+=(s.ry-s.cy)*Math.min(1,dt*5)}
      const hk=s.held?1.08:1+.05*s.hov+.06*Math.sin(s.bump*Math.PI);
      place(x.w,s.cx,s.cy+T.dy*hk,FRONT);x.w.scale.setScalar(Math.max(.001,T.sc*k*hk));x.w.rotation.z=s.held?Math.sin(now*3)*.08:Math.sin(now*2+s.x)*.03;
      x.w.visible=!s.busy&&!(s.leave>.35)}
    /* eines que volen: anar → fer → tornar */
    for(const a of anims.slice()){a.tt+=dA;const T=TOOL[a.t];let px,py,k=1;
      if(a.ph===0){const u=Math.min(1,a.tt/IN),e=ease(u);px=lerp(a.from.x,a.top.x,e);py=lerp(a.from.y,a.top.y,e)-Math.sin(u*Math.PI)*80;if(u>=1){a.ph=1;a.tt=0;actStart(a)}}
      else if(a.ph===1){px=a.top.x;py=a.top.y+Math.sin(now*4)*4;const d=ACT[a.t]||1,u=Math.min(1,a.tt/d);if(a.t==='sol')k=1+.14*Math.sin(u*Math.PI);
        actStep(a,u,dA);if(a.t==='cistella'?(a.got!==undefined&&a.tt>=a.got+.45):u>=1){a.ph=2;a.tt=0;actEnd(a)}}
      else{const u=Math.min(1,a.tt/OUT),e=ease(u),bk=backPos(a);px=lerp(a.top.x,bk.x,e);py=lerp(a.top.y,bk.y,e)-Math.sin(u*Math.PI)*60;if(u>=1){finish(a);continue}}
      place(a.x.w,px,py+T.dy*k,FRONT);a.x.w.scale.setScalar(T.sc*k);a.x.w.rotation.z=a.ph===1?0:Math.sin(now*6)*.06;a.x.w.visible=true}
    /* bancals */
    for(const b of beds){
      if(b.app<1){b.app=Math.min(1,b.app+dA/.5);if(b.app>=1)b.ready=true}
      let k=b.app<=0?.001:eBack(Math.max(0,b.app));if(b.leave){b.leave+=dA;k*=Math.max(.001,1-eOut(Math.min(1,b.leave/.4)))}
      b.shake=Math.max(0,b.shake-dA*1.6);b.wob=Math.max(0,b.wob-dA*1.5);
      if(b.dry)b.wet=Math.max(0,b.wet-dA*.8);wetCol(b);
      const hs=1+.04*b.hov;b.g.scale.set(b.s*k*hs,b.s*k*hs*(b.st>=4?.94:1),b.s*k*hs);
      b.g.position.x=(b.x-640)/P+Math.sin(now*30)*b.shake*8/P;b.g.rotation.z=Math.sin(now*9)*b.wob*.05+Math.sin(now*24)*b.shake*.03;
      if(b.hole){b.holeS+=((b.holeTo||0)-b.holeS)*Math.min(1,dA*(b.holeTo?7:5));b.hole.w.scale.setScalar(Math.max(.001,b.holeS));if(!b.holeTo&&b.holeS<.02){free(b.hole);b.hole=null}}
      if(b.ripeT>=0&&b.ripeT<1){b.ripeT=Math.min(1,b.ripeT+dA/.55);const e=eBack(b.ripeT);for(const x of [b.vora,b.plant,b.vv])if(x&&x.k0)x.w.scale.setScalar(Math.max(.001,x.k0*e))}
      if(b.hv)stepHarvest(b,dA)}
    for(const o of outs){o.t+=dA;const u=Math.min(1,o.t/o.d);o.x.w.scale.copy(o.s0).multiplyScalar(Math.max(.001,1-eOut(u)));if(u>=1){free(o.x);o.done=1}}outs=outs.filter(o=>!o.done);
    if(fin)stepFinale(dA);
    /* ajuda */
    const busy=anims.length||beds.some(b=>b.hv)||(fin&&(!fin.ready||fin.busy||fin.done))||nextAt;
    if(busy)idle=0;else idle+=dA;
    if(idle>HELP*2&&!mole&&!fin){const h=hint();if(h)moleUp(h)}
    if(mole)stepMole(dA);
    stepParts(dA);
    /* animacions */
    for(const x of INST){if(!x.mx)continue;x.ct+=dA;
      if(x.next&&x.cur&&x.ct*x.cur.timeScale>=x.cur.getClip().duration-.02){const n=x.next;x.next=null;if(n!=='_hold'&&x.A[n])clip(x,n,LOOPS.has(n),.15)}
      x.mx.update(dA)}}

  /* ───── dibuix: fons, ombres i llum de les dianes en 2D; la resta en 3D a sobre ───── */
  function glow(c,x,y,rx,ry,k){const p=.5+.5*Math.sin(now*3),a=Math.min(.95,(.42+.3*p)*k),r=rx+6*p;      // halo suau (degradat radial aixafat)
    c.save();c.translate(x,y);c.scale(1,(ry+4*p)/r);const g=c.createRadialGradient(0,0,0,0,0,r);
    g.addColorStop(0,`rgba(255,252,222,${a})`);g.addColorStop(.62,`rgba(255,249,210,${a*.85})`);g.addColorStop(1,'rgba(255,244,200,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.restore()}
  function shadow(c,x,y,rx,ry,a=.22){c.fillStyle=`rgba(70,40,15,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    if(!R||!ready)return;
    const H0=idle>HELP?hint():null;
    for(const b of beds){const k=b.leave?Math.max(0,1-b.leave/.4):Math.max(0,Math.min(1,b.app));if(k<=0)continue;shadow(c,b.x,b.y+b.w*.035,b.w*.53*k,b.w*.11*k);
      const tp=topPx(b);
      if(H0&&H0.k==='bed'&&H0.b===b)glow(c,b.x,b.y-tp*.45,b.w*.66,tp*.6+12,1.3);
      else if(actionable({k:'bed',b})&&(MODE===0||held||need(b)==='cistella'))glow(c,b.x,b.y-tp*.42,b.w*.6,tp*.55+8,.45)}
    for(const t in slots){const s=slots[t];if(s.leave>.35||s.app<=0)continue;if(!s.away&&!s.held)shadow(c,s.x,TOOLC+52,t==='cistella'?52:40,10,.2);
      if(MODE===1&&sz().tools.includes(t)&&!s.held&&!s.away&&!fin){if(H0&&H0.k==='tool'&&H0.t===t)glow(c,s.x,TOOLC,86,80,1.3);else glow(c,s.x,TOOLC,78,72,.35)}}
    if(fin){const f=fin;shadow(c,f.x,f.y+12,190*Math.min(1,f.app),36*Math.min(1,f.app));
      if(f.ready&&!f.busy&&!f.done)glow(c,f.x,f.y-150,215,175,idle>HELP?1.2:.45)}
    R.render(S3,cam)}
  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function layout(){if(!ready)return;newRound()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newRound()}
  function tray(){const t=$('#tray');t.innerHTML='';['hort.m1','hort.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;if(cvs)cvs.style.display='none';if(R)clearAll()}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,hit,hint,actionable,activate,need,topPx,scr,
    get ready(){return ready},get mode(){return MODE},get beds(){return beds},get slots(){return slots},get held(){return held},get fin(){return fin},
    get mole(){return mole},get idle(){return idle},get round(){return round},get harvests(){return harvests},get finales(){return finales},get pile(){return pile},
    get anims(){return anims},get acts(){return acts},get R(){return R},get INST(){return INST}};
})();
