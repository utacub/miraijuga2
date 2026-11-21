/* =========================================================
   ESCENARI: QUIN TEMPS FA?
   En Bru (gosset de pelfa 3D fet amb Blender) al prat de paper (fons 2D de Marc). El cel, els núvols, el sol, l'arc
   de Sant Martí i la pluja, la neu i les fulles es pinten per codi en 2D; en Bru, els seus objectes, el ninot de neu
   i el molinet són 3D (three.js), amb càmera ortogràfica fixa inclinada 8° (cap zoom ni moviment de càmera).
   «Fes el temps»: les icones del temps pengen d'una corda; mirar-ne una canvia el temps (el paisatge, en Bru i el que
     porta) i apareixen coses per mirar (flors, ocell, núvol, bassal, cargol, ninot de neu en 3 mirades, estel,
     molinet i el mateix Bru, que reacciona segons el temps). Mida gran: sol, pluja i neu; mitjana: + vent;
     petita: + núvols, arc de Sant Martí i tempesta suau (sense llamps: només un tro llunyà).
   «Què s'emporta en Bru?»: fa un temps i al penjador hi ha 2/3/4 objectes. L'encertat vola cap a en Bru, que se'l
     posa i juga; l'equivocat se'l prova de manera còmica, fa que no i el torna (sense so d'error). Cada 4 sortides,
     festa amb arc de Sant Martí.
   Ajuda: als 6 s brilla el que toca; als 12 s en Bru ho assenyala (o mira la corda). Els ulls d'en Bru segueixen la
   mirada de l'infant.
   ========================================================= */
const TEMPS=(()=>{
  const TX={
    ca:{m1:'Fes el temps',m2:"Què s'emporta en Bru?",sol:'Fa sol!',nuvols:'Està ennuvolat',pluja:'Plou!',neu:'Neva!',vent:'Fa vent!',arc:'Un arc de Sant Martí!',tempesta:'Fa tempesta',q:"Què s'emporta en Bru?",be:'Molt bé!',bebru:'Molt bé, Bru!'},
    es:{m1:'Haz el tiempo',m2:'¿Qué se lleva Bru?',sol:'¡Hace sol!',nuvols:'Está nublado',pluja:'¡Llueve!',neu:'¡Nieva!',vent:'¡Hace viento!',arc:'¡Un arcoíris!',tempesta:'Hay tormenta',q:'¿Qué se lleva Bru?',be:'¡Muy bien!',bebru:'¡Muy bien, Bru!'},
    eu:{m1:'Sortu eguraldia',m2:'Zer eramango du Bruk?',sol:'Eguzkia dago!',nuvols:'Hodeitsu dago',pluja:'Euria ari du!',neu:'Elurra ari du!',vent:'Haizea dabil!',arc:'Ortzadar bat!',tempesta:'Ekaitza dago',q:'Zer eramango du Bruk?',be:'Oso ondo!',bebru:'Oso ondo, Bru!'},
    gl:{m1:'Fai o tempo',m2:'Que leva Bru?',sol:'Fai sol!',nuvols:'Está anubrado',pluja:'Chove!',neu:'Neva!',vent:'Fai vento!',arc:'Un arco da vella!',tempesta:'Hai treboada',q:'Que leva Bru?',be:'Moi ben!',bebru:'Moi ben, Bru!'},
    en:{m1:'Make the weather',m2:'What will Bru take?',sol:"It's sunny!",nuvols:"It's cloudy",pluja:"It's raining!",neu:"It's snowing!",vent:"It's windy!",arc:'A rainbow!',tempesta:"It's stormy",q:'What will Bru take?',be:'Well done!',bebru:'Well done, Bru!'},
    fr:{m1:'Fais la météo',m2:"Qu'est-ce que Bru emporte ?",sol:'Il y a du soleil !',nuvols:"C'est nuageux",pluja:'Il pleut !',neu:'Il neige !',vent:'Il y a du vent !',arc:'Un arc-en-ciel !',tempesta:"Il y a de l'orage",q:"Qu'est-ce que Bru emporte ?",be:'Bravo !',bebru:'Bravo, Bru !'}};
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['temps.'+k]=TX[l][k];
  /* temps: degradat del cel, núvols [imatge, x, y, escala], enfosquiment, partícules i arranjament de la música */
  const WX={
    sol:{sky:['#5fb6ec','#cdeeff'],cl:[['n2',260,250,.9],['n1',900,215,.8]],dark:0,sun:1,mus:'sol',amb:['w_prat',.4]},
    nuvols:{sky:['#93abc0','#dfe7ee'],cl:[['n0',150,250,1],['n3',420,200,1],['n1',700,250,1.1],['n0',1000,215,1],['n3',1180,270,.9]],dark:.06,mus:'sol',amb:['w_prat',.3]},
    pluja:{sky:['#7c90a4','#c4cfd9'],cl:[['n4',200,215,1.1],['n3',520,250,1],['n4',860,205,1.15],['n3',1150,250,1]],dark:.12,rain:150,mus:'pluja',amb:['w_pluja',.5]},
    neu:{sky:['#aebdcc','#eef2f7'],cl:[['n3',220,230,1],['n0',600,210,1],['n3',1000,240,1.05]],dark:.03,snow:140,mus:'neu',amb:['w_vent',.12]},
    vent:{sky:['#6fbce9','#d8f0fb'],cl:[['n1',200,230,.8],['n2',640,200,.9],['n1',1050,250,.8]],dark:0,leaves:26,cv:60,mus:'vent',amb:['w_vent',.5]},
    arc:{sky:['#7dc6f2','#e2f5ff'],cl:[['n2',180,260,.8],['n1',1080,240,.7]],dark:0,arc:1,sun:.6,mus:'sol',amb:['w_prat',.4]},
    tempesta:{sky:['#55657a','#949fad'],cl:[['n5',150,225,1.2],['n4',480,200,1.2],['n5',820,215,1.25],['n4',1150,235,1.15]],dark:.24,rain:260,storm:1,mus:'pluja',amb:['w_pluja',.75]}};
  const SIZES=[{wx:['sol','pluja','neu'],items:1,icon:200,opts:2},{wx:['sol','pluja','neu','vent'],items:2,icon:170,opts:3},
    {wx:['sol','nuvols','pluja','neu','vent','arc','tempesta'],items:3,icon:140,opts:4}];
  /* coses per mirar de cada temps (la mida en mostra 1/2/3) i on són */
  const ITEMS={sol:['flors','bru','ocell'],nuvols:['nuvol','bru','ocell'],pluja:['bassal','cargol','bru'],neu:['ninot','bru','ocell'],vent:['estel','molinet','bru'],arc:['ocell','bru','flors'],tempesta:['bru','bassal','cargol']};
  const POS={flors:[380,612],ocell:[1075,566],nuvol:[860,300],bassal:[390,640],cargol:[935,640],ninot:[385,625],estel:[0,0],molinet:[385,630],bru:[0,0]};
  const BOX={flors:[230,190],ocell:[150,190],nuvol:[290,170],bassal:[260,120],cargol:[220,180],ninot:[220,270],estel:[200,250],molinet:[180,250]};
  const OBJ={sol:'ulleres',pluja:'paraigua',neu:'bufanda',vent:'estel'},OBS=['ulleres','paraigua','bufanda','estel'];
  const META={fons:[1672,941],fons_neu:[1672,941],i_sol:[218,228],i_nuvols:[221,191],i_pluja:[213,220],i_neu:[209,211],i_vent:[224,202],i_arc:[262,192],i_tempesta:[217,227],
    n0:[335,231],n1:[329,167],n2:[168,144],n3:[244,192],n4:[328,233],n5:[334,235],bassal:[267,128],cargol:[264,232],ocell:[157,213],ocell_vola:[200,175],
    flor_tancada:[134,208],flor_oberta:[149,244],penjador:[1182,261],pinca:[51,153]};
  const CLH={n0:200,n1:167,n2:144,n3:192,n4:200,n5:200};
  const P=250,PIT=8*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT);
  const HELP=6,BX1=640,BX2=370,BY=630,RACKY=604,RACKBY=650,ROPE=100;   // la corda va per sota del títol i dels botons de mode
  const MODELS=['bru','ulleres','paraigua','bufanda','bufanda_posada','gorro','estel','ninot','molinet'];
  const TXOF=k=>k==='bru'?'bru':(k==='ninot'||k==='molinet')?'prat':'objectes';
  /* objectes al penjador: part de la caixa que ocupen, mida de referència del model i centre sobre l'origen (unitats) */
  const RKD={ulleres:{f:.95,ref:.43,c:0},paraigua:{f:.9,ref:1.25,c:.496},bufanda:{f:.88,ref:.513,c:-.22},estel:{f:.95,ref:1.325,c:-.343}};
  const RKUMB=.3;   // al penjador el paraigua és mig obert (tancat del tot és massa prim per reconèixer-lo)
  const SOCK={ulleres:'s_ulleres',paraigua:'ma_E',bufanda_posada:'s_bufanda',gorro:'s_gorro'};
  const CLIPEV={posar:[['posat',.667]],saltar_bassal:[['esquitx',.833]],angel_neu:[['terra',.583],['amunt',3.167]],lladrar:[['bub',.167]]};
  const LOOPS=new Set(['repos','content','estel','fred','ballar','aixoplugat','caminar']);
  const NOEYE=new Set(['mirar_amunt','angel_neu','posar','no']);
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,NL=0,ENV=null,amb,sun,ROOT;
  const PROTO={},CL={},MAT={},TXS={},IM={},OB={};
  let st=null,B=null,NIN=null,MOL=null,PM=[],now=0,cur=null,dw=0,idle=0,acts=0,outs=0,wait=[],tw=[],fl=[],fxp=[],conf=[],helpT=0,umbV=0,umbT=0,umbS=1,tok=0;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lerp=(a,b,t)=>a+(b-a)*t;
  const TP=new THREE.Vector3(),TQ=new THREE.Quaternion(),V1=new THREE.Vector3(),V2=new THREE.Vector3(),E1=new THREE.Euler();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3t';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3tf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.38);sun=new THREE.DirectionalLight(0xffffff,1.15);sun.position.set(-3,5,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    const TL=new THREE.TextureLoader();
    for(const t of ['bru','objectes','prat'])for(const s of ['color','normal']){const x=TL.load(U('temps/'+t+'_'+s+'.webp'));x.flipY=false;if(s==='color')x.colorSpace=THREE.SRGBColorSpace;TXS[t+'_'+s]=x}
    for(const k in META)if(!IM[k])IM[k]=img('temps/'+k+'.webp');
    const L=new GLTFLoader();
    for(const k of MODELS)L.load(U('temps/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name]=c;
      const tx=TXOF(k);g.scene.traverse(n=>{if(n.isMesh){n.userData.mn=n.material&&n.material.name;n.userData.tx=tx;n.frustumCulled=false}});
      if(++NL===MODELS.length){prep();ready=true;quality();if(on)layout()}},undefined,e=>console.error(e));
    resize()}
  function prep(){const o=PROTO.bru;
    B={o,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',next:null,cb:null,ct:0,ev:[],bone:{},x:BX1,y:BY,ry:0,tr:0,goal:null,busy:0,eye:[0,0],eyeOn:false,holdW:0,until:0,untilF:null,onPosat:null};
    for(const n in CL.bru)B.A[n]=B.mx.clipAction(CL.bru[n]);
    o.traverse(n=>{if(n.isBone)B.bone[n.name]=n});
    /* el braç E aguanta el paraigua enlaire mentre en Bru fa altres coses: pistes del braç del clip «aixoplugat» amb molt de pes */
    const ax=CL.bru.aixoplugat;B.hold=B.mx.clipAction(new THREE.AnimationClip('agafa',ax.duration,ax.tracks.filter(t=>/^(brac_E|ma_E)\./.test(t.name))));
    B.hold.setEffectiveWeight(0);B.hold.play();
    for(const k of ['ulleres','paraigua','bufanda','bufanda_posada','gorro','estel']){const p=PROTO[k],x=OB[k]={k,o:p,mx:null,A:{},st:'off',vis:0,tv:0,rx:0,sx:0,rs:160,ss:160,tk:0};
      if(Object.keys(CL[k]).length){x.mx=new THREE.AnimationMixer(p);for(const n in CL[k])x.A[n]=x.mx.clipAction(CL[k][n])}}
    PROTO.paraigua.traverse(n=>{if(n.isMesh&&n.morphTargetDictionary&&n.morphTargetDictionary.tancat!==undefined)PM.push(n)});
    NIN={o:PROTO.ninot,pc:['ninot_base','ninot_cos','ninot_cap'].map(n=>PROTO.ninot.getObjectByName(n)),k:0,wig:0};
    MOL={o:PROTO.molinet,rot:PROTO.molinet.getObjectByName('molinet_rotor'),k:0}}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials pel nom (provats a blender/test_three): alta = relleu + RoomEnvironment; ràpid = Lambert/Phong ───── */
  function mk(name,tx){const c=TXS[tx+'_color'],nm=TXS[tx+'_normal'],D=THREE.DoubleSide,V=(a,b)=>new THREE.Vector2(a,b);
    if(name==='ghost')return new THREE.MeshBasicMaterial({map:c,transparent:true,opacity:.34,alphaTest:.25,depthWrite:false,side:D,toneMapped:false});
    if(LOWQ){if(name==='pelfa'||name==='llana')return new THREE.MeshLambertMaterial({map:c});
      if(name==='vidre')return new THREE.MeshBasicMaterial({color:0x3a2a24,transparent:true,opacity:.6});
      if(name==='feltre')return new THREE.MeshLambertMaterial({map:c,side:D});
      if(name==='brillant')return new THREE.MeshPhongMaterial({map:c,shininess:60,specular:0x444444});
      if(name==='retall')return new THREE.MeshLambertMaterial({map:c,alphaTest:.5,side:D});
      return new THREE.MeshPhongMaterial({map:c,shininess:90,specular:0x555555})}
    if(name==='pelfa'||name==='llana')return new THREE.MeshPhysicalMaterial({map:c,normalMap:nm,normalScale:V(.45,-.45),roughness:.95,metalness:0,sheen:.25,sheenRoughness:.5,sheenColor:new THREE.Color(1,.8,.6),envMap:ENV,envMapIntensity:.3});
    if(name==='vidre')return new THREE.MeshStandardMaterial({color:0x3a2a24,transparent:true,opacity:.62,roughness:.08,metalness:0,envMap:ENV,envMapIntensity:1.2});
    if(name==='feltre')return new THREE.MeshStandardMaterial({map:c,normalMap:nm,normalScale:V(.6,-.6),roughness:.95,metalness:0,envMap:ENV,envMapIntensity:.3,side:D});
    if(name==='brillant')return new THREE.MeshStandardMaterial({map:c,roughness:.3,metalness:0,envMap:ENV,envMapIntensity:.8});
    if(name==='retall')return new THREE.MeshStandardMaterial({map:c,alphaTest:.5,normalMap:nm,normalScale:V(1,-1),roughness:.92,metalness:0,envMap:ENV,envMapIntensity:.3,side:D});
    return new THREE.MeshStandardMaterial({map:c,roughness:.16,metalness:0,envMap:ENV,envMapIntensity:.9})}
  const M=(name,tx)=>{const k=name+'|'+tx;return MAT[k]||(MAT[k]=mk(name,tx))};
  function paint(o){o.traverse(n=>{if(n.isMesh)n.material=M(n.userData.ghost?'ghost':n.userData.mn,n.userData.tx)})}
  function quality(){if(!R||!ready)return;lq=LOWQ;for(const k in MAT){MAT[k].dispose();delete MAT[k]}
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const k in PROTO)paint(PROTO[k])}
  function lights(){const d=st?lerp(WX[st.pw].dark,WX[st.w].dark,ease(st.tr)):0,k=1-d*1.2;amb.intensity=(LOWQ?1.05:.38)*k;sun.intensity=(LOWQ?1.4:1.15)*k}

  /* ───── pantalla (px) ↔ món ───── */
  const gpos=(px,py)=>new THREE.Vector3((px-640)/P,0,(py-360)/(P*SP));
  const placeV=(v,px,py,by)=>v.set((px-640)/P,(by-py)/(CP*P),(by-360)/(P*SP));
  const proj=v=>[640+v.x*P,360+v.z*SP*P-v.y*CP*P];
  function later(t,f){wait.push({t:now+t,f})}
  function sz(){return SIZES[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

  /* ───── veus (ElevenLabs, un fitxer per frase i idioma: temps/v/<idioma>_<clau>.mp3) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('temps/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),140)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}

  /* ───── en Bru: clips, esdeveniments, caminar, ulls ───── */
  function idleClip(){if(MODE===1){const m=st&&st.m2;return m&&m.worn==='paraigua'?'aixoplugat':m&&m.worn==='estel'?'estel':'repos'}
    const w=st?st.w:'sol';return w==='pluja'||w==='tempesta'?'aixoplugat':w==='vent'?'estel':'repos'}
  /* clip(n, fos, després, en acabar): els clips sense bucle tornen sols al de repòs del temps (o a «després») */
  function clip(n,fd=.25,then,cb){if(!B||!B.A[n])return;const a=B.A[n],p=B.cur,loop=LOOPS.has(n);B.until=0;B.untilF=null;
    if(p===a&&loop){B.next=null;B.cb=null;return}
    a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);a.clampWhenFinished=!loop;a.setEffectiveWeight(1);a.play();
    if(p&&p!==a){if(fd>0)p.crossFadeTo(a,fd,false);else p.stop()}
    B.cur=a;B.cn=n;B.ct=0;B.next=loop?null:(then||'_idle');B.cb=cb||null;B.ev=(CLIPEV[n]||[]).map(([k,t])=>({k,t}))}
  function loopFor(n,s,f){clip(n,.25);B.until=now+s;B.untilF=f||null}
  function bruEv(k){
    if(k==='posat'&&B.onPosat){const f=B.onPosat;B.onPosat=null;f()}
    if(k==='esquitx'){splash(B.x+8,B.y+6,18);play('w_esquitx',.85,rnd(.95,1.05));st.rip=1}
    if(k==='terra'){puff(B.x,B.y-10,18);play('w_angel',.8)}
    if(k==='amunt')puff(B.x,B.y-6,10);
    if(k==='bub')play('w_lladruc',.8,rnd(.95,1.08))}
  function stepBru(dA,has,wx,wy){const b=B;b.ct+=dA*(b.cur?b.cur.timeScale:1);
    for(const e of b.ev)if(!e.done&&b.ct>=e.t){e.done=1;bruEv(e.k)}
    if(b.until&&now>=b.until){const f=b.untilF;b.until=0;b.untilF=null;clip(idleClip(),.3);f&&f()}
    if(b.next&&b.cur&&b.ct>=b.cur.getClip().duration-.02){const n=b.next==='_idle'?idleClip():b.next,f=b.cb,a0=b.cur;b.next=null;b.cb=null;if(f)f();if(b.cur===a0)clip(n,.25)}
    if(b.goal){const g=b.goal,dx=g.x-b.x,dy=g.y-b.y,d=Math.hypot(dx,dy);
      if(d>3){b.tr=Math.sign(dx||1)*Math.PI/2;if(b.cn!=='caminar')clip('caminar',.2);if(Math.abs(b.ry-b.tr)<.7){const s=Math.min(d,230*dA);b.x+=dx/d*s;b.y+=dy/d*s}}
      else{b.goal=null;b.tr=0;g.f&&g.f()}}
    b.ry+=(b.tr-b.ry)*Math.min(1,dA*9);b.o.position.copy(gpos(b.x,b.y));b.o.rotation.y=b.ry+(b.sp?spinA(b.sp,now-b.spT):0);if(b.sp&&now-b.spT>b.sp.t0+b.sp.d)b.sp=null;
    b.holdW+=((OB.paraigua.st==='worn'&&b.cn!=='aixoplugat'?14:0)-b.holdW)*Math.min(1,dA*8);b.hold.setEffectiveWeight(b.holdW);
    b.mx.update(dA);
    /* els ulls segueixen la mirada de l'infant (valors absoluts després del mesclador: les pistes constants no es reescriuen) */
    const ok=has&&Math.abs(b.ry)<.3&&!NOEYE.has(b.cn),hx=b.x,hy=b.y-.8*P*CP;
    const ey=ok?clamp((wx-hx)/330,-1,1)*.3:0,ex=ok?clamp((wy-hy)/330,-1,1)*.22:0;
    b.eye[0]+=(ex-b.eye[0])*Math.min(1,dA*7);b.eye[1]+=(ey-b.eye[1])*Math.min(1,dA*7);
    if(!NOEYE.has(b.cn)||b.eyeOn){for(const s of ['E','D']){const u=b.bone['ull_'+s];u.rotation.x=NOEYE.has(b.cn)?0:b.eye[0];u.rotation.y=NOEYE.has(b.cn)?0:b.eye[1]}b.eyeOn=!NOEYE.has(b.cn)}
    b.o.updateMatrixWorld(true)}

  /* ───── objectes: posar, treure, volar, aparèixer ───── */
  function toRoot(x){const o=x.o;if(o.parent!==ROOT){if(o.parent)ROOT.attach(o);else ROOT.add(o)}}
  function wear(x,bone){const o=x.o;B.bone[bone].add(o);o.position.set(0,0,0);o.quaternion.identity();o.scale.setScalar(1);x.st='worn'}
  function off(x){x.o.removeFromParent();x.st='off';x.vis=0;if(x.mx)x.mx.stopAllAction();fl=fl.filter(f=>f.x!==x);tw=tw.filter(t=>t.o!==x.o)}
  function pop(o,s1=1,d=.35,delay=0,done){tw=tw.filter(t=>t.o!==o);tw.push({o,t:-delay,d,s0:o.scale.x,s1,done})}
  function shrinkOff(x,d=.3){const t0=++x.tk;pop(x.o,.001,d,0,()=>{if(x.tk===t0)off(x)})}
  function stepTw(dA){for(const t of tw.slice()){t.t+=dA;if(t.t<0)continue;const u=Math.min(1,t.t/t.d);t.o.scale.setScalar(Math.max(.001,lerp(t.s0,t.s1,t.s1>t.s0?eBack(u):eOut(u))));
      if(u>=1){tw.splice(tw.indexOf(t),1);t.done&&t.done()}}}
  function fly(x,to,d,h,done){toRoot(x);const o=x.o;x.st='fly';x.tk++;tw=tw.filter(t=>t.o!==o);fl=fl.filter(f=>f.x!==x);
    fl.push({x,p0:o.position.clone(),q0:o.quaternion.clone(),s0:o.scale.x,to,d,h,t:0,done})}
  function stepFly(dA){for(const f of fl.slice()){f.t+=dA;const u=Math.min(1,f.t/f.d),e=ease(u),T=f.to(),o=f.x.o;
      o.position.lerpVectors(f.p0,T.p,e);o.position.y+=Math.sin(u*Math.PI)*f.h;o.quaternion.slerpQuaternions(f.q0,T.q,e);o.scale.setScalar(lerp(f.s0,T.s,e));
      if(u>=1){fl.splice(fl.indexOf(f),1);f.done&&f.done()}}}
  const boneTo=n=>()=>{const b=B.bone[n];b.getWorldPosition(TP);b.getWorldQuaternion(TQ);return{p:TP,q:TQ,s:1}};
  function rackS(x){const d=RKD[x.k];return d.f*x.rs/(d.ref*P)}
  function rackT(x,i){const s=rackS(x),d=RKD[x.k],cy=RACKY-x.rs*.5-4+Math.sin(now*1.6+x.rx*.01)*3;placeV(TP,x.rx,cy+d.c*s*P*CP,RACKBY);
    TQ.setFromEuler(E1.set(0,Math.sin(now*.9+x.rx*.013)*.38,0));return{p:TP,q:TQ,s}}
  function kitePos(){const it=st.items.find(i=>i.k==='estel'&&!i.out),bo=(it&&it.act?Math.sin(clamp(it.at/2.4,0,1)*Math.PI):0)+(st.kb||0);
    return MODE===1?[B.x+175+Math.sin(now*1.3)*20+bo*40,290+Math.sin(now*1.7)*14-bo*45]:[B.x+270+Math.sin(now*1.3)*25+bo*60,392+Math.sin(now*1.7)*16-bo*60]}
  function kiteT(){const [kx,ky]=kitePos();placeV(TP,kx,ky,B.y);TQ.setFromEuler(E1.set(0,0,-.25+Math.sin(now*2)*.12));return{p:TP,q:TQ,s:.6}}
  function umb(v){umbV=umbT=v;for(const m of PM)m.morphTargetInfluences[m.morphTargetDictionary.tancat]=v}
  function umbTo(v,d){umbT=v;umbS=1/d}
  function stepUmb(dA){if(umbV===umbT)return;umbV=umbT>umbV?Math.min(umbT,umbV+dA*umbS):Math.max(umbT,umbV-dA*umbS);for(const m of PM)m.morphTargetInfluences[m.morphTargetDictionary.tancat]=umbV}
  /* mode 1: en Bru es vesteix segons el temps (paraigua, gorro i bufanda, estel); les ulleres, quan se'l mira amb sol */
  function dress(w,delay=.7){const want=new Set(w==='pluja'||w==='tempesta'?['paraigua']:w==='neu'?['gorro','bufanda_posada']:w==='vent'?['estel']:[]),t0=++tok;
    for(const k of ['ulleres','paraigua','gorro','bufanda_posada','estel']){const x=OB[k];if(!want.has(k)&&x.st!=='off')shrinkOff(x)}
    later(delay,()=>{if(t0!==tok||!st||MODE!==0)return;let any=0;
      for(const k of want){const x=OB[k];if(x.st==='worn'||x.st==='sky'){x.tk++;pop(x.o,k==='estel'?.6:1,.2);continue}any=1;
        if(k==='estel'){toRoot(x);x.st='sky';const T=kiteT();x.o.position.copy(T.p);x.o.quaternion.copy(T.q);x.o.scale.setScalar(.001);pop(x.o,.6,.45);x.A.volar.reset().play()}
        else{wear(x,SOCK[k]);x.o.scale.setScalar(.001);pop(x.o,1,.4);if(k==='paraigua'){umb(1);later(.4,()=>{if(x.st==='worn'&&t0===tok){umbTo(0,.4);play('w_paraigua',.7)}})}}}
      if(any)play('w_posar',.6)})}

  /* ───── estat i rondes ───── */
  function newGame(){if(!ready)return;clearAll();
    st={w:'sol',pw:'sol',tr:1,snow:0,items:[],cap:null,thunder:8,m2:null,kb:0,rip:0,parts:[],clouds:[]};outs=0;
    B.x=MODE===0?BX1:BX2;B.y=BY;B.ry=B.tr=0;B.goal=null;B.busy=0;ROOT.add(B.o);clip('repos',0);
    makeParts();
    if(MODE===0){setItems();st.cap={keys:['sol'],d:2.8};say(['sol']);dress('sol',.1)}else newAsk();
    if(typeof updLoops==='function')updLoops()}
  function clearAll(){wait=[];tw=[];fl=[];fxp=[];conf=[];idle=0;cur=null;dw=0;helpT=0;tok++;vStop();
    for(const k in OB){const x=OB[k];if(x.st!=='off')off(x)}
    if(NIN){NIN.o.removeFromParent();NIN.k=0}if(MOL){MOL.o.removeFromParent();MOL.k=0}
    if(B){B.onPosat=null;B.until=0;B.untilF=null;B.next=null;B.cb=null;B.goal=null;B.busy=0}umb(1)}
  function makeParts(){const N=LOWQ?.5:1,p=st.parts=[];
    for(let i=0;i<Math.round(260*N);i++)p.push({t:'r',x:rnd(0,W),y:rnd(-H,H),v:rnd(700,950),l:rnd(14,24)});
    for(let i=0;i<Math.round(140*N);i++)p.push({t:'s',x:rnd(0,W),y:rnd(-H,H),v:rnd(40,80),r:rnd(2.5,6),ph:rnd(0,6)});
    for(let i=0;i<Math.round(26*N);i++)p.push({t:'l',x:rnd(-W,W),y:rnd(250,620),v:rnd(260,420),r:rnd(0,6),c:i%3});
    st.clouds=[];for(const w in WX)WX[w].cl.forEach(c=>st.clouds.push({w,k:c[0],x:c[1],y:c[2],s:c[3],ox:0}))}
  function setWeather(w){if(!st||w===st.w)return;st.pw=st.w;st.w=w;st.tr=0;idle=0;helpT=0;
    [0,4,7,12].forEach((n,i)=>play('w_nota',.32,Math.pow(2,n/12),i*.09));if(WX[w].storm)st.thunder=3;
    if(MODE===0){st.cap={keys:[w],d:2.8};say([w]);setItems();dress(w);if(!B.busy&&!B.goal)clip('mirar_amunt',.3)}
    if(typeof updLoops==='function')updLoops()}
  function setItems(){for(const it of st.items)it.out=1;
    const list=ITEMS[st.w].slice(0,sz().items),D3=new Set(['ninot','molinet']);
    st.items=st.items.filter(it=>!(D3.has(it.k)&&list.includes(it.k)));
    for(const k of list){const it={k,x:POS[k][0],y:POS[k][1],t:0,in:0,out:0,act:0,at:0,n:0,w:st.w};st.items.push(it);
      if(k==='ninot'){ROOT.add(NIN.o);NIN.o.position.copy(gpos(it.x,it.y));NIN.o.scale.setScalar(.001);NIN.wig=0;for(const p of NIN.pc){p.traverse(n=>{if(n.isMesh)n.userData.ghost=true});p.scale.setScalar(1)}paint(NIN.o)}
      if(k==='molinet'){ROOT.add(MOL.o);MOL.o.position.copy(gpos(it.x,it.y));MOL.o.scale.setScalar(.001);MOL.boost=0}}}

  /* ───── mode 2: el penjador ───── */
  function newAsk(){const prev=st.m2&&st.m2.w,w=pick(['sol','pluja','neu','vent'].filter(x=>x!==prev)),n=sz().opts;
    let ob=shuffle(OBS.filter(o=>o!==OBJ[w])).slice(0,n-1);ob.push(OBJ[w]);ob=shuffle(ob);
    const sp={2:300,3:230,4:180}[n],s={2:230,3:190,4:160}[n];
    st.m2={w,objs:ob,phase:'ask',t:0,sel:null,worn:null,id:++tok};
    for(const k of OBS){const x=OB[k],i=ob.indexOf(k);
      if(i<0){x.tv=0;continue}
      x.tv=1;x.sx=880+(i-(n-1)/2)*sp;x.ss=s;
      if(x.st==='off'){toRoot(x);x.st='rack';x.vis=0;x.rx=x.sx;x.rs=s;if(k==='paraigua')umb(RKUMB)}}
    setWeather(w);idle=0;st.cap={keys:[w,'q'],d:1e9};later(.5,()=>{if(st&&st.m2&&st.m2.w===w&&st.m2.phase==='ask')say([w,'q'])});
    if(!B.goal)clip('repos',.3)}
  function stepRack(dA){for(const k of OBS){const x=OB[k];if(x.st!=='rack')continue;
      x.vis+=((x.tv?1:0)-x.vis)*Math.min(1,dA*(x.tv?5:7));x.rx+=(x.sx-x.rx)*Math.min(1,dA*6);x.rs+=(x.ss-x.rs)*Math.min(1,dA*6);
      if(!x.tv&&x.vis<.02){off(x);continue}
      const T=rackT(x),k2=x.tv?eBack(Math.min(1,x.vis)):x.vis;x.o.position.copy(T.p);x.o.quaternion.copy(T.q);x.o.scale.setScalar(Math.max(.001,T.s*k2))}}
  function objBox(x){return{x0:x.rx-x.rs*.62,x1:x.rx+x.rs*.62,y0:RACKY-x.rs*1.15,y1:RACKY+12}}
  function choose(x){const m=st.m2;if(m.phase!=='ask')return;idle=0;m.sel=x.k;m.t=0;play('w_fiu',.6);vStop();
    if(x.k===OBJ[m.w]){m.phase='go';st.cap=null;goRight(x,m)}else{m.phase='wrong';goWrong(x,m)}}
  /* l'objecte vola cap a en Bru; amb les ulleres i la bufanda, en Bru fa «posar» i l'objecte arriba quan té les mans al cap */
  function putOn(x,m,after){const k=x.k;
    if(k==='ulleres'||k==='bufanda'){clip('posar',.2);fly(x,boneTo(k==='ulleres'?'s_ulleres':'s_bufanda'),.62,.45,()=>{
        if(k==='ulleres')wear(x,'s_ulleres');else{off(x);const a=OB.bufanda_posada,g=OB.gorro;wear(a,'s_bufanda');wear(g,'s_gorro');a.o.scale.setScalar(.6);g.o.scale.setScalar(.001);pop(a.o,1,.25);pop(g.o,1,.35,.05)}
        play('w_posar',.7);m.worn=k;after()})}
    else if(k==='paraigua')fly(x,boneTo('ma_E'),.6,.45,()=>{wear(x,'ma_E');m.worn=k;after()});
    else fly(x,m.phase==='wrong'?()=>{placeV(TP,B.x+70,B.y-185,B.y+40);TQ.setFromEuler(E1.set(0,0,-.3));return{p:TP,q:TQ,s:.38}}:kiteT,m.phase==='wrong'?.55:.9,.6,()=>{x.st=m.phase==='wrong'?'hover':'sky';m.worn=k;after()})}
  function takeOff(x,m,d,done){const k=x.k;m.worn=null;
    if(k==='bufanda'){shrinkOff(OB.bufanda_posada,.25);shrinkOff(OB.gorro,.25);const b=B.bone.s_bufanda;ROOT.add(x.o);b.getWorldPosition(x.o.position);b.getWorldQuaternion(x.o.quaternion);x.o.scale.setScalar(1)}
    if(k==='estel'&&x.A.volar)x.A.volar.stop();
    fly(x,()=>rackT(x),d,.5,()=>{x.st='rack';x.vis=1;done&&done()})}
  function goRight(x,m){const id=m.id,ok=()=>st&&st.m2===m;
    putOn(x,m,()=>{if(!ok())return;m.arr=m.t;play('w_be',.75);say(['be']);
      if(x.k==='paraigua'){umbTo(0,.4);play('w_paraigua',.75);clip('aixoplugat',.25)}
      if(x.k==='estel'){x.A.volar.reset().play();clip('estel',.3);play('w_estel',.6)}})}
  function goWrong(x,m){const ok=()=>st&&st.m2===m;
    putOn(x,m,()=>{if(!ok())return;clip('no',.15);m.wa=m.t;
      later(2.05,()=>{if(!ok())return;takeOff(x,m,.55,()=>{if(ok()&&m.phase==='wrong'){m.phase='ask';m.sel=null;idle=0}})})})}
  function stepM2(dA){const m=st.m2;if(!m)return;m.t+=dA;
    if(m.phase==='go'&&m.arr!==undefined){const k=m.worn,need=(k==='ulleres'||k==='bufanda')?2.05:m.arr+.7;
      if(m.t>=need){m.phase='play';m.t=0;
        if(m.w==='sol'){loopFor('content',4);m.pd=4;play('w_lladruc',.6,1.15)}
        if(m.w==='pluja'){clip('saltar_bassal',.2,null,()=>clip('saltar_bassal',.1));m.pd=3.3}
        if(m.w==='neu'){clip('angel_neu',.25);m.pd=4.1}
        if(m.w==='vent'){m.pd=4;play('w_estel',.6)}}}
    if(m.phase==='play'){st.kb=m.w==='vent'?Math.max(0,Math.sin(m.t/m.pd*Math.PI*2))*.8:0;
      if(m.w==='sol'&&Math.random()<dA*6)sparkle(B.x+rnd(-90,90),B.y-rnd(60,260));
      if(m.t>=m.pd){m.phase='back';m.t=0;st.kb=0;const x=OB[m.worn==='bufanda'?'bufanda':m.worn];
        if(m.worn==='paraigua'){umbTo(RKUMB,.3);later(.3,()=>{if(st&&st.m2===m)takeOff(x,m,.8)});clip('repos',.4)}else{takeOff(x,m,.8);clip('repos',.4)}}}
    if(m.phase==='back'&&m.t>=1.25){outs++;if(outs%4===0){m.phase='festa';m.t=0;setWeather('arc');st.cap={keys:['bebru'],d:4.5};say(['bebru']);loopFor('ballar',6);B.sp=spinPlan(1,1.4,0)[0];B.spT=now;confetti();play('w_festa',.9)}else newAsk()}
    if(m.phase==='festa'&&m.t>6.5)newAsk()}

  /* ───── dianes ───── */
  function icons(){const s=sz(),n=s.wx.length,z=s.icon,gap=n>5?32:60,tot=n*z+(n-1)*gap,x0=W/2-tot/2+z/2;return s.wx.map((w,i)=>({w,x:x0+i*(z+gap),y:ROPE+34,sz:z}))}
  function iconBox(ic){return{x0:ic.x-ic.sz*.55,x1:ic.x+ic.sz*.55,y0:ic.y,y1:ic.y+ic.sz*1.05}}
  function itemBox(it){const k=it.k;
    if(k==='bru')return{x0:B.x-95,x1:B.x+95,y0:B.y-262,y1:B.y+12};
    const s=BOX[k];
    if(k==='nuvol')return{x0:it.x-s[0]/2,x1:it.x+s[0]/2,y0:it.y-s[1]/2,y1:it.y+s[1]/2};
    if(k==='estel'){const [kx,ky]=kitePos();return{x0:kx-s[0]/2,x1:kx+s[0]/2,y0:ky-70,y1:ky+180}}
    return{x0:it.x-s[0]/2,x1:it.x+s[0]/2,y0:it.y-s[1],y1:it.y+14}}
  const inB=(b,x,y)=>x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1;
  function hit(x,y){if(!st)return null;
    if(MODE===0){for(const ic of icons())if(inB(iconBox(ic),x,y))return{k:'icon',w:ic.w};
      for(const it of st.items){if(it.out||it.in<.6)continue;if(it.k==='estel'&&OB.estel.st!=='sky')continue;if(inB(itemBox(it),x,y))return{k:'item',it}}
      return null}
    const m=st.m2;if(!m||m.phase!=='ask')return null;
    for(const k of m.objs){const x2=OB[k];if(x2.st==='rack'&&inB(objBox(x2),x,y))return{k:'obj',o:k}}return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.w===b.w&&a.it===b.it&&a.o===b.o);
  function actionable(g){if(!g||!st)return false;
    if(g.k==='icon')return g.w!==st.w&&st.tr>.5;
    if(g.k==='obj')return st.m2&&st.m2.phase==='ask'&&OB[g.o].st==='rack'&&OB[g.o].vis>.8;
    const it=g.it;if(it.k==='bru'||it.k==='bassal')return !B.busy&&!B.goal;
    return !it.act||(it.k==='ninot'&&it.n<3&&it.at>.6)}
  function activate(g){if(!g)return;idle=0;helpT=0;acts++;STATS.n++;$('#oN').textContent=STATS.n;
    if(g.k==='icon')return setWeather(g.w);
    if(g.k==='obj')return choose(OB[g.o]);
    const it=g.it;it.act=1;it.at=0;
    if(it.k==='ninot'){it.n=Math.min(3,it.n+1);const p=NIN.pc[it.n-1];p.traverse(n=>{if(n.isMesh)n.userData.ghost=false});paint(p);p.scale.setScalar(.5);pop(p,1,.4);
      play('w_neu',.85,[1,1.12,1.26][it.n-1]);if(it.n===3){later(.45,()=>{play('w_be',.8);NIN.wig=1.6;if(!B.busy&&!B.goal)loopFor('content',2)})}return}
    if(it.k==='bru')return react();
    if(it.k==='bassal')return puddle(it);
    if(it.k==='flors')[0,.13,.26].forEach((t,i)=>play('w_flor',.7,[1,1.12,1.26][i],t+.25));
    if(it.k==='ocell'){play('w_ocell',.8);play('w_ales',.6,1,.1)}
    if(it.k==='nuvol')play('w_sol',.8);
    if(it.k==='cargol')play('w_cargol',.8);
    if(it.k==='estel')play('w_estel',.8);
    if(it.k==='molinet'){MOL.boost=2.4;play('w_molinet',.8)}}
  /* en Bru reacciona segons el temps quan se'l mira */
  function react(){const w=st.w,done=()=>{B.busy=0};B.busy=1;
    if(w==='sol'){if(OB.ulleres.st!=='worn'){B.onPosat=()=>{const x=OB.ulleres;if(st.w!=='sol')return;wear(x,'s_ulleres');x.o.scale.setScalar(.5);pop(x.o,1,.25);play('w_posar',.7)};
        clip('posar',.2,null,()=>loopFor('content',2,done))}else{play('w_lladruc',.6,1.15);loopFor('content',2.5,done)}}
    else if(w==='nuvols')clip('mirar_amunt',.25,null,done);
    else if(w==='pluja')clip('saltar_bassal',.15,null,done);
    else if(w==='tempesta')clip('lladrar',.15,null,()=>clip('lladrar',.08,null,done));
    else if(w==='neu')clip('angel_neu',.25,null,done);
    else if(w==='vent'){st.kb=0;loopFor('content',2,done);play('w_lladruc',.6,1.15)}
    else{loopFor('ballar',4,done);B.sp=spinPlan(1,.9,0)[0];B.spT=now;play('w_lladruc',.6,1.15)}}
  /* bassal: en Bru hi va caminant, hi salta i torna */
  function puddle(it){B.busy=1;B.goal={x:it.x+12,y:648,f:()=>clip('saltar_bassal',.15,null,()=>{B.goal={x:BX1,y:BY,f:()=>{B.busy=0;clip(idleClip(),.3)}}})}}

  /* ───── ajuda ───── */
  function hint(){if(!st)return null;
    if(MODE===1){const m=st.m2;return m&&m.phase==='ask'?{k:'obj',o:OBJ[m.w]}:null}
    const it=st.items.find(i=>!i.out&&i.in>.6&&actionable({k:'item',it:i}));if(it)return{k:'item',it};
    const ic=icons().find(i=>i.w!==st.w);return ic?{k:'icon',w:ic.w}:null}
  function stepHelp(dA){if(idle<HELP*2||B.busy||B.goal)return;helpT-=dA;if(helpT>0)return;helpT=5;const h=hint();if(!h)return;
    if(h.k==='obj')clip('assenyalar_D',.25);
    else if(h.k==='icon')clip('mirar_amunt',.25);
    else if(h.it.k==='bru')clip('saludar',.25);
    else{const b=itemBox(h.it);clip((b.x0+b.x1)/2<B.x?'assenyalar_E':'assenyalar_D',.25)}}

  /* ───── partícules i efectes 2D (davant de tot) ───── */
  function splash(x,y,n=14){for(let i=0;i<n;i++)fxp.push({x:x+rnd(-40,40),y:y-6,vx:rnd(-170,170),vy:rnd(-420,-200),g:900,t:0,d:.9,c:'rgba(120,180,240,.9)',r:rnd(3.5,7)})}
  function puff(x,y,n=14){for(let i=0;i<n;i++)fxp.push({x:x+rnd(-70,70),y:y+rnd(-10,6),vx:rnd(-90,90),vy:rnd(-160,-40),g:260,t:0,d:rnd(.7,1.1),c:'rgba(255,255,255,.95)',r:rnd(4,9)})}
  function sparkle(x,y){fxp.push({x,y,vx:rnd(-20,20),vy:rnd(-60,-20),g:0,t:0,d:rnd(.6,1),star:1,r:rnd(7,12)})}
  function confetti(){const C=['#ffd85a','#ff9ec4','#9ee6ff','#b6f28a','#ffa34d','#b38cff'];
    for(let i=0;i<70;i++)conf.push({x:rnd(0,W),y:rnd(-H*.9,-10),vy:rnd(70,120),ph:rnd(0,6),r:rnd(0,6),vr:rnd(-3,3),c:C[i%6],t:0,d:6.5})}
  function stepParts(dA){const w=st.w;
    for(const p of st.parts){if(p.t==='r'){p.y+=p.v*dA;p.x+=(WX[w].storm?-160:-40)*dA;if(p.y>H){p.y=rnd(-80,-10);p.x=rnd(0,W+200)}}
      else if(p.t==='s'){p.y+=p.v*dA;p.x+=Math.sin(now*.8+p.ph)*20*dA;if(p.y>H){p.y=rnd(-40,-5);p.x=rnd(0,W)}}
      else{p.x+=p.v*dA;p.r+=dA*3;p.y+=Math.sin(now*2+p.r)*40*dA;if(p.x>W+40){p.x=rnd(-300,-30);p.y=rnd(250,620)}}}
    for(const c of st.clouds){c.ox+=(WX[c.w].cv||6)*dA;if(c.x+c.ox>W+180)c.ox-=W+360}
    for(const f of fxp){f.t+=dA;f.vy+=f.g*dA;f.x+=f.vx*dA;f.y+=f.vy*dA}fxp=fxp.filter(f=>f.t<f.d);
    for(const c of conf){c.t+=dA;c.y+=c.vy*dA;c.x+=Math.sin(now*1.5+c.ph)*25*dA;c.r+=c.vr*dA}conf=conf.filter(c=>c.t<c.d&&c.y<H+30)}
  /* on para la pluja: la tela del paraigua obert (vora a 0,72 i punta a 1,12 sobre el mànec, radi 0,43) */
  function umbScreen(){const x=OB.paraigua;if(x.st!=='worn'||umbV>.4)return null;const o=x.o;o.updateMatrixWorld(true);
    const a=proj(V1.set(0,.72,0).applyMatrix4(o.matrixWorld)),b=proj(V2.set(0,1.12,0).applyMatrix4(o.matrixWorld));return{x:(a[0]+b[0])/2,yv:a[1],yt:b[1],r:.43*P*(1-umbV)}}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    st.tr=Math.min(1,st.tr+dA/2.4);
    st.snow=clamp(st.snow+(st.w==='neu'?(st.tr>.2?dA/3:0):-dA/3),0,1);
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    if(WX[st.w].storm){st.thunder-=dA;if(st.thunder<=0){st.thunder=rnd(9,14);play('w_tro',.85,rnd(.9,1.05));if(MODE===0&&!B.busy&&!B.goal&&Math.random()<.6)later(.4,()=>{if(!B.busy&&!B.goal&&st.w==='tempesta')clip('mirar_amunt',.3)})}}
    st.rip=Math.max(0,st.rip-dA*1.2);
    /* mirada */
    const g=has?hit(wx,wy):null,ok=actionable(g),entered=!same(g,cur);if(entered){cur=g;dw=0}
    if(ok){if(CFG.mode===0){if(entered)activate(g)}else if(CFG.mode===1){dw+=dt;ringP=clamp(dw/CFG.dwell,0,1);if(dw>=CFG.dwell){dw=0;cur={k:'lock'};activate(g)}}}else dw=0;
    /* coses per mirar */
    for(const it of st.items){it.t+=dA;it.in=it.out?Math.max(0,it.in-dA*1.5):Math.min(1,it.in+dA*(st.tr>.4?1.2:0));it.at+=dA;
      if(it.act&&!['ninot','flors','bru','bassal'].includes(it.k)&&it.at>2.6)it.act=0;if(it.k==='flors'&&it.act===1&&it.at>2.6)it.act=2;
      if((it.k==='bru'||it.k==='bassal')&&it.act&&!B.busy&&it.at>.5)it.act=0}
    st.items=st.items.filter(it=>{if(it.out&&it.in<=0){if(it.k==='ninot')NIN.o.removeFromParent();if(it.k==='molinet')MOL.o.removeFromParent();return false}return true});
    const nin=st.items.find(i=>i.k==='ninot'),mol=st.items.find(i=>i.k==='molinet');
    if(nin){const k=nin.out?nin.in:eBack(nin.in);NIN.o.scale.setScalar(Math.max(.001,.8*k));NIN.wig=Math.max(0,NIN.wig-dA);NIN.o.rotation.z=Math.sin(now*9)*.05*Math.min(1,NIN.wig)}
    if(mol){const k=mol.out?mol.in:eBack(mol.in);MOL.o.scale.setScalar(Math.max(.001,.74*k));MOL.boost=Math.max(0,(MOL.boost||0)-dA);MOL.rot.rotation.z-=dA*(st.w==='vent'?3:.3)*(MOL.boost>0?4:1)}
    if(MODE===1){stepM2(dA);stepRack(dA)}
    stepBru(dA,has,wx,wy);
    for(const k in OB){const x=OB[k];if(x.mx&&x.st!=='off')x.mx.update(dA)}
    const ke=OB.estel;if(ke.st==='sky'&&!fl.some(f=>f.x===ke)){const T=kiteT();ke.o.position.copy(T.p);ke.o.quaternion.copy(T.q)}
    stepFly(dA);stepTw(dA);stepUmb(dA);stepParts(dA);lights();
    const busy=B.busy||B.goal||(MODE===1&&st.m2&&st.m2.phase!=='ask')||fl.length;
    if(busy)idle=0;else idle+=dA;
    stepHelp(dA)}

  /* ───── dibuix: cel, prat, coses 2D, ombres i halos darrere; 3D; partícules, corda, rètol i ajudes davant ───── */
  function dimg(c,k,x,y,h,o={}){const im=IM[k],m=META[k];if(!im||!im.complete||!m)return;const w=h*m[0]/m[1];c.save();c.globalAlpha=o.a??1;c.translate(x,y);if(o.r)c.rotate(o.r);
    c.scale((o.sx||1)*(o.fx||1),o.sy||1);c.drawImage(im,-w*(o.ax??.5),-h*(o.ay??1),w,h);c.restore()}
  function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
  function mix(a,b,t){const A=hex(a),B2=hex(b);return`rgb(${A.map((v,i)=>Math.round(lerp(v,B2[i],t))).join(',')})`}
  const wA=w=>w===st.w?ease(st.tr):(w===st.pw?1-ease(st.tr):0);
  function glow(c,x,y,rx,ry,k){const p=.5+.5*Math.sin(now*3),a=Math.min(.95,(.42+.3*p)*k),r=rx+6*p;
    c.save();c.translate(x,y);c.scale(1,(ry+4*p)/r);const g=c.createRadialGradient(0,0,0,0,0,r);
    g.addColorStop(0,`rgba(255,252,222,${a})`);g.addColorStop(.62,`rgba(255,249,210,${a*.85})`);g.addColorStop(1,'rgba(255,244,200,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.restore()}
  function shadow(c,x,y,rx,ry,a=.22){c.fillStyle=`rgba(30,50,20,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()}
  function drawSky(c){const a=WX[st.pw].sky,b=WX[st.w].sky,u=ease(st.tr);
    const gr=c.createLinearGradient(0,0,0,360);gr.addColorStop(0,mix(a[0],b[0],u));gr.addColorStop(1,mix(a[1],b[1],u));c.fillStyle=gr;c.fillRect(-40,-40,W+80,440);
    const sn=lerp(WX[st.pw].sun||0,WX[st.w].sun||0,u);if(sn>.01)dimg(c,'i_sol',1150,300+(1-sn)*120,170,{a:sn,r:Math.sin(now*.5)*.1,ay:.5});
    const ar=wA('arc');if(ar>.01){const cols=['#ef6b6b','#f5a04c','#f6d84f','#7cc96b','#5aa7e0','#9d7ad6'];c.save();c.globalAlpha=.75*ar;c.lineWidth=22;
      cols.forEach((col,i)=>{c.strokeStyle=col;c.beginPath();c.arc(640,470,470-i*22,Math.PI,2*Math.PI);c.stroke()});c.restore()}
    const it=st.items.find(i=>i.k==='nuvol'&&!i.out);
    for(const cl of st.clouds){const al=wA(cl.w);if(al<.01)continue;let x=((cl.x+cl.ox)%(W+360)+(W+360))%(W+360);
      if(it&&cl.w==='nuvols'&&cl.k==='n1'){x=it.x;const p=it.act?Math.sin(clamp(it.at/2.6,0,1)*Math.PI):0;x+=p*230;if(p>.05)dimg(c,'i_sol',it.x-10,it.y+35,130,{a:p,ay:.5,r:Math.sin(now*3)*.15})}
      dimg(c,cl.k,x,cl.y,CLH[cl.k]*cl.s,{a:al,ay:.5})}}
  function drawPrat(c){if(IM.fons.complete)c.drawImage(IM.fons,-2,-2,W+4,H+4);
    if(st.snow>.01&&IM.fons_neu.complete){c.globalAlpha=st.snow;c.drawImage(IM.fons_neu,-2,-2,W+4,H+4);c.globalAlpha=1}
    const d=lerp(WX[st.pw].dark,WX[st.w].dark,ease(st.tr));if(d>.005){c.fillStyle=`rgba(30,45,70,${d})`;c.fillRect(-40,-40,W+80,H+80)}}
  function drawItem(c,it,H0){const a=it.in;if(a<.01)return;const x=it.x,y=it.y,b=itemBox(it),cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
    if(!it.out&&a>.6&&actionable({k:'item',it}))glow(c,cx,cy,(b.x1-b.x0)*.55,(b.y1-b.y0)*.55,H0&&H0.k==='item'&&H0.it===it?1.3:.35);
    const pu=it.act?Math.sin(clamp(it.at/.5,0,1)*Math.PI):0;
    if(it.k==='flors'){const open=it.act===2||(it.act&&it.at>.4);[-70,0,70].forEach((dx,i)=>dimg(c,open?'flor_oberta':'flor_tancada',x+dx,y,(open?150:130)*(1+.15*pu),{a,r:Math.sin(now*2+i)*.06}))}
    if(it.k==='ocell'){const f=it.act?clamp(it.at/2.6,0,1):0;if(f>0&&f<1){const an=f*Math.PI*2;dimg(c,'ocell_vola',x-Math.sin(an)*160,y-130-Math.sin(f*Math.PI)*120,120,{a,ay:.5,fx:Math.cos(an)<0?-1:1})}
      else dimg(c,'ocell',x,y,130,{a,sy:1+.05*Math.sin(now*6)})}
    if(it.k==='bassal'){dimg(c,'bassal',x,y,90,{a,ay:.6,sx:1+.06*Math.sin(now*2)+.12*st.rip});
      if(st.rip>0){c.strokeStyle=`rgba(255,255,255,${.7*st.rip})`;c.lineWidth=3;for(let i=0;i<2;i++){const r=(1-st.rip)*90+i*25;c.beginPath();c.ellipse(x,y-8,r,r*.28,0,0,7);c.stroke()}}}
    if(it.k==='cargol'){const f=it.act?Math.sin(clamp(it.at/2.6,0,1)*Math.PI):0;dimg(c,'cargol',x-f*40,y,140,{a,sy:1+.18*f,sx:1-.05*f})}}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!R||!ready||!st)return;
    if(!CFG.simple){drawSky(c);drawPrat(c)}
    const H0=idle>HELP?hint():null;
    if(MODE===1){const pm=META.penjador,ph=pm[1]*(760/pm[0]);dimg(c,'penjador',880,600+ph,ph,{});
      const m=st.m2;if(m&&m.phase==='ask')for(const k of m.objs){const x=OB[k];if(x.st!=='rack'||x.vis<.6)continue;const hl=H0&&H0.o===k;glow(c,x.rx,RACKY-x.rs*.5,x.rs*.62,x.rs*.64,hl?1.4:.3)}}
    /* ombres dels models 3D */
    if(B.o.parent)shadow(c,B.x,B.y+3,72,14);
    const nin=st.items.find(i=>i.k==='ninot'),mol=st.items.find(i=>i.k==='molinet');
    if(nin&&nin.in>.02)shadow(c,nin.x,nin.y+3,78*nin.in,14*nin.in,.18);if(mol&&mol.in>.02)shadow(c,mol.x,mol.y+3,32*mol.in,8*mol.in,.18);
    if(MODE===0){const its=st.items.filter(i=>i.k!=='bru'&&i.k!=='estel'&&i.k!=='ninot'&&i.k!=='molinet').sort((a,b)=>a.y-b.y);for(const it of its)drawItem(c,it,H0);
      for(const it of st.items){if(it.out||it.in<.6||!['bru','estel','ninot','molinet'].includes(it.k)||!actionable({k:'item',it}))continue;
        const b=itemBox(it);glow(c,(b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.x1-b.x0)*.6,(b.y1-b.y0)*.56,H0&&H0.k==='item'&&H0.it===it?1.3:.3)}}
    R.render(S3,cam);
    /* davant: pluja, neu, fulles, vent, esquitxos, fil de l'estel, corda amb les icones, rètol, fletxa i confeti */
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const ke=OB.estel;if(ke.st==='sky'){const h=B.bone.ma_D.getWorldPosition(V1),[hx,hy]=proj(h);ke.o.updateMatrixWorld(true);const k0=ke.o.getObjectByName('arrel');
      const [kx,ky]=proj(V2.set(0,0,.03).applyMatrix4(k0.matrixWorld));f.strokeStyle='rgba(255,252,240,.92)';f.lineWidth=2;f.beginPath();f.moveTo(hx,hy);f.quadraticCurveTo((hx+kx)/2,(hy+ky)/2+45,kx,ky);f.stroke()}
    if(!CFG.simple)drawParts(f);
    for(const p of fxp){const al=Math.min(1,(p.d-p.t)*3);if(p.star){f.fillStyle=`rgba(255,240,150,${al})`;starP(f,p.x,p.y,p.r*al+2)}else{f.globalAlpha=al;f.fillStyle=p.c;f.beginPath();f.arc(p.x,p.y,p.r,0,7);f.fill();f.globalAlpha=1}}
    if(MODE===0)drawIcons(f,H0);
    if(MODE===1&&H0&&idle>HELP*2){const x=OB[H0.o];if(x&&x.st==='rack'){const by=RACKY-x.rs*1.22-Math.abs(Math.sin(now*4))*16;f.fillStyle='#ffd85a';f.strokeStyle='rgba(120,80,0,.5)';f.lineWidth=3;
      f.beginPath();f.moveTo(x.rx,by+32);f.lineTo(x.rx-24,by);f.lineTo(x.rx+24,by);f.closePath();f.fill();f.stroke()}}
    for(const p of conf){f.save();f.globalAlpha=Math.min(1,(p.d-p.t)*1.5);f.translate(p.x,p.y);f.rotate(p.r);f.fillStyle=p.c;f.fillRect(-6,-4,12,8);f.restore()}
    drawCap(f)}
  function starP(c,x,y,s){c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?s*.42:s;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.closePath();c.fill()}
  function drawParts(f){const X=WX[st.w],Xp=WX[st.pw];
    const nr=Math.round((X.rain||0)*wA(st.w)+(st.w===st.pw?0:(Xp.rain||0)*(1-ease(st.tr))));
    if(nr>0){const ub=umbScreen(),sl=X.storm?.2:.05;f.strokeStyle='rgba(150,190,235,.62)';f.lineWidth=2.5;f.lineCap='round';f.beginPath();let n=0;
      for(const p of st.parts){if(p.t!=='r')continue;if(n++>=nr*(LOWQ?.5:1))break;
        if(ub){const dx=(p.x-ub.x)/ub.r;if(Math.abs(dx)<1){const yh=ub.yv-(ub.yv-ub.yt)*(1-dx*dx);if(p.y+p.l>yh&&p.y<B.y+10){if(p.y<yh+30&&Math.random()<.04)fxp.push({x:p.x,y:yh,vx:rnd(-60,60),vy:rnd(-120,-60),g:700,t:0,d:.25,c:'rgba(170,205,240,.85)',r:2.5});
          if(p.y>yh){p.y=rnd(-80,-10);p.x=rnd(0,W+200);continue}}}}
        f.moveTo(p.x,p.y);f.lineTo(p.x-p.l*sl*4,p.y+p.l)}f.stroke();f.lineCap='butt'}
    const sa=wA('neu');if(sa>.01){f.fillStyle=`rgba(255,255,255,${.9*sa})`;f.beginPath();for(const p of st.parts){if(p.t!=='s')continue;f.moveTo(p.x+p.r,p.y);f.arc(p.x,p.y,p.r,0,7)}f.fill()}
    const la=wA('vent');if(la>.01){const C=['#7fbf4d','#a6cf55','#e7b347'];for(const p of st.parts){if(p.t!=='l')continue;f.save();f.globalAlpha=la;f.translate(p.x,p.y);f.rotate(p.r);f.fillStyle=C[p.c];f.beginPath();f.ellipse(0,0,13,6,0,0,7);f.fill();f.restore()}
      f.strokeStyle=`rgba(255,255,255,${.5*la})`;f.lineWidth=4;for(let i=0;i<4;i++){const x=((now*300+i*390)%(W+400))-200,y=330+i*70;f.beginPath();f.moveTo(x,y);f.bezierCurveTo(x+60,y-20,x+120,y+20,x+180,y);f.stroke()}}}
  function drawIcons(f,H0){const ics=icons();f.strokeStyle='rgba(255,255,255,.92)';f.lineWidth=4;f.beginPath();f.moveTo(-60,ROPE-6);ics.forEach(ic=>f.lineTo(ic.x,ROPE));f.lineTo(W+60,ROPE-6);f.stroke();
    ics.forEach((ic,i)=>{const cu=ic.w===st.w,cx=ic.x,cy=ic.y+ic.sz*.55;
      if(!cu){if(H0&&H0.k==='icon'&&H0.w===ic.w)glow(f,cx,cy,ic.sz*.66,ic.sz*.62,1.3)}else{f.fillStyle='rgba(255,230,120,.38)';f.beginPath();f.arc(cx,cy,ic.sz*.6,0,7);f.fill()}
      dimg(f,'i_'+ic.w,ic.x,ic.y-6,ic.sz,{ay:0,r:Math.sin(now*1.4+i)*.05,sx:cu?1.06:1,sy:cu?1.06:1});dimg(f,'pinca',ic.x,ROPE-27,70,{ay:0})})}
  function drawCap(f){const c=st.cap;if(!c)return;const s=c.keys.map(k=>T('temps.'+k)).join(' ');f.font='800 34px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=W/2,y=MODE===0?686:160,al=Math.min(1,c.d*3);   // mode 1: a baix (sota en Bru); mode 2: sota els botons
    f.globalAlpha=al;f.fillStyle='rgba(255,255,255,.9)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,56,28);f.fill();f.fillStyle='#2a4b66';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+4);f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function layout(){if(!ready)return;newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newGame()}
  function tray(){const t=$('#tray');t.innerHTML='';['temps.m1','temps.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  /* música i ambient segons el temps (index: musKey i updLoops) */
  function mus(){return 'm_temps_'+(st?WX[st.w].mus:'sol')}
  function ambK(){return st?WX[st.w].amb||null:null}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:ambK,hit,hint,actionable,activate,setWeather,icons,itemBox,objBox,kitePos,scr,
    get ready(){return ready},get mode(){return MODE},get st(){return st},get B(){return B},get OB(){return OB},get idle(){return idle},get acts(){return acts},get outs(){return outs},
    get R(){return R},get fl(){return fl},get umbV(){return umbV}};
})();
