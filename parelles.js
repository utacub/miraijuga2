/* =========================================================
   ESCENARI: PARELLES A LA MASIA
   Façana d'una masia amb finestres de porticons de colors (3D: models de Blender fets per ChatGPT, lliurament v4, 21-11-2026).
   Mirar una finestra tancada l'obre: hi treu el cap un animal de la fauna catalana (isard, trencalòs, almesquera, salamandra,
   geneta, ermini, abellerol, puput) i fa la seva gràcia. Quan les dues finestres d'una parella són obertes, els dos animals
   s'alegren, salten a l'era i la finestra es tanca. Trobades totes les parelles, tots ballen una sardana amb la Mila, la somera.
   «Qui treu el cap?»: les finestres obertes es queden obertes. «Memòria de parelles»: com a màxim dues d'obertes; si no fan
     parella, s'arronsen d'espatlles («?»), s'amaguen i les finestres es tornen a tancar (sense so d'error).
   Mides: 2/3/5 parelles (4/6/10 finestres). Ajuda: als 6 s brilla una finestra; als 12 s la Mila l'assenyala i diu «Mira aquí!».
   Les parts dels animals que queden dins la casa s'amaguen amb una paret invisible (només profunditat) amb forats a les obertures.
   Tecla P: canvia de mode.
   ========================================================= */
const PARELLES=(()=>{
  const TX=__PATX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l][k==='sc'?'sc.parelles':'par.'+k]=TX[l][k];
  const IX=__PAIX__;
  /* fitxes d'informació (botó ⓘ, com a Pim Pam): parelles/info.json → __PAINF__ (font: miraijuga2/parelles/info/fitxes.json) */
  const INF=__PAINF__;
  const AN=['isard','trencalos','almesquera','salamandra','geneta','ermini','abellerol','puput'];
  /* alçada a l'era relativa (com al prototip validat) */
  const FH={isard:1.25,trencalos:1.1,almesquera:.9,salamandra:.62,geneta:1.3,ermini:1,abellerol:1,puput:.95};
  const SZ=[{p:2,c:2,w:230},{p:3,c:3,w:190},{p:5,c:5,w:150}],ESZ=[1.25,1.1,1];
  const WALL={x0:192,x1:1093,cy:306,gy:6},FR=.784,COLS=['verd','blau','groc','vermell','lila'];
  const MILA={x:1180,y:712,h:312},ERA={y:652,x0:140,x1:1030},RING={cx:620,cy:632};
  /* color de l'habitació de cada animal (suau però distingible) */
  /* alçada dels peus sobre l'origen per clip (unitats del model): l'abellerol té l'origen a la punta de la cua; algunes danses aixequen el cos */
  const GND={isard:{hop:.076,happy:-.014,sardana:.075,sardana_up:.074},trencalos:{hop:.007,happy:-.018,sardana:.008,sardana_up:.009,idle:.006},
    almesquera:{hop:-.044,happy:-.011,sardana:-.049,sardana_up:-.04,idle:.006},salamandra:{hop:-.018,sardana:-.009,sardana_up:-.008},geneta:{hop:.048,happy:-.011,sardana:.038,sardana_up:.038},
    ermini:{hop:.03,happy:-.012,sardana:.028,sardana_up:.031,idle:.007},abellerol:{idle:.167,hop:.168,happy:.149,sardana:.169,sardana_up:.169},puput:{happy:-.019},
    mila:{walk:.087,sardana:.095,sardana_up:.095,cheer:-.038}};
  /* mitja envergadura en la sardana (punta de les potes o de les ales, unitats del model): distància per agafar-se */
  const SPAN={isard:.46,trencalos:.89,almesquera:.29,salamandra:.28,geneta:.34,ermini:.25,abellerol:.6,puput:.54,mila:.6};
  const ROOM={isard:'#5fa395',trencalos:'#79a6cf',almesquera:'#d9b24a',salamandra:'#a98bc9',geneta:'#d77a5e',ermini:'#dd93a8',abellerol:'#6f7fc0',puput:'#9aae5c'};
  const P=165,PIT=5*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6,ZE=2.4,ZM=2.7,OPX=.335,OPY=.55,FC=.303,CAPY=700;
  /* efectes de cada gràcia: [segon del clip win_trick, so] (alineats amb el pic de cada so) */
  const SFX={isard:[[1.08,'isard']],trencalos:[[1,'trencalos']],almesquera:[[.36,'almesquera']],salamandra:[[.78,'salamandra']],geneta:[[1,'geneta']],
    ermini:[[.66,'ermini']],abellerol:[[.27,'abellerol']],puput:[[.9,'ventall'],[1.1,'puput']]};
  /* salt de la finestra: a l'àpex del clip win_jump (0,36 s) ja surt cap a l'era. Fins llavors s'aixeca (JL, unitats del model: el que li cal perquè res no quedi sota l'ampit,
     mesurat a parelles/joc/salt.js) i avança 0,45 m de finestra, i no es veu res per sota l'ampit: així les potes no travessen la paret ni queden tallades pel pla del retall */
  const JAPEX=.36,JL={isard:.29,trencalos:.22,almesquera:.18,salamandra:0,geneta:.23,ermini:.19,abellerol:.17,puput:.17};
  /* fins on avança (unitats de finestra) a l'àpex: les aus obren les ales en saltar i, si no surten prou endavant, les ales queden darrere la paret i els porticons i es tallen a la vora de la finestra (Marc, 21-11) */
  const JF={abellerol:1.25,trencalos:1.1,puput:.9};
  /* les aus que obren les ales a la finestra (gràcia, alegria) hi són més endavant (unitats de finestra; la y es compensa i a la pantalla no es mou): així les ales passen per davant dels porticons i la paret (Marc, 21-11). Els plans de retall es desplacen igual. Mentre surt o s'amaga (win_in) torna a l'ampit (w.zk), perquè els porticons el tapin mentre s'obren o es tanquen */
  const ZW={abellerol:1.0};
  const ZF={almesquera:.2,ermini:.2};   /* fondària del retall sota l'ampit durant la gràcia (m de finestra): el pèl de sota d'aquests dos sobresurt */
  const CONF=['#f3c84a','#e8736b','#4fb3a9','#f6e7c8','#b48fd6','#d9534f'];
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,OCC=null,loading=0,first=true,IMF=null;
  const PROTO={},CL={},TXS={},POOL={},INST=[];
  let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],helpSaid=false,MI=null;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const lerp=(a,b,t)=>a+(b-a)*t,c01=t=>clamp(t,0,1),ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3p';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3pf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);R.localClippingEnabled=true;
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.55);sun=new THREE.DirectionalLight(0xfff2e0,1.3);sun.position.set(-3,6,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    IMF=img('parelles/fons.webp');
    load();resize()}
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX),tex=keys.concat(COLS.map(c=>'porticons_'+c),['ermini_hivern','finestra_int']);let n=keys.length+tex.length;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const t of tex)tx(t,done);
    for(const k of keys)L.load(U('parelles/m/'+k+'.glb'),g=>{const o=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name.slice(k.length+1)]=c;
        o.traverse(m=>{if(m.isMesh){m.frustumCulled=false;m.userData.mn=m.material&&m.material.name||''}});if(k==='finestra')splitInner(o);PROTO[k]=o;done()},undefined,e=>{console.error(e);done()})}
  /* separa la caixa de l'habitació (triangles de models.json → finestra.inner) en una malla pròpia amb ombreig per vèrtex: més fosc a dalt i al fons */
  function splitInner(o){const L=IX.finestra.inner;if(!L)return;let m=null;o.traverse(n=>{if(n.isSkinnedMesh&&n.userData.mn==='mat_finestra'&&n.geometry.index&&n.geometry.index.count===1980)m=n});if(!m)return;
    const g=m.geometry,ix=g.index.array,S=new Set(L),a=[],b=[];for(let t=0;t<ix.length/3;t++)(S.has(t)?b:a).push(ix[3*t],ix[3*t+1],ix[3*t+2]);
    g.setIndex(a);const g2=new THREE.BufferGeometry();for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.setIndex(b);
    const ps=g.attributes.position,col=new Float32Array(ps.count*3);for(let i=0;i<ps.count;i++){const y=c01(ps.getY(i)/.56),z=c01(-ps.getZ(i)/.36),v=(1-.26*y)*(1-.22*z);col[3*i]=col[3*i+1]=col[3*i+2]=v}
    g2.setAttribute('color',new THREE.BufferAttribute(col,3));const m2=new THREE.SkinnedMesh(g2,m.material);m2.name='geo_interior';m2.userData.mn='interior';m2.frustumCulled=false;
    m2.position.copy(m.position);m2.quaternion.copy(m.quaternion);m2.scale.copy(m.scale);m.parent.add(m2);m2.bind(m.skeleton,m.bindMatrix)}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: tremp mat (rugositat 0,8) i ulls satinats; porticons d'un color per finestra; l'ermini canvia al pelatge d'hivern ───── */
  function tx(n,cb){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('parelles/t/'+n+'.webp'),cb,undefined,cb);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mkMat(n,eye){const c=tx(n);
    /* doble cara com als GLB (doubleSided): si no, algunes cares girades desapareixen (p. ex. la peülla de la Mila quan saluda) */
    if(LOWQ)return new THREE.MeshPhongMaterial({map:c,shininess:eye?70:6,specular:eye?0x5a5a5a:0x101010,side:THREE.DoubleSide});
    return new THREE.MeshStandardMaterial({map:c,roughness:eye?.3:.8,metalness:0,envMap:ENV,envMapIntensity:eye?1:.7,side:THREE.DoubleSide})}
  /* finestra_int: la lluminositat del guix de l'habitació original (lineal, ×1/1,6; el color s'enfosqueix un 15 %); el color de l'animal la tenyeix */
  const roomCol=(m,c)=>m.color.set(c||'#e9dcc4').multiplyScalar(1.36);
  function mkRoom(c){const t=tx('finestra_int');t.colorSpace=THREE.NoColorSpace;const o={map:t,vertexColors:true,side:THREE.DoubleSide};
    const m=LOWQ?new THREE.MeshPhongMaterial(Object.assign(o,{shininess:3,specular:0x080808})):new THREE.MeshStandardMaterial(Object.assign(o,{roughness:.95,metalness:0,envMap:ENV,envMapIntensity:.55}));roomCol(m,c);return m}
  function paint(x){const old=x.mats||{},mats={},base=x.k==='ermini'&&x.white?'ermini_hivern':x.k;
    x.o.traverse(m=>{if(!m.isMesh)return;const mn=m.userData.mn||'',key=/porticons/.test(mn)?'p':/_ulls/.test(mn)?'e':mn==='interior'?'i':'b';
      if(!mats[key]){mats[key]=key==='i'?mkRoom(x.room):mkMat(key==='p'?'porticons_'+x.col:base,key==='e');if(x.clip){mats[key].clippingPlanes=x.clip;mats[key].clipIntersection=true}}m.material=mats[key]});
    for(const k in old)old[k].dispose();x.mats=mats;if(x.dim)dimWin(x,true)}
  function quality(){if(!R)return;lq=LOWQ;
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const x of INST)paint(x);
    amb.intensity=LOWQ?1.0:.6;sun.intensity=LOWQ?1.6:1.3;resize()}
  function setWhite(x,b){if(!!x.white===b)return;x.white=b;const t=tx(b?'ermini_hivern':'ermini');for(const k in x.mats)x.mats[k].map=t}
  function setRoom(x,c){x.room=c;if(x.mats.i)roomCol(x.mats.i,c)}
  function setCol(x,c){if(x.col===c)return;x.col=c;if(x.mats.p)x.mats.p.map=tx('porticons_'+c)}
  function dimWin(x,b){x.dim=b;if(x.mats.p)x.mats.p.color.setScalar(b?.72:1);if(x.mats.b)x.mats.b.color.setScalar(b?.9:1)}

  /* ───── instàncies (diverses còpies de cada model amb esquelet propi) ───── */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  function inst(k,col,noclone){const o=noclone?PROTO[k]:cloneSkinned(PROTO[k]),w=new THREE.Group();w.add(o);ROOT.add(w);
    const x={k,w,o,col,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',ct:0,dur:0,ts:1,once:false,fired:{},used:false};
    /* animals: es retalla el que queda sota l'ampit i darrere la seva cara davantera (dues plans, retall per intersecció) */
    if(AN.includes(k))x.clip=[new THREE.Plane(new THREE.Vector3(0,1,0),1e4),new THREE.Plane(new THREE.Vector3(0,0,1),1e4)];
    o.traverse(n=>{if(n.isBone&&n.name==='root')x.root=n;else if(n.name==='s_nas')x.nas=n;else if(n.isBone&&n.name==='head')x.head=n});
    paint(x);INST.push(x);return x}
  function take(k,col){const L=POOL[k]||(POOL[k]=[]);let x=L.find(q=>!q.used);if(!x){x=inst(k,col);L.push(x)}else if(col!=null)setCol(x,col);
    x.used=true;x.w.visible=true;x.w.rotation.set(0,0,0);x.mode='';return x}
  function give(x){if(!x)return;x.used=false;x.w.visible=false;x.mx.stopAllAction();x.cur=null;x.cn='';if(x.dim)dimWin(x,false)}
  function clip(x,n,fade=.2,ts=1){if(!x)return;const c=CL[x.k][n],info=IX[x.k].clips[n];if(!c||!info)return;let a=x.A[n];if(!a)a=x.A[n]=x.mx.clipAction(c);
    const loop=!!info[1]&&ts>0,prev=x.cur;a.enabled=true;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveTimeScale(ts);a.setEffectiveWeight(1);
    if(ts<0)a.time=c.duration;a.play();
    if(prev&&prev!==a){if(fade>0)prev.crossFadeTo(a,fade,false);else prev.stop()}
    x.cur=a;x.cn=n;x.ct=0;x.ts=ts;x.dur=c.duration/Math.abs(ts);x.once=!loop;x.fired={}}
  const ends=(x,m=.04)=>!!x&&x.once&&x.ct>=x.dur-m;
  /* esdeveniment del clip (nom de models.json o segon): cert una sola vegada quan s'hi arriba */
  function evt(x,name){if(!x||!x.cn||x.fired[name])return false;let e=typeof name==='number'?name:IX[x.k].clips[x.cn][2][name];if(Array.isArray(e))e=e[0];
    if(e==null)return false;if(x.ct>=e){x.fired[name]=1;return true}return false}
  const fitH=(k,h)=>h/(IX[k].h*P*CP);
  function closeNow(x){clip(x,'tanca',0);x.mx.update(5);x.ct=x.dur}

  /* ───── pantalla (px, 1280×720) ↔ món ───── */
  const gpos=(v,px,py,z=0)=>v.set((px-640)/P,(360-py)/(P*CP)+z*SP/CP,z);
  const proj=v=>[640+v.x*P,360-P*(v.y*CP-v.z*SP)];
  /* origen de la finestra = centre de dalt de l'ampit (el marc fa 1,00 × 0,80 m i el seu centre queda 0,303 m més amunt) */
  const wOrigin=(v,w)=>gpos(v,w.cx,w.cy+FC*w.w*CP,0);
  function later(t,f){wait.push({t:now+t,f})}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=2.6){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs v4: parelles/v/<idioma>_<clau>.mp3) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('parelles/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=2.6){cap(k,d);say([k])}
  const snd=(n,g=.6,r=1)=>play('pa_'+n,g,r);

  /* ───── la Mila: idle, talk, point, cheer, wave, walk, sardana, sardana_up ───── */
  const clipM=(n,f=.2)=>clip(MI,n,f);
  function placeMila(x,y,ry,k){gpos(MI.w.position,x,y,ZM);MI.w.scale.setScalar(MI.kh*k);MI.w.rotation.set(0,ry,0)}
  function stepMila(){if(st.ph==='sardana'||st.ph==='back')return;
    if(MI.once&&ends(MI))clipM('idle',.3);
    if(MI.cn==='point'&&(idle<HELP*2||MI.ct>3.4))clipM('idle',.3);
    const talking=!!vSrc;if(talking&&MI.cn==='idle')clipM('talk',.2);else if(!talking&&MI.cn==='talk')clipM('idle',.25)}

  /* ───── partida ───── */
  function newGame(again){if(!ready)return;vStop();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;
    for(const x of INST)if(x!==MI&&x.used)give(x);
    if(!MI){MI=inst('mila',null,true);MI.used=true}
    MI.kh=fitH('mila',MILA.h);placeMila(MILA.x,MILA.y,-.5,1);
    const S=SZ[CFG.size],pick=shuffle(AN.slice()).slice(0,S.p),deck=shuffle(pick.concat(pick)),sw=S.w,sh=sw*FR,gx=(WALL.x1-WALL.x0-S.c*sw)/(S.c+1);
    st={ph:'intro',t:0,cap:null,busy:0,era:[],seen:{},hw:null};
    st.wins=deck.map((an,i)=>{const r=i/S.c|0,c=i%S.c,col=COLS[(i*3+r)%5],
        w={an,i,r,cx:WALL.x0+gx+sw/2+c*(sw+gx),cy:WALL.cy+(r===0?-1:1)*(sh/2+WALL.gy/2),w:sw,h:sh,col,state:'closed',t:0,tricked:false,paired:false,shrug:0,look:0,lookT:0,a:null,pot:null,potK:0,potOn:false,pop:-i*.05-.15};
      w.X=take('finestra',col);setRoom(w.X,ROOM[an]);closeNow(w.X);placeWin(w);return w});
    buildOcc();clipM('wave',0);
    const k=MODE===0?'qui':'busca';
    later(.35,()=>{if(again)say(['tornem',k]),cap('tornem',1.6),later(1.6,()=>cap(k,2));else if(first){first=false;say(['hola',k]);cap('hola',1.8);later(1.8,()=>cap(k,2.2))}else tell(k,2.4)})}
  function placeWin(w){const pp=w.pop<0?0:w.pop<1?eBack(w.pop):1;wOrigin(w.X.w.position,w);w.X.w.scale.setScalar(Math.max(.001,w.w/P*pp))}
  /* paret invisible (només profunditat) amb un forat a cada obertura: amaga el cos dels animals que queda dins la casa */
  function buildOcc(){if(OCC){OCC.geometry.dispose();OCC.removeFromParent()}
    const s=new THREE.Shape();s.moveTo(-6,-5);s.lineTo(6,-5);s.lineTo(6,5);s.lineTo(-6,5);s.lineTo(-6,-5);
    for(const w of st.wins){wOrigin(V1,w);const k=w.w/P,x0=V1.x-OPX*k,x1=V1.x+OPX*k,y0=V1.y,y1=V1.y+OPY*k,h=new THREE.Path();
      h.moveTo(x0,y0);h.lineTo(x0,y1);h.lineTo(x1,y1);h.lineTo(x1,y0);h.lineTo(x0,y0);s.holes.push(h)}
    if(!OCC)OCC=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide}));else OCC.geometry=new THREE.ShapeGeometry(s);
    OCC.renderOrder=-1;OCC.position.z=-.03*st.wins[0].w/P;ROOT.add(OCC)}
  const partnerOf=w=>st.wins.find(o=>o!==w&&o.an===w.an);
  const eraK=an=>ERA_H()*FH[an]/(IX[an].h*P*CP),ERA_H=()=>130*ESZ[CFG.size];

  /* obrir una finestra: els porticons giren cap enfora i l'animal puja de dins la casa (win_in) */
  function activate(g){if(!actionable(g))return;idle=0;helpSaid=false;const w=g.w;
    w.state='opening';w.t=0;w.tricked=false;w.paired=false;w.shrug=0;w.shrugged=false;w.look=w.lookT=0;
    clip(w.X,'obre',0);snd('obre',.55);st.busy=.5;
    const a=take(w.an);a.mode='win';if(a.k==='ermini')setWhite(a,false);w.a=a;w.zk=0;placeA(w);clip(a,'win_in',0);
    (st.seen[w.an]=st.seen[w.an]||new Set()).add(w.i);
    if(MI.cn==='point')clipM('idle',.3)}
  function placeA(w){const a=w.a,k=w.w/P;wOrigin(a.w.position,w);a.w.scale.setScalar(IX[w.an].ws*k);a.w.rotation.set(0,w.look,0);const sy=a.w.position.y,jump=a.cn==='win_jump',zf=(ZW[w.an]||0)*k*(w.zk||0);
    if(zf){a.w.position.z+=zf;a.w.position.y+=zf*SP/CP}
    if(jump){const u=ez(c01(a.ct/JAPEX)),fw=(JF[w.an]||.45)*k*u;a.w.position.y+=(JL[w.an]||0)*IX[w.an].ws*k*u+fw*SP/CP;a.w.position.z+=fw}
    /* fora de la gràcia i del salt no surt res per sota l'ampit: es retalla fins a 0,6 m endavant (l'entrada de win_in i les cues que travessen l'ampit) */
    a.clip[0].constant=-(sy+zf*SP/CP-.09*k);a.clip[1].constant=jump?-1e4:-((a.cn==='win_trick'?ZF[w.an]||.085:.6)*k+zf)}
  const noClip=a=>{a.clip[0].constant=1e4;a.clip[1].constant=1e4};
  function placePot(w){const p=w.pot;wOrigin(p.w.position,w);const u=w.potK;p.w.scale.setScalar(Math.max(.001,w.w/P*(w.potOn?eBack(u):u)))}
  function stepWin(w,dA){w.t+=dA;if(w.pop<1){w.pop=Math.min(1,w.pop+dA*2.4);placeWin(w)}
    const a=w.a;
    if(w.state==='opening'&&w.t>=.45){w.state='open';w.t=0}
    if(a&&a.mode==='win'){w.look=lerp(w.look,w.lookT,c01(dA*5));w.zk=lerp(w.zk||0,a.cn==='win_in'?0:1,c01(dA*6));placeA(w);
      if(a.cn==='win_in'&&a.ts>0&&ends(a))clip(a,'win_trick',.12);
      else if(a.cn==='win_trick'){trickFx(w,a);if(ends(a)){w.tricked=true;clip(a,'win_idle',.3)}}
      else if(a.cn==='win_shrug'&&ends(a))clip(a,'win_idle',.3)}
    if(w.pot){w.potK=c01(w.potK+(w.potOn?1:-1)*dA/.28);placePot(w);if(!w.potOn&&w.potK<=0){give(w.pot);w.pot=null}}
    if(w.state==='leave')stepLeave(w);
    else if(w.state==='hide'){if(w.t>=.12&&!w.shut){w.shut=1;clip(w.X,'tanca',0);snd('tanca',.45)}
      if(w.t>=.62){give(w.a);w.a=null;w.state='closed';w.t=0;w.shut=0}}
    else if(w.state==='closing'&&w.t>=.62){w.state='done';w.t=0;dimWin(w.X,true)}
    if(w.shrug>0)w.shrug-=dA}
  function trickFx(w,a){for(const [t,n] of SFX[w.an])if(evt(a,t))snd(n,.7);
    if(w.an==='almesquera'&&evt(a,'esternut')&&a.nas){a.nas.getWorldPosition(V1);const [x,y]=proj(V1),s=w.w/230;
      for(let i=0;i<3;i++)fxp.push({k:'bub',x:x+rnd(-4,4)*s,y:y-4*s,vx:(i-1)*30*s+rnd(-8,8),vy:rnd(-75,-45)*s,t:-i*.12,d:1.5,r:rnd(5,8)*s})}
    if(w.an==='ermini'&&evt(a,'blanc')){setWhite(a,true);if(a.nas){a.nas.getWorldPosition(V1);const [x,y]=proj(V1),s=w.w/230;
      for(let i=0;i<9;i++)fxp.push({k:'snow',x:x+rnd(-55,55)*s,y:y+rnd(-50,40)*s,vx:rnd(-12,12),vy:rnd(10,30),t:0,d:rnd(.8,1.3),r:rnd(2.5,4.5)*s})}}
    if(w.an==='salamandra'&&evt(a,'gota')&&a.head){a.head.getWorldPosition(V1);const [x,y]=proj(V1),s=w.w/230;
      for(let i=0;i<7;i++){const an=-Math.PI*(.1+.8*i/6);fxp.push({k:'drp',x,y:y-26*s,vx:Math.cos(an)*rnd(60,110)*s,vy:Math.sin(an)*rnd(70,120)*s,g:420,t:0,d:.6,r:rnd(2.5,4)*s})}}}
  /* parella trobada: s'alegren mirant-se, salten a l'era i la finestra es tanca */
  function pairFound(w,p){[w,p].forEach((q,j)=>{q.paired=true;q.state='leave';q.t=0;q.delay=j*.18;q.lookT=(partnerOf(q).cx>q.cx?1:-1)*.28;clip(q.a,'win_happy',.2)});
    st.busy=2.3;tell('n_'+w.an,2.2);snd('iguals',.6);clipM('cheer',.2);STATS.n++;$('#oN').textContent=STATS.n;
    for(const e of st.era)if(e.ph==='era')clip(e.a,'happy',.2)}
  function stepLeave(w){const a=w.a;if(!a)return;
    if(a.cn==='win_happy'&&w.t>=1.15+w.delay){clip(a,'win_jump',.1);snd('salt',.5)}
    else if(a.cn==='win_jump'&&a.ct>=JAPEX)toEra(w)}
  function toEra(w){const a=w.a,N=st.wins.length,k=st.era.length,x=N>1?lerp(ERA.x0,ERA.x1,k/(N-1)):(ERA.x0+ERA.x1)/2;
    /* continuïtat: l'arrel de l'esquelet queda on era al final del salt quan passa al clip hop (origen a terra) */
    a.w.updateMatrixWorld(true);a.root.getWorldPosition(V1);clip(a,'hop',0);a.mx.update(0);a.w.updateMatrixWorld(true);a.root.getWorldPosition(V2);
    a.w.position.add(V1).sub(V2);a.mode='era';noClip(a);
    const e={a,an:w.an,x,y:ERA.y,ph:'fly',t:0,p0:a.w.position.clone(),p1:gpos(new THREE.Vector3(),x,ERA.y,ZE),s0:a.w.scale.x,s1:eraK(w.an),ry0:a.w.rotation.y,ry:x<640?.35:-.35,dir:Math.sign(x-w.cx)||1,lt:0};
    st.era.push(e);w.a=null;w.state='closing';w.t=0;w.potOn=false;
    later(.55,()=>{clip(w.X,'tanca',0);snd('tanca',.45)})}
  function stepEra(e,dA){const a=e.a;
    if(e.ph==='fly'){e.t+=dA;const u=c01(e.t/1.05),q=ez(u);a.w.position.lerpVectors(e.p0,e.p1,q);{const z=lerp(e.p0.z,e.p1.z,1-(1-u)**3);a.w.position.y+=(z-a.w.position.z)*SP/CP;a.w.position.z=z}/* surt endavant de seguida (no travessa els porticons) sense canviar el camí a la pantalla */a.w.position.y+=Math.sin(u*Math.PI)*.55;a.w.scale.setScalar(lerp(e.s0,e.s1,q));
      a.w.rotation.y=lerp(e.ry0,e.ry,q)+Math.sin(u*Math.PI)*.5*e.dir;
      if(u>=1){e.ph='era';e.lt=0;clip(a,'idle',.25);snd('aterra',.5)}}
    else if(e.ph==='era'){e.lt+=dA;if(a.once&&ends(a))clip(a,'idle',.3)}}
  /* «Memòria de parelles»: no fan parella → «?», s'arronsen d'espatlles i s'amaguen */
  function mismatch(a,b){for(const w of [a,b]){w.shrugged=true;w.shrug=1.6;w.lookT=(w===a?b:a).cx>w.cx?.22:-.22;clip(w.a,'win_shrug',.2)}st.busy=2.4;cap('noiguals',1.9);
    later(1.75,()=>{for(const w of [a,b])if(w.state==='open'&&w.a)hideWin(w)})}
  function hideWin(w){w.state='hide';w.t=0;w.shut=0;w.shrugged=false;w.lookT=0;clip(w.a,'win_in',.1,-1.5);w.potOn=false;st.busy=Math.max(st.busy,.7)}
  function evalPairs(){const op=st.wins.filter(w=>w.state==='open'&&!w.paired);
    for(const w of op){const p=partnerOf(w);if(p&&op.includes(p)&&w.tricked&&p.tricked){pairFound(w,p);return}}
    if(MODE===1&&op.length>=2){const [a,b]=op;if(a.an!==b.an&&a.tricked&&b.tricked&&!a.shrugged&&!b.shrugged)mismatch(a,b)}}

  /* ───── la sardana: tots en rotllana amb la Mila; curts, llargs i un gir de festa cadascú ───── */
  /* rotllana tancada a l'era: tots agafats (distància = suma de mitges envergadures) i mirant cap al centre; la rotllana gira a poc a poc.
     És un cercle a terra vist de biaix: x = r·cos θ, y = ry·sin θ (ry ≤ 67 px perquè tothom trepitgi l'era) */
  const ang=(a,b)=>{let d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d};
  /* tres sardanes de cobla triades per Marc (21-11-2026), una a l'atzar a cada dansa sense repetir l'anterior (parelles/joc/mksardana3.py). Temps del bucle en s:
     in = primer temps del ball (abans, 2 compassos per fer la rotllana i agafar-se), up = mans enlaire, fi = acord final (s'aturen amb les mans enlaire i aplaudiment).
     Totes a 112 negres amb punt: un cicle del clip (4 s) per frase de 4 compassos (4,286 s). */
  let lastSk=null;const SV={m_par_sardana:{in:2.384,up:8.812,fi:12.027},m_par_sardana2:{in:2.343,up:6.628,fi:10.912},m_par_sardana3:{in:2.34,up:6.625,fi:10.912}},SARD_G=1.5,SARD_TS=4/4.286,SARD_END=2.85;
  /* temps de la dansa: el rellotge de la música si sona (la dansa va a compàs encara que el joc perdi fotogrames); sense música, sense l'espera */
  function sardT(){const t=st.t,S=st.sv;try{if(typeof musicSrc!=='undefined'&&musicSrc&&musicKey===st.sk&&AC&&AC.state==='running'){const m=AC.currentTime-musicSrc._t0;if(m>=0)return Math.max(t-1,m)}}catch(e){}
    return t<SARD_G?t:t+S.in-SARD_G}
  function ringPos(r){const R0=st.rr,th=r.th+st.rot,c=Math.cos(th),sn=Math.sin(th);
    return{px:RING.cx+c*R0.r,py:RING.cy+sn*R0.ry,face:Math.atan2(-c,-sn),z:ZE+sn*.9,s:1+.05*sn}}
  function startSardana(){st.ph='sardana';st.t=0;st.s0=st.s1=st.s2=st.s3=0;st.rot=0;
    {const ks=Object.keys(SV).filter(k=>k!==lastSk);st.sk=lastSk=ks[Math.floor(Math.random()*ks.length)];st.sv=SV[st.sk]}
    const L=[MI].concat(st.era.slice().sort((a,b)=>a.x-b.x).map(e=>e.a)),N=L.length,base=a=>a===MI?MI.kh*.72:a.w.scale.x*.92,hs=L.map(a=>SPAN[a.k]*base(a)*P);
    const gap=L.map((a,i)=>(hs[i]+hs[(i+1)%N])*.93),C=gap.reduce((p,q)=>p+q,0),r=Math.max(110,C/(2*Math.PI));
    st.rr={r,ry:Math.min(67,r*.3),w:-40/r};let acc=0;
    st.ring=L.map((a,i)=>{const th=-Math.PI/2+acc/r;acc+=gap[i];return{a,i,th,isM:a===MI,p0:a.w.position.clone(),s0:a.w.scale.x,ry0:a.w.rotation.y,base:base(a)}});updLoops();
    clipM('walk',.2);for(const e of st.era)clip(e.a,'hop',.2);later(.5,()=>snd('mila',.5))}
  function stepSardana(dA){const t=sardT(),S=st.sv,G=SARD_G,u=ez(c01(t/G));
    st.rot+=st.rr.w*dA*(t<S.in?0:t<S.fi?ez(c01((t-S.in)/.9)):1-ez(c01((t-S.fi)/.8)));
    for(const r of st.ring){const q=ringPos(r);gpos(V1,q.px,q.py,q.z);r.a.w.position.lerpVectors(r.p0,V1,u);
      if(t<G&&!r.isM)r.a.w.position.y+=Math.sin(c01(t/G)*Math.PI)*.3;
      r.a.w.scale.setScalar(lerp(r.s0,r.base*q.s,u));r.a.w.rotation.y=r.ry0+ang(r.ry0,q.face)*u}
    const all=(n,ts)=>{for(const r of st.ring)clip(r.a,n,.35,ts)};
    if(t>=G&&!st.s0){st.s0=1;all('sardana',0)}                       /* rotllana feta: agafats i quiets fins al primer temps */
    if(t>=S.in&&!st.s1){st.s1=1;all('sardana',SARD_TS)}               /* curts */
    if(t>=S.up&&!st.s2){st.s2=1;all('sardana_up',SARD_TS)}            /* llargs, mans enlaire */
    if(t>=S.fi&&!st.s3){st.s3=1;for(const r of st.ring){const a=r.a.A&&r.a.A.sardana_up;if(a)a.warp(SARD_TS,0,.7)}snd('aplaudiment',.55)}  /* acord final: s'aturen amb les mans enlaire */
    if(Math.random()<dA*14)fxp.push({k:'leaf',x:rnd(0,W),y:-20,vx:rnd(-20,20),vy:rnd(70,130),t:0,d:4.5,r:rnd(7,12),rot:rnd(0,6),vr:rnd(-3,3),c:CONF[Math.floor(Math.random()*CONF.length)]});
    if(t>=S.fi+SARD_END){st.ph='back';st.t=0;for(const r of st.ring){r.p0=r.a.w.position.clone();r.s0=r.a.w.scale.x;r.ry0=r.a.w.rotation.y}clipM('walk',.25)}}
  function stepBack(){const t=st.t;
    for(const r of st.ring){if(r.isM){const u=ez(c01(t/1.4));gpos(V1,MILA.x,MILA.y,ZM);MI.w.position.lerpVectors(r.p0,V1,u);MI.w.scale.setScalar(lerp(r.s0,MI.kh,u));
        MI.w.rotation.y=r.ry0+ang(r.ry0,-.5)*u;continue}
      const u=c01((t-r.i*.06)/.45);r.a.w.scale.setScalar(Math.max(.001,r.s0*(1-ez(u))));if(u>=1)r.a.w.visible=false}
    if(t>=1.5){clipM('idle',.3);newGame(true);updLoops()}}

  /* ───── mirada ───── */
  function hit(x,y){if(!st||st.ph!=='ask')return null;for(const w of st.wins)if(Math.abs(x-w.cx)<w.w/2&&Math.abs(y-w.cy)<w.h/2+6)return{k:'win',w};return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.w===b.w);
  const openN=()=>st.wins.filter(q=>(q.state==='opening'||q.state==='open'||q.state==='hide')&&!q.paired).length;
  function actionable(g){if(!g||!st||g.k!=='win'||st.ph!=='ask'||st.busy>0)return false;const w=g.w;if(w.state!=='closed'||w.pop<1)return false;
    return !(MODE===1&&openN()>=2)}
  const pack=w=>({k:'win',w,x:w.cx,y:w.cy});
  /* pista: la parella d'una finestra oberta; si no, una parella ja vista; si no, una finestra tancada qualsevol (fixa fins que s'obre) */
  function hint(){if(!st||st.ph!=='ask'||st.busy>0)return null;const closed=st.wins.filter(w=>w.state==='closed');if(!closed.length)return null;
    for(const o of st.wins)if((o.state==='open'||o.state==='opening')&&!o.paired){const p=partnerOf(o);if(p&&p.state==='closed')return pack(p)}
    if(MODE===1&&openN()>=2)return null;
    for(const an in st.seen)if(st.seen[an].size>=2){const w=st.wins.find(x=>x.an===an&&x.state==='closed');if(w)return pack(w)}
    if(!st.hw||st.hw.state!=='closed')st.hw=closed[Math.floor(Math.random()*closed.length)];return pack(st.hw)}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st||infoOn)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;st.t+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    if(st.busy>0)st.busy-=dA;
    const g=has?hit(wx,wy):null;
    if(!same(g,cur)){cur=g;dw=0}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur={k:'lock'};activate(g)}}else dw=0;
    for(const x of INST)if(x.used){x.mx.update(dA);x.ct+=dA;
      if(x===MI||x.mode==='era'){const g=(GND[x.k]&&GND[x.k][x.cn])||0;x.gy=x.gy==null?g:lerp(x.gy,g,c01(dA*9));x.o.position.y=-x.gy}else if(x.gy){x.gy=0;x.o.position.y=0}}
    stepMila();
    for(const w of st.wins)stepWin(w,dA);
    for(const e of st.era)stepEra(e,dA);
    if(st.ph==='intro'){if(st.t>1.2){st.ph='ask';st.t=0}}
    else if(st.ph==='ask'){evalPairs();if(st.era.length===st.wins.length&&st.wins.every(w=>w.state==='done')&&st.era.every(e=>e.ph==='era'&&e.lt>.9))startSardana()}
    else if(st.ph==='sardana')stepSardana(dA);
    else if(st.ph==='back')stepBack();
    for(const p of fxp){p.t+=dA;if(p.t<0)continue;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA;if(p.rot!=null)p.rot+=p.vr*dA}fxp=fxp.filter(p=>p.t<p.d);
    /* ajuda: als 6 s brilla una finestra; als 12 s la Mila l'assenyala */
    if(st.ph==='ask'&&st.busy<=0&&!st.wins.some(w=>w.state==='opening'||w.state==='hide'||w.state==='leave'||w.state==='closing'))idle+=dA;else idle=0;
    if(idle>HELP*2&&!helpSaid&&hint()){helpSaid=true;clipM('point',.25);tell('mira',2.2)}
    ROOT.updateMatrixWorld(true)}

  /* ───── dibuix ───── */
  function glow(c,x,y,rx,ry_,k=1){const p=.5+.5*Math.sin(now*2.6),g=c.createRadialGradient(x,y,Math.min(rx,ry_)*.5,x,y,Math.max(rx,ry_)+10*p);
    g.addColorStop(0,`rgba(255,244,180,${Math.min(1,(.55+.3*p)*k)})`);g.addColorStop(.75,`rgba(255,236,150,${(.35+.25*p)*k})`);g.addColorStop(1,'rgba(255,236,150,0)');
    c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx+10*p,ry_+8*p,0,0,7);c.fill()}
  function shadowE(c,x,y,rx,ry_,a=.2){c.fillStyle=`rgba(90,50,20,${a})`;c.beginPath();c.ellipse(x,y,rx,ry_,0,0,7);c.fill()}
  function flake(f,x,y,r,a,t){f.save();f.globalAlpha=a;f.translate(x,y);f.rotate(t*1.5);f.strokeStyle='#ffffff';f.lineCap='round';f.lineWidth=Math.max(1.5,r*.22);
    f.shadowColor='rgba(90,140,200,.8)';f.shadowBlur=4;f.beginPath();for(let i=0;i<6;i++){const an=i*Math.PI/3,cx=Math.cos(an),sy=Math.sin(an);f.moveTo(0,0);f.lineTo(cx*r,sy*r);
      f.moveTo(cx*r*.55,sy*r*.55);f.lineTo(Math.cos(an+.5)*r*.8,Math.sin(an+.5)*r*.8);f.moveTo(cx*r*.55,sy*r*.55);f.lineTo(Math.cos(an-.5)*r*.8,Math.sin(an-.5)*r*.8)}f.stroke();f.restore()}
  function drop(f,x,y,r){f.save();f.translate(x,y);f.fillStyle='rgba(120,185,235,.92)';f.strokeStyle='rgba(40,90,150,.55)';f.lineWidth=1.5;f.beginPath();f.moveTo(0,-r*1.7);
    f.bezierCurveTo(r*.9,-r*.4,r,r*.2,r,r*.35);f.arc(0,r*.35,r,0,Math.PI);f.bezierCurveTo(-r,r*.2,-r*.9,-r*.4,0,-r*1.7);f.fill();f.stroke();
    f.fillStyle='rgba(255,255,255,.8)';f.beginPath();f.ellipse(-r*.35,r*.1,r*.22,r*.35,-.4,0,7);f.fill();f.restore()}
  function drawExtras(f){for(const w of st.wins){const a=w.a;if(!a||a.cn!=='win_trick')continue;const t=a.ct,s=w.w/230;
      if(w.an==='ermini'&&a.nas&&t>.1&&t<1.9){a.nas.getWorldPosition(V1);const [nx,ny]=proj(V1),u=c01((t-.1)/.56);
        flake(f,lerp(nx+34*s,nx,ez(u))+Math.sin(u*9)*7*s*(1-u),lerp(w.cy-w.h*.62,ny-6*s,u*u),11*s,1-c01((t-1.55)/.35),t)}
      if(w.an==='salamandra'&&a.head&&t>.36&&t<.8){a.head.getWorldPosition(V1);const [hx,hy]=proj(V1),u=c01((t-.38)/.4);drop(f,hx,lerp(w.cy-w.h*.62,hy-26*s,u*u),8*s)}}}
  function drawP(f,p){if(p.t<0)return;const a=Math.max(0,1-p.t/p.d);f.save();f.globalAlpha=clamp(a*1.6,0,1);f.translate(p.x,p.y);
    if(p.k==='bub'){f.strokeStyle='rgba(225,242,255,.95)';f.lineWidth=2.5;f.beginPath();f.arc(0,0,p.r,0,7);f.stroke();f.fillStyle='rgba(255,255,255,.75)';f.beginPath();f.arc(-p.r*.35,-p.r*.35,p.r*.25,0,7);f.fill()}
    else if(p.k==='drp'){f.fillStyle='rgba(120,185,235,.9)';f.beginPath();f.arc(0,0,p.r,0,7);f.fill()}
    else if(p.k==='snow'){f.fillStyle='#ffffff';f.shadowColor='rgba(90,140,200,.7)';f.shadowBlur=3;f.beginPath();f.arc(0,0,p.r,0,7);f.fill()}
    else if(p.k==='leaf'){f.rotate(p.rot);f.fillStyle=p.c;f.beginPath();f.ellipse(0,0,p.r,p.r*.5,0,0,7);f.fill()}
    f.restore()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&IMF&&IMF.complete)c.drawImage(IMF,0,0,W,H);
    if(!R||!ready||!st)return;
    /* brillantors darrere les finestres i ombres de contacte a l'era */
    const H0=idle>HELP?hint():null;
    for(const w of st.wins){if(H0&&H0.w===w)glow(c,w.cx,w.cy,w.w*.72,w.h*.76,1.2);if(cur&&cur.w===w&&actionable(cur))glow(c,w.cx,w.cy,w.w*.64,w.h*.68,.6)}
    for(const e of st.era){const a=e.a;if(!a.w.visible)continue;const q=proj(a.w.position),air=e.ph==='fly'?Math.sin(c01(e.t/1.05)*Math.PI):0;if(e.ph==='fly'&&e.t<.5)continue;
      shadowE(c,q[0],e.ph==='fly'?lerp(proj(e.p0)[1],proj(e.p1)[1],ez(c01(e.t/1.05))):q[1],.24*a.w.scale.x*P*(1-.5*air),.05*a.w.scale.x*P*(1-.5*air),.2*(1-.6*air))}
    {const q=proj(MI.w.position);shadowE(c,q[0],q[1],.3*MI.w.scale.x*P,.06*MI.w.scale.x*P,.2)}
    R.render(S3,cam);
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    drawExtras(f);
    for(const w of st.wins)if(w.shrug>0){const u=1-w.shrug/1.6;f.save();f.globalAlpha=Math.sin(u*Math.PI);f.fillStyle='#fffaf0';f.strokeStyle='#5a3418';f.lineWidth=5;f.lineJoin='round';
      f.font=`900 ${Math.round(58*Math.max(.8,w.w/230))}px Nunito, "Segoe UI", system-ui, sans-serif`;f.textAlign='center';const x=w.cx+w.w*.36*(w.lookT>0?-1:1),y=w.cy-w.h*.22-u*16;f.strokeText('?',x,y);f.fillText('?',x,y);f.restore()}
    if(MI&&MI.cn==='point'&&H0){const w=H0.w,b=Math.abs(Math.sin(now*4))*12,x=w.cx,y=w.cy-w.h/2-14-b;f.fillStyle='#fff6d8';f.strokeStyle='#7a4a1c';f.lineWidth=4;f.lineJoin='round';
      f.beginPath();f.moveTo(x,y);f.lineTo(x-16,y-22);f.lineTo(x+16,y-22);f.closePath();f.fill();f.stroke()}
    for(const p of fxp)drawP(f,p);f.globalAlpha=1;
    drawCap(f)}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('par.'+c.k);f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=640,y=CAPY-12,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,250,238,.94)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,54,27);f.fill();f.fillStyle='#6a3a12';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+3);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function clearAll(){for(const x of INST)if(x!==MI)give(x);if(MI){MI.mx.stopAllAction();MI.cur=null;MI.cn=''}}
  function layout(){if(!ready)return;clearAll();newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready){clearAll();newGame()}}
  function tray(){if(on)infoBtn(true);const t=$('#tray');t.innerHTML='';['par.m1','par.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  /* ───── informació dels animals (botó ⓘ de #nav, només clic real: s'amaga amb l'ull com la navegació) ───── */
  let infoOn=false,infoM=null;
  function infoBuild(){const L=INF[LANG]||INF.ca,m=infoM;m.innerHTML='';m.setAttribute('aria-label',L.h);
    const pn=document.createElement('div');pn.className='panel ipanel';m.appendChild(pn);
    const hd=document.createElement('div');hd.className='ihead';pn.appendChild(hd);
    const tx=document.createElement('div');hd.appendChild(tx);const h=document.createElement('h2');h.id='infoH';h.textContent=L.h;const p=document.createElement('p');p.textContent=L.p;tx.append(h,p);
    const x=document.createElement('button');x.className='ix dwell';x.type='button';x.setAttribute('aria-label',L.close);x.title=L.close;
    x.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="#1d2a3a" stroke-width="3" stroke-linecap="round"/></svg>';x.onclick=e=>{e.stopPropagation();infoClose()};hd.appendChild(x);
    const g=document.createElement('div');g.className='igrid';pn.appendChild(g);
    INF.order.forEach((k,i)=>{const [t,ls]=L[k],a=document.createElement('article');a.className='icard';
      const im=document.createElement('img');im.alt='';im.src=U('parelles/t/info_'+k+'.webp');
      const h3=document.createElement('h3'),n=document.createElement('span');n.textContent=i+1;h3.append(n,document.createTextNode(t));
      const sc=document.createElement('i');sc.className='isci';sc.textContent=INF.sci[k];a.append(im,h3,sc);
      for(const l of ls){const q=document.createElement('p');q.textContent=l;a.appendChild(q)}g.appendChild(a)});
    const c=document.createElement('button');c.className='btnP dwell';c.type='button';c.textContent=L.close;c.onclick=e=>{e.stopPropagation();infoClose()};pn.appendChild(c)}
  function infoOpen(){if(infoOn||!on)return;if(!infoM){infoM=document.createElement('div');infoM.id='infoM';infoM.className='modal';infoM.setAttribute('role','dialog');infoM.setAttribute('aria-modal','true');
      infoM.addEventListener('click',e=>{if(e.target===infoM)infoClose()});document.body.appendChild(infoM)}
    infoBuild();infoOn=true;infoM.classList.add('on');infoM.querySelector('.igrid').scrollTop=0;updCursor()}
  function infoClose(){if(!infoOn)return;infoOn=false;if(infoM)infoM.classList.remove('on');updCursor()}
  addEventListener('keydown',e=>{if(!infoOn)return;e.stopImmediatePropagation();if(e.key==='Escape'||e.key==='Enter'||e.key===' '){e.preventDefault();infoClose()}},true);
  {const b=document.getElementById('nInfo');if(b){['pointerdown','mousedown','pointerup','mouseup','touchstart'].forEach(ev=>b.addEventListener(ev,e=>e.stopPropagation()));
    b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(e.isTrusted)infoOpen()})}}
  function infoBtn(v){const b=document.getElementById('nInfo');if(!b)return;b.hidden=!v;if(v){const t=(INF[LANG]||INF.ca).btn;b.setAttribute('aria-label',t);b.title=t}}
  function start(){init();on=true;first=true;cvs.style.display='block';fgc.style.display='block';tray();infoBtn(true);if(ready)layout()}
  function stop(){on=false;infoClose();infoBtn(false);vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  function mus(){return st&&(st.ph==='sardana'||st.ph==='back')?st.sk||'m_par_sardana':'m_parelles'}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,infoOpen,infoClose,info:()=>infoOn,toggle(){setMode(1-MODE)},setMode,mus,amb:()=>null,hit,hint,activate,actionable,scr,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},get MI(){return MI},INST,IX,proj}
})();
