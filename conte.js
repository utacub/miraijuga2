/* =========================================================
   ESCENARI: EL CONTE QUE TRIES
   Un llibre desplegable de 4 pàgines sobre una catifa de paper (3D: models de Blender fets per ChatGPT, lliurament v3, 21-11-2026).
   En Lluc, el camaleó, fa les preguntes i el nen tria amb la mirada una solapa de paper de cada pàgina:
     1. Qui sortirà al conte? (zebra amb patins, drac petit, balena voladora)  → el protagonista entra i fa la seva gràcia
     2. On va anar? (ciutat dels núvols, illa de les fruites gegants, bosc dels mitjons) → s'aixeca l'escena de paper i en Lluc canvia de color
     3. Què va trobar? (barret de sorpreses → conill, clau màgica → porta al cel, ou de pampallugues → pollet de colors)
     4. Com acaba el conte? (un gran ball, una cabana per dormir, una desfilada)
   Al final tots fan un gir de festa i en Lluc llegeix tot el conte triat (veus ElevenLabs v4 en 6 idiomes) mentre es torna a representar.
   «Tria el teu conte»: totes les solapes són bones. «Escolta i tria»: en Lluc diu el que cal triar; si no ho és, la solapa es plega
     (sense so d'error) i en Lluc ho torna a dir. Mides: 2/3/3 solapes (amplada 260/220/170 px).
   Ajuda: als 6 s la solapa bona (o una qualsevol) bota; als 12 s brilla i en Lluc diu «Mira aquí!». Tecla P: canvia de mode.
   ========================================================= */
const CONTE=(()=>{
  const TX=__COTX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['co.'+k]=TX[l][k];
  const IX=__COIX__,D2=IX._2d;
  const PAG=[['zebra','drac','balena'],['nuvols','fruites','mitjons'],['barret','clau','ou'],['ball','cabana','desfilada']];
  const RES={barret:'conill',clau:'porta',ou:'pollet'},MAGIC={barret:['magic','surt'],clau:['turn','obre'],ou:['crack','neix']};
  const SZ=[{n:2,w:260},{n:3,w:220},{n:3,w:170}];
  /* disposició del prototip validat (px de la pantalla 1280×720) */
  const BOOK={x:625,y:585,w:1010},SCN={x:625,y:528,w:880},HERO={x:535,y:505},OBJ={x:770,y:508},LLUC={x:1150,y:616,h:210},FLAP={y:642};
  const HH={zebra:212,drac:192,balena:205},OH={barret:118,clau:60,ou:116,conill:132,porta:178,pollet:116,bandera:150};
  const LIFT={balena:30,clau:34},SHW={lluc:.32,porta:.3,clau:.5,pollet:.38,ou:.32,barret:.45,conill:.3,balena:.26};
  const P=165,PIT=5*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6;
  const PMIN=[4.2,4.3,4.7,4.6],TD=1.25,KL=.5,ARC=[153,0];
  const CONF=['#f3c84a','#e8736b','#4fb3a9','#f6e7c8','#b48fd6','#7cc36a'];
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,loading=0,first=true;
  const PROTO={},CL={},TXS={},POOL={},INST=[],IM={};
  let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],LL=null;
  const A={hero:null,obj:null,res:null,ban:null};
  const VB={};let vSrc=null,vQ=[],vTok=0,vOn=false;
  const lerp=(a,b,t)=>a+(b-a)*t,c01=t=>clamp(t,0,1),ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const V1=new THREE.Vector3();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3c';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3cf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.55);sun=new THREE.DirectionalLight(0xfff2e0,1.3);sun.position.set(-3,6,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    for(const k in D2)IM[k]=img('conte/2d/'+k+'.webp');
    load();resize()}
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX).filter(k=>k!=='_2d'),tex=keys.concat(IX.lluc.colors.map(c=>'lluc_'+c));let n=keys.length+tex.length;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const t of tex)tx(t,done);
    for(const k of keys)L.load(U('conte/m/'+k+'.glb'),g=>{const o=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name.slice(k.length+1)]=c;
        o.traverse(m=>{if(m.isMesh){m.frustumCulled=false;m.userData.mn=m.material&&m.material.name||''}});PROTO[k]=o;done()},undefined,e=>{console.error(e);done()})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: aquarel·la mat (rugositat 0,8), ulls satinats i les ulleres d'en Lluc de vidre transparent ───── */
  function tx(n,cb){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('conte/t/'+n+'.webp'),cb,undefined,cb);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mkMat(n,eye){const c=tx(n);
    if(LOWQ)return new THREE.MeshPhongMaterial({map:c,shininess:eye?70:6,specular:eye?0x5a5a5a:0x101010,side:THREE.DoubleSide});
    return new THREE.MeshStandardMaterial({map:c,roughness:eye?.3:.8,metalness:0,envMap:ENV,envMapIntensity:eye?1:.7,side:THREE.DoubleSide})}
  function mkGlass(){const o={color:0xeef8ff,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide};
    return LOWQ?new THREE.MeshPhongMaterial(Object.assign(o,{shininess:90,specular:0x777777})):new THREE.MeshStandardMaterial(Object.assign(o,{roughness:.08,metalness:0,envMap:ENV,envMapIntensity:1.3}))}
  function paint(x){const old=x.mats||{},mats={};
    x.o.traverse(m=>{if(!m.isMesh)return;const mn=m.userData.mn||'',key=/vidre/.test(mn)?'g':/_ulls/.test(mn)?'e':'b';
      if(!mats[key])mats[key]=key==='g'?mkGlass():mkMat(x.tex,key==='e');m.material=mats[key];if(key==='g')m.renderOrder=2});
    for(const k in old)old[k].dispose();x.mats=mats}
  function setTex(x,n){if(x.tex===n)return;x.tex=n;const t=tx(n);for(const k of ['b','e'])if(x.mats[k])x.mats[k].map=t}
  function quality(){if(!R)return;lq=LOWQ;
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const x of INST)paint(x);
    amb.intensity=LOWQ?1.0:.6;sun.intensity=LOWQ?1.6:1.3;resize()}

  /* ───── personatges (un de cada model alhora: es fa servir el model carregat directament) ───── */
  function inst(k){const o=PROTO[k],w=new THREE.Group();w.add(o);ROOT.add(w);
    const x={k,w,o,tex:k,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',ct:0,dur:0,ts:1,once:false,fired:{},q:[],used:false};
    o.traverse(n=>{if(n.name==='s_nas')x.nas=n;else if(n.name==='s_esprai')x.esp=n;else if(n.name==='s_llengua')x.llen=n;else if(n.isBone&&n.name==='head')x.head=n});
    paint(x);INST.push(x);return POOL[k]=x}
  function take(k,px,py,z,h){const x=POOL[k]||inst(k);x.used=true;x.w.visible=true;x.q=[];x.hold=false;x.spin=null;x.out=false;x.ot=0;x.ap=0;x.apD=.4;x.fy=1;x.fd=null;x.hop=null;x.arc=0;x.home=null;
    x.px=px;x.py=py;x.z=z;x.lift=LIFT[k]||0;x.base=h/(IX[k].h*P*CP);x.rr=x.ryT=0;x.o.position.set(0,0,0);place(x,0);return x}
  function give(x){if(!x)return;x.used=false;x.w.visible=false;x.mx.stopAllAction();x.cur=null;x.cn='';x.q=[];x.spin=null;x.out=false;x.A={};x.mx.uncacheRoot(x.o)}
  function clip(x,n,fade=.2,ts=1,keepQ){if(!x)return;const c=CL[x.k][n],info=IX[x.k].clips[n];if(!c||!info)return;let a=x.A[n];if(!a)a=x.A[n]=x.mx.clipAction(c);
    const loop=!!info[1],prev=x.cur;a.enabled=true;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveTimeScale(ts);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a){if(fade>0)prev.crossFadeTo(a,fade,false);else prev.stop()}
    x.cur=a;x.cn=n;x.ct=0;x.ts=ts;x.dur=c.duration/Math.abs(ts);x.once=!loop;x.fired={};if(!keepQ)x.q=[]}
  function seq(x,...L){if(!x||!L.length)return;clip(x,L[0],.2);x.q=L.slice(1)}
  const ends=(x,m=.04)=>!!x&&x.once&&x.ct>=x.dur-m;
  function evt(x,name){if(!x||!x.cn||x.fired[name])return false;const e=typeof name==='number'?name:IX[x.k].clips[x.cn][2][name];
    if(e==null)return false;if(x.ct>=e){x.fired[name]=1;return true}return false}
  /* posició a la pantalla (peus) → món; escala amb aparició (rebot) i desaparició; girs de festa */
  function place(x,dA){if(x.ap<1)x.ap=Math.min(1,x.ap+dA/x.apD);if(x.out){x.ot+=dA/.4;if(x.ot>=1){give(x);return}}
    if(x.hop){const h=x.hop;h.t+=dA;if(h.t>=0){if(!h.go){h.go=true;h.x0=x.px;h.y0=x.py;h.z0=x.z;if(Math.abs(h.x1-h.x0)>4)x.ryT=h.x1<h.x0?-.75:.75;if(h.cl&&IX[x.k].clips[h.cl])clip(x,h.cl,.12)}
      const u=c01(h.t/h.d),e=u*u*(3-2*u);x.px=lerp(h.x0,h.x1,e);x.py=lerp(h.y0,h.y1,e);x.z=lerp(h.z0,h.z1,e);x.arc=h.h*4*u*(1-u);
      if(u>=1){x.arc=0;x.hop=null;if(h.end)h.end(x)}}}
    if(x.fd){x.fd.t+=dA;const u=c01(x.fd.t/x.fd.d);x.fy=x.fd.dir<0?1-ez(u):(x.fd.t<0?0:eBack(u));if(u>=1){x.fy=x.fd.dir<0?0:1;x.fd=null}}
    const s=x.base*(x.ap<1?Math.max(0,eBack(x.ap)):1)*(x.out?1-ez(c01(x.ot)):1);x.rr=lerp(x.rr,x.ryT,c01(dA*6));
    gpos(x.w.position,x.px,x.py-x.lift-x.arc,x.z);x.w.scale.set(Math.max(.001,s),Math.max(.001,s*x.fy),Math.max(.001,s));x.w.rotation.set(0,x.rr+(x.spin?spinA(x.spin,st?st.t:0):0),0)}
  const gone=x=>{if(x&&x.used&&!x.out){x.out=true;x.ot=0}};
  /* plegar (dir −1) o desplegar (dir +1) un personatge amb la seva pàgina, com les figures d'un llibre desplegable */
  function fold(x,dir,d,delay=0){if(!x)return;x.fd={t:-delay,d,dir};if(dir>0)x.fy=0}
  /* saltar en arc d'un lloc a un altre (els personatges baixen del llibre a la taula mentre gira el full) */
  function hop(x,x1,y1,z1,d,h,delay,cl,end){x.hop={t:-delay,d,x1,y1,z1,h,cl,end,go:false}}
  const LIVE=x=>x&&!x.out&&['zebra','drac','balena','conill','pollet'].includes(x.k);
  const TAULA={hero:[330,668,2.0],res:[905,676,2.05]};

  /* ───── pantalla (px, 1280×720) ↔ món ───── */
  const gpos=(v,px,py,z=0)=>v.set((px-640)/P,(360-py)/(P*CP)+z*SP/CP,z);
  const proj=v=>[640+v.x*P,360-P*(v.y*CP-v.z*SP)];
  const wp=n=>{n.getWorldPosition(V1);return proj(V1)};
  function later(t,f){wait.push({t:now+t,f})}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=3){if(st)st.cap={s:T('co.'+k),d}}
  function capS(s,d=3){if(st)st.cap={s,d}}

  /* ───── veus (ElevenLabs v4: conte/v/<idioma>_<clau>.mp3) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('conte/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vOn=true;vNext(vTok)}
  function vNext(t){if(t!==vTok)return;if(!on||!AC||!CFG.sound||!vQ.length){vOn=false;return}const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];vOn=false;if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=3){cap(k,d);say([k])}
  const snd=(n,g=.6,r=1)=>play('co_'+n,g,r);
  const story=p=>{const c=st.ch;return p===0?'h_'+c[0]:p===1?'l_'+c[0]+'_'+c[1]:p===2?'o_'+c[2]:'f_'+c[3]};

  /* ───── en Lluc: idle, read, talk, turn_page, point, think, no, clap, change, bow, dance ───── */
  function clipL(n,hold=0){clip(LL,n,.2);LL.ht=hold}
  function stepLluc(dA){if(!LL)return;
    if(LL.ht>0){LL.ht-=dA;if(LL.ht<=0&&!LL.once&&LL.cn!=='idle'&&LL.cn!=='talk')clip(LL,'idle',.3)}
    if(LL.cn==='change'&&evt(LL,'color')){setTex(LL,LL.texNext||'lluc');snd('color',.5);const [x,y]=proj(LL.w.position);
      for(let i=0;i<14;i++){const a=rnd(0,TAU);fxp.push({k:'spk',x:x+Math.cos(a)*rnd(30,70),y:y-100+Math.sin(a)*rnd(30,80),vx:Math.cos(a)*30,vy:Math.sin(a)*30-20,t:-i*.02,d:.9,r:rnd(5,9),c:CONF[i%6]})}}
    if(LL.cn==='point'&&evt(LL,'punta'))snd('llengua',.5);
    if(LL.cn==='turn_page'&&evt(LL,'pagina'))startTurn();
    const talking=!!vSrc;if(talking&&LL.cn==='idle')clip(LL,'talk',.2);else if(!talking&&LL.cn==='talk')clip(LL,'idle',.25)}

  /* ───── partida ───── */
  function newGame(again){if(!ready)return;vStop();wait=[];fxp=[];idle=0;dw=0;cur=null;
    for(const x of INST)if(x!==LL&&x.used)give(x);for(const k in A)A[k]=null;
    if(!LL){LL=take('lluc',LLUC.x,LLUC.y,2.2,LLUC.h);LL.ap=1}
    LL.rr=LL.ryT=-.62;setTex(LL,'lluc');LL.spin=null;clip(LL,'idle',0);
    st={ph:'intro',t:0,p:0,ch:[],cap:null,flaps:[],tg:null,hf:null,helpSaid:false,pg:-1,pt:0,pf:{},film:false,scene:null,sceneOld:null,turnT:-1,after:null,tp:0,conf:0,zzz:false,next:0};
    const mt=MODE===0?'m1t':'m2t';
    if(first&&!again){first=false;say(['hola',mt]);cap('hola',1.9);later(1.9,()=>cap(mt,2))}else tell(mt,2.2)}
  /* solapes: a «Escolta i tria» la bona hi és sempre */
  function buildFlaps(){const S=SZ[CFG.size],o=PAG[st.p].slice();let opts=shuffle(o.slice());
    st.tg=MODE===1?pick(o):null;
    if(S.n<opts.length){opts=opts.filter(x=>x!==st.tg);shuffle(opts);opts=opts.slice(0,S.n-(st.tg?1:0));if(st.tg)opts.push(st.tg);shuffle(opts)}
    const w=S.w,h=w*197/324,gap=46,tot=opts.length*w+(opts.length-1)*gap;
    st.flaps=opts.map((c,i)=>({c,x:640-tot/2+w/2+i*(w+gap),y:FLAP.y,w,h,col:(st.p+i)%4,in:-i*.08,shake:0,fold:0,out:-1,chosen:false}));st.hf=null}
  function ask(){st.ph='ask';st.t=0;idle=0;st.helpSaid=false;buildFlaps();
    if(MODE===0){tell('q'+st.p,3.4);clipL('think',2.4)}
    else{capS(T('co.s'+st.p)+' '+T('co.k_'+st.tg),4.6);say(['s'+st.p,'k_'+st.tg]);clipL('read',2.6)}}
  function activate(f){if(!actionable(f))return;idle=0;
    if(MODE===1&&f.c!==st.tg){f.fold=1.4;f.shake=.6;snd('tanca',.35);clip(LL,'no',.2);capS(T('co.escolta')+' '+T('co.k_'+st.tg),3);say(['escolta','k_'+st.tg]);return}
    snd('solapa',.6);st.ch[st.p]=f.c;for(const q of st.flaps){q.out=0;q.chosen=q===f}
    clip(LL,'point',.2);LL.ht=0;st.t=0;
    if(MODE===0){st.ph='turn';later(.7,()=>turnPage(()=>{st.ph='play';st.t=0;startPage(st.p)}))}
    else{st.ph='play';stagePage(st.p);say([story(st.p)]);cap(story(st.p),5)}}

  /* ───── les pàgines: la mateixa representació a la partida i a la lectura final ───── */
  function stagePage(d,dl=0){st.pg=d;st.pt=0;st.pf={};st.zzz=false;st.pdl=dl}
  const at=(k,t)=>{if(st.pf[k]||st.pt<t)return false;st.pf[k]=1;return true};
  function stepPage(dA){if(st.pg<0)return;if(st.pdl>0){st.pdl-=dA;return}st.pt+=dA;const d=st.pg,t=st.pt,H=A.hero;
    if(d===0){const h=st.ch[0];
      if(at('s',0))setScene('arc');
      if(at('a',.25)){A.hero=take(h,330,HERO.y,1,HH[h]);A.hero.apD=.35;A.hero.rr=A.hero.ryT=1.15;clip(A.hero,'enter',0)}
      const X=A.hero;if(!X)return;
      if(t<1.35)X.px=lerp(330,625,ez(c01((t-.25)/1.1)));
      if(at('b',1.35)){X.px=625;X.ryT=.12;seq(X,'trick')}
      if(X.cn==='trick')trickFx(X)}
    else if(d===1){
      if(at('a',0)){setScene(st.ch[1]);st.wx0=H?H.px:HERO.x}
      if(at('l',st.film?.3:1.0)){LL.texNext='lluc_'+st.ch[1];clip(LL,'change',.2);LL.ht=0;if(st.film)LL.q=['read']}
      if(!H)return;
      if(Math.abs(st.wx0-HERO.x)>2){
        if(at('b',.35)){H.ryT=-1.1;clip(H,'enter',.2)}
        if(t>.35&&t<1.2)H.px=lerp(st.wx0,HERO.x,ez(c01((t-.35)/.85)));
        if(at('c',1.2)){H.px=HERO.x;H.ryT=.15;seq(H,'look','happy')}}
      else if(at('c',.8)){H.ryT=.15;seq(H,'look','happy')}}
    else if(d===2){const o=st.ch[2],[mc,me]=MAGIC[o];
      if(at('s',0))setScene(st.ch[1]);
      if(at('a',.3)){A.obj=take(o,OBJ.x,OBJ.y,1.25,OH[o]);A.obj.apD=.6;A.obj.rr=A.obj.ryT=-.35;seq(A.obj,'pop');snd('puja',.35)}
      const O=A.obj;
      if(H&&at('b',.55)){H.ryT=.6;seq(H,'look')}
      if(O&&at('c',1.3)){O.hold=o!=='barret';clip(O,mc,.15);if(o==='clau')snd('clau',.6)}
      if(O&&O.cn==='crack'&&at('cr',1.55))snd('crac',.65);
      if(O&&O.cn===mc&&evt(O,me))reveal(o,O);
      if(H&&at('h',PMIN[2]-1.6)){H.ryT=.25;seq(H,'happy')}}
    else if(d===3){const f=st.ch[3],Rz=A.res;
      if(at('a',0))setScene(f);
      if(at('b',.75)){
        if(f==='ball'){if(H)clip(H,'dance',.25);if(Rz&&Rz.k!=='porta')clip(Rz,'dance',.25);clipL('dance');st.conf=PMIN[3]+3.5}
        else if(f==='cabana'){if(H){H.ryT=.1;clip(H,'sleep',.3)}if(Rz&&Rz.k!=='porta')clip(Rz,'sleep',.3);clipL('read');snd('badall',.6);st.zzz=true;st.zt=0}
        else{A.ban=take('bandera',HERO.x-110,HERO.y+4,.8,OH.bandera);A.ban.apD=.5;A.ban.rr=A.ban.ryT=.3;clip(A.ban,'wave',0);
          if(H){H.ryT=.35;clip(H,'march',.25)}if(Rz&&Rz.k!=='porta'){Rz.ryT=.35;clip(Rz,'march',.25)}clipL('clap');snd('tambor',.55)}}}}
  function trickFx(X){
    if(X.k==='zebra'&&evt(X,'gir'))snd('patins',.65);
    if(X.k==='drac'&&evt(X,'esternut')){snd('esternut',.7);later(.18,()=>snd('bombolles',.5));const [x,y]=X.nas?wp(X.nas):proj(X.w.position);
      for(let i=0;i<9;i++)fxp.push({k:'bub',x:x+rnd(-6,6),y:y+rnd(-6,6),vx:rnd(20,95),vy:rnd(-80,-20),t:-i*.05,d:rnd(1.6,2.4),r:rnd(6,13)})}
    if(X.k==='balena'&&evt(X,'esprai')){snd('esprai',.65);const [x,y]=X.esp?wp(X.esp):proj(X.w.position);
      for(let i=0;i<16;i++)fxp.push({k:'drp',x:x+rnd(-4,4),y,vx:rnd(-70,70),vy:rnd(-260,-170),g:420,t:-i*.03,d:1.1,r:rnd(3,5.5)})}}
  /* l'objecte fa la seva màgia: en surt el conill, s'obre la porta al cel o neix el pollet */
  function reveal(o,O){const [sx,sy]=proj(O.w.position),top=sy-OH[o]*.8-O.lift;
    for(let i=0;i<16;i++){const a=rnd(0,TAU),v=rnd(40,120);fxp.push({k:'spk',x:sx,y:top,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:-i*.015,d:rnd(.7,1.1),r:rnd(5,10),c:CONF[i%6]})}
    if(o==='barret'){A.res=take('conill',OBJ.x+82,OBJ.y+4,1.35,OH.conill);A.res.apD=.5;A.res.rr=A.res.ryT=-.3;seq(A.res,'appear','wave');snd('barret',.65)}
    else if(o==='clau'){A.res=take('porta',OBJ.x+16,OBJ.y+2,1.0,OH.porta);A.res.apD=.5;A.res.rr=A.res.ryT=-.25;A.res.hold=true;seq(A.res,'appear','open');later(.55,()=>snd('porta',.6));gone(O)}
    else{A.res=take('pollet',OBJ.x,OBJ.y+2,1.32,OH.pollet);A.res.apD=.45;A.res.rr=A.res.ryT=-.3;seq(A.res,'appear','chirp');later(.75,()=>snd('piu',.55));later(.15,()=>gone(O))}}

  /* passar pàgina: en Lluc hi fa anar la cua (turn_page, esdeveniment «pagina») */
  function startTurn(){if(st.after&&st.turnT<0){st.turnT=0;snd('pagina',.6)}}
  /* girar full: es pleguen l'escena i els personatges, en Lluc fa anar la cua i el full gira; després, «after» munta la pàgina nova */
  function turnPage(after){st.after=after;st.tp=0;foldScene();if(st.cap)st.cap.d=Math.min(st.cap.d,.35);
    for(const k in A){const x=A[k];if(!x)continue;
      if(LIVE(x)&&TAULA[k]){x.home=[x.px,x.py,x.z];const [tx,ty,tz]=TAULA[k],hero=k==='hero';
        hop(x,tx,ty,tz,.55,70,hero?0:.12,hero?'happy':null,y=>{y.ryT=hero?.5:-.5;if(hero)seq(y,'look','idle');else clip(y,'idle',.2)})}
      else fold(x,-1,.35)}
    snd('tanca',.2);
    seq(LL,'turn_page',st.film?'read':'idle');LL.ht=0}
  function setScene(k){if(st.scene&&st.scene.k===k&&!st.scene.out)return;const had=!!st.scene;foldScene();st.scene={k,t:had?-.25:0,out:false};snd('puja',.5)}
  function foldScene(){if(st.scene){st.sceneOld=st.scene;st.sceneOld.out=true;st.sceneOld.ot=0;st.scene=null}}
  /* pàgina nova després de girar (mode 1 i lectura final): torna a sortir el que hi havia i la novetat triada */
  const SCK=p=>p===0?'arc':p<3?st.ch[1]:st.ch[3];
  /* tornar al llibre quan la pàgina nova ja és muntada: els que han baixat hi salten, la resta es desplega */
  function comeBack(hx){let n=0;for(const k in A){const x=A[k];if(!x)continue;
      if(x.home){const [x0,y0,z0]=x.home,hero=k==='hero';x.home=null;n++;
        hop(x,hero&&hx!=null?hx:x0,y0,z0,.55,85,hero?.35:.45,hero?'happy':null,y=>{y.ryT=hero?.15:-.3;clip(y,'idle',.2)})}
      else fold(x,1,.6,.2)}return n}
  function startPage(p){if(p>0)setScene(SCK(p));const n=comeBack(HERO.x);stagePage(p,n?.95:0);say([story(p)]);cap(story(p),5)}
  /* mode 2: la pàgina nova es munta abans de triar; la novetat surt després */
  function prepPage(p){setScene(p<=1?'arc':st.ch[1]);comeBack(p===1?625:HERO.x)}
  function pageDone(){return !(st.pdl>0)&&st.pt>=PMIN[st.pg]&&(!vOn||st.pt>12)}
  function toBow(){st.ph='bow';st.t=0;st.zzz=false;snd('aplaudiment',.6);clipL('clap');
    const H=A.hero,Rz=A.res;if(H){H.ryT=.1;seq(H,'happy')}if(Rz){if(Rz.k==='conill')seq(Rz,'wave');else if(Rz.k==='pollet')seq(Rz,'chirp')}
    spins([H,Rz&&Rz.k!=='porta'?Rz:null,LL])}
  function spins(L){L=L.filter(Boolean);const pl=spinPlan(L.length,.4,.45);L.forEach((x,i)=>x.spin=pl[i])}
  function clearSpins(){for(const x of INST)x.spin=null}
  function toFilm(){st.ph='film';st.t=0;st.film=true;st.fk=-1;st.conf=0;st.zzz=false;clearSpins();tell('tot',3);
    foldScene();for(const k in A)if(A[k])fold(A[k],-1,.4);later(.5,()=>{for(const k in A){give(A[k]);A[k]=null}});st.pg=-1;
    if(LL.tex!=='lluc'){LL.texNext='lluc';seq(LL,'change','read')}else clip(LL,'read',.25)}
  function toFi(){st.ph='fi';st.t=0;snd('fi',.6);tell('fi',3);seq(LL,'bow');st.conf=3.2;const H=A.hero,Rz=A.res;
    if(H){H.ryT=.1;if(H.cn==='sleep'||H.cn==='march')clip(H,'idle',.3)}if(Rz&&Rz.k!=='porta'&&Rz.cn!=='idle')clip(Rz,'idle',.3);
    spins([H,Rz&&Rz.k!=='porta'?Rz:null,LL])}

  /* ───── mirada ───── */
  function hit(x,y){if(!st||st.ph!=='ask')return null;for(const f of st.flaps)if(Math.abs(x-f.x)<f.w/2+8&&Math.abs(y-f.y)<f.h/2+10)return f;return null}
  function actionable(f){return !!f&&!!st&&st.ph==='ask'&&f.fold<=0&&f.in>=1&&f.out<0}
  function hint(){if(!st||st.ph!=='ask')return null;const ok=st.flaps.filter(f=>f.fold<=0&&f.out<0);if(!ok.length)return null;
    if(MODE===1)return st.flaps.find(f=>f.c===st.tg)||null;if(!st.hf||!ok.includes(st.hf))st.hf=pick(ok);return st.hf}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;st.t+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    const g=has?hit(wx,wy):null;
    if(g!==cur){cur=g;dw=0}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur='lock';activate(g)}}else dw=0;
    for(const x of INST)if(x.used){x.mx.update(dA);x.ct+=dA;
      if(x.once&&ends(x)){const n=x.q.length?x.q.shift():(!x.hold&&IX[x.k].clips.idle?'idle':null);if(n)clip(x,n,.25,1,true)}}
    stepLluc(dA);
    for(const f of st.flaps){f.in=Math.min(1,f.in+dA*2.2);if(f.fold>0)f.fold-=dA;if(f.shake>0)f.shake-=dA;if(f.out>=0)f.out+=dA}
    if(st.flaps.length&&st.flaps.every(f=>f.out>.5))st.flaps=[];
    if(st.scene){st.scene.t+=dA;if(st.scene.out&&st.scene.t>99)st.scene=null;if(st.scene&&st.scene.out){st.scene.ot=(st.scene.ot||0)+dA;if(st.scene.ot>.4)st.scene=null}}
    if(st.sceneOld){st.sceneOld.ot+=dA;if(st.sceneOld.ot>.45)st.sceneOld=null}
    if(st.turnT>=0){st.turnT+=dA;if(st.turnT>=TD){st.turnT=-1;const f=st.after;st.after=null;if(f)f()}}
    else if(st.after){st.tp+=dA;if(st.tp>.9)startTurn()}
    const ph=st.ph;
    if(ph==='intro'){if(st.t>1.6&&(!vOn||st.t>7)){if(MODE===0)ask();else{st.ph='turn';st.t=0;turnPage(()=>{prepPage(0);st.ph='pre';st.t=0})}}}
    else if(ph==='pre'){if(st.t>1.1)ask()}
    else if(ph==='play'){stepPage(dA);if(st.t>.4&&pageDone()){if(st.p===3)toBow();else if(MODE===0){st.p++;ask()}
      else{st.ph='turn';st.t=0;turnPage(()=>{st.p++;prepPage(st.p);st.ph='pre';st.t=0})}}}
    else if(ph==='turn')stepPage(dA);
    else if(ph==='bow'){if(st.t>3.4)toFilm()}
    else if(ph==='film'){stepPage(dA);
      if(st.fk<0){if(st.t>1.2&&(!vOn||st.t>6)&&!st.after){st.fk=0;turnPage(()=>startPage(0))}}
      else if(st.pg===st.fk&&!st.after&&pageDone()){if(!st.next)st.next=st.t+.6;if(st.t>=st.next){st.next=0;if(st.fk<3){st.fk++;const k=st.fk;turnPage(()=>startPage(k))}else toFi()}}}
    else if(ph==='fi'){if(st.t>3.6&&(!vOn||st.t>7)){st.ph='out';st.t=0;clearSpins();foldScene();for(const k in A)if(A[k])fold(A[k],-1,.4);st.conf=0}}
    else if(ph==='out'){if(st.t>.6)newGame(true)}
    for(const x of INST)if(x.used)place(x,dA);
    for(const k in A)if(A[k]&&!A[k].used)A[k]=null;
    /* partícules: confeti del ball i de la festa final, «Z» de la cabana */
    if(st.conf>0){st.conf-=dA;if(Math.random()<dA*16)fxp.push({k:'conf',x:rnd(140,1110),y:-20,vx:rnd(-20,20),vy:rnd(70,130),t:0,d:5,r:rnd(6,11),rot:rnd(0,6),vr:rnd(-3,3),c:pick(CONF)})}
    if(st.zzz&&A.hero&&A.hero.cn==='sleep'){st.zt-=dA;if(st.zt<=0){st.zt=1.1;const [x,y]=A.hero.head?wp(A.hero.head):proj(A.hero.w.position);fxp.push({k:'zzz',x:x+10,y:y-30,vx:rnd(10,22),vy:-26,t:0,d:2.4,r:rnd(22,30)})}}
    for(const p of fxp){p.t+=dA;if(p.t<0)continue;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA;if(p.rot!=null)p.rot+=p.vr*dA}fxp=fxp.filter(p=>p.t<p.d);
    /* ajuda: als 6 s bota una solapa; als 12 s brilla i en Lluc l'assenyala */
    if(ph==='ask'&&!st.flaps.some(f=>f.fold>0||f.in<1))idle+=dA;else if(ph!=='ask')idle=0;
    if(idle>HELP*2&&!st.helpSaid&&hint()){st.helpSaid=true;clip(LL,'point',.25);tell('mira',2.2)}
    ROOT.updateMatrixWorld(true)}

  /* ───── dibuix ───── */
  const ok=k=>IM[k]&&IM[k].complete&&IM[k].naturalWidth>0,asp=k=>D2[k][0]/D2[k][1];
  /* llibre obert pla (sense l'arc, que és l'escenari desplegable de la primera pàgina) */
  const BKk=()=>BOOK.w/D2.llibre_pla[0],BKx=()=>BOOK.x-BOOK.w/2,BKy=()=>BOOK.y-BOOK.w/asp('llibre_pla');
  function drawBook(c){const w=BOOK.w,h=w/asp('llibre_pla');c.fillStyle='rgba(90,50,20,.22)';c.beginPath();c.ellipse(BOOK.x,BOOK.y-6,w*.5,18,0,0,7);c.fill();if(ok('llibre_pla'))c.drawImage(IM.llibre_pla,BOOK.x-w/2,BOOK.y-h,w,h)}
  function drawSc(c,s){if(!s)return;const arc=s.k==='arc',k=arc?'arc':'p_'+s.k;if(!ok(k))return;
    const sy=s.out?1-ez(c01(s.ot/.4)):(s.t<0?0:eBack(c01(s.t/.8)));if(sy<=.01)return;let x,y,w,h;
    if(arc){const kb=BKk();w=D2.arc[0]*kb;h=D2.arc[1]*kb;x=BKx()+ARC[0]*kb+w/2;y=BKy()+ARC[1]*kb+h}else{w=SCN.w;h=w/asp(k);x=SCN.x;y=SCN.y}
    c.save();c.translate(x,y);c.transform(1,0,0,sy,0,0);c.drawImage(IM[k],-w/2,-h,w,h);c.restore()}
  function drawScene(c){drawSc(c,st.sceneOld);drawSc(c,st.scene)}
  function shadowE(c,x,y,rx,ry_,a=.2){if(rx<=0)return;c.fillStyle=`rgba(90,50,20,${a})`;c.beginPath();c.ellipse(x,y,rx,ry_,0,0,7);c.fill()}
  function shadows(c){for(const x of INST){if(!x.used||!x.w.visible||x.k==='bandera'||x.fy<.05)continue;const [sx,sy]=proj(V1.copy(x.w.position)),k=x.w.scale.x/x.base*(1-Math.min(.5,x.arc/220));
      const w=(SHW[x.k]||.22)*IX[x.k].h*x.base*P*CP*k,y=sy+x.lift+x.arc;shadowE(c,sx,y,w,w*.2,x.lift?.12:.2)}}
  /* el full que gira: una superfície de paper corbada que gira sobre el plec del llibre, amb la perspectiva del dibuix
     (trapezi de la pàgina dreta i esquerra mesurat al llibre), la cara de davant amb la pàgina dreta i la de darrere amb l'esquerra
     (així comença i acaba exactament sobre el llibre), ombrejat segons la llum de l'esquerra i ombra sobre les pàgines de sota */
  const PG={S:[470,57,388],O:[856,57,903,386],L:[84,57,35,386]};
  function texTri(c,img,p0,p1,p2,t0,t1,t2){
    const du1=t1[0]-t0[0],dv1=t1[1]-t0[1],du2=t2[0]-t0[0],dv2=t2[1]-t0[1],det=du1*dv2-du2*dv1;if(Math.abs(det)<1e-6)return;
    const dx1=p1[0]-p0[0],dy1=p1[1]-p0[1],dx2=p2[0]-p0[0],dy2=p2[1]-p0[1];
    const a=(dx1*dv2-dx2*dv1)/det,b=(dy1*dv2-dy2*dv1)/det,cc=(dx2*du1-dx1*du2)/det,d=(dy2*du1-dy1*du2)/det,e=p0[0]-a*t0[0]-cc*t0[1],f=p0[1]-b*t0[0]-d*t0[1];
    const mx=(p0[0]+p1[0]+p2[0])/3,my=(p0[1]+p1[1]+p2[1])/3,ex=q=>{const vx=q[0]-mx,vy=q[1]-my,l=Math.hypot(vx,vy)||1;return [q[0]+vx/l*.6,q[1]+vy/l*.6]};
    const q0=ex(p0),q1=ex(p1),q2=ex(p2);
    c.save();c.beginPath();c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.lineTo(q2[0],q2[1]);c.closePath();c.clip();c.transform(a,b,cc,d,e,f);
    const x0=Math.max(0,Math.floor(Math.min(t0[0],t1[0],t2[0])-2)),y0=Math.max(0,Math.floor(Math.min(t0[1],t1[1],t2[1])-2)),
      x1=Math.min(img.width,Math.ceil(Math.max(t0[0],t1[0],t2[0])+2)),y1=Math.min(img.height,Math.ceil(Math.max(t0[1],t1[1],t2[1])+2));
    if(x1>x0&&y1>y0)c.drawImage(img,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);
    c.restore()}
  /* textura del full amb l'ombrejat ja pintat: la cara de davant (pàgina dreta) i la de darrere (pàgina esquerra) en franges
     horitzontals alineades als píxels, amb un degradat al llarg del full; així no queden costures entre triangles */
  let PTX=null,PTXc=null;
  function shadeTex(img,ang,NS){const W=img.naturalWidth,H=img.naturalHeight;
    if(!PTX){PTX=document.createElement('canvas');PTX.width=W;PTX.height=H;PTXc=PTX.getContext('2d')}
    const c=PTXc,NB=LOWQ?5:9,Sx=PG.S[0];c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);c.drawImage(img,0,0);c.globalCompositeOperation='source-atop';
    for(let b=0;b<NB;b++){const v=(b+.5)/NB,y0=b?Math.round(PG.S[1]+b/NB*(PG.S[2]-PG.S[1])):0,y1=b<NB-1?Math.round(PG.S[1]+(b+1)/NB*(PG.S[2]-PG.S[1])):H;
      for(const fr of [1,-1]){const Ex=fr>0?lerp(PG.O[0],PG.O[2],v):lerp(PG.L[0],PG.L[2],v),g=c.createLinearGradient(Sx,0,Ex,0);
        for(let i=0;i<=NS;i++){const a=ang(i,v),nx=-Math.sin(a)*fr,nz=Math.cos(a)*fr,dd=Math.max(0,nx*LIT[0]+nz*LIT[1]);
          g.addColorStop(i/NS,`rgba(96,56,22,${(.30*(1-dd)+(fr<0?.03:0)).toFixed(3)})`)}
        c.fillStyle=g;if(fr>0)c.fillRect(Sx,y0,W-Sx,y1-y0);else c.fillRect(0,y0,Sx,y1-y0)}}
    c.globalCompositeOperation='source-over';return PTX}
  const LIT=[-.3,.954];
  function drawTurn(c){if(st.turnT<0||!ok('llibre_pla'))return;const img=IM.llibre_pla;
    const u=c01(st.turnT/TD),th=Math.PI*u*u*(3-2*u),be=1.05*Math.sin(2*Math.PI*u)*(1-.3*u),kb=BKk(),bx=BKx(),by=BKy();
    const NS=LOWQ?14:24,NV=LOWQ?4:7,P_=[],F_=[],B_=[],S_=[],Z_=[];
    const ang=(i,v)=>i===0?th:clamp(th+be*Math.pow((i-.5)/NS,1.35)*(1+.45*v),0,Math.PI);
    let sxMin=1e9,sxMax=-1e9;
    for(let j=0;j<=NV;j++){const v=j/NV,Sx=PG.S[0],Sy=lerp(PG.S[1],PG.S[2],v),Ox=lerp(PG.O[0],PG.O[2],v),Oy=lerp(PG.O[1],PG.O[3],v),Lx=lerp(PG.L[0],PG.L[2],v),Ly=lerp(PG.L[1],PG.L[3],v);
      const wr=Ox-Sx,wl=Sx-Lx,wa=(wr+wl)/2,rp=[],rf=[],rb=[],rs=[],rz=[];let X=0,Z=0;
      const toImg=(X,Z)=>X>=0?[Sx+X*wr,Sy+X*(Oy-Sy)-KL*Z*wa]:[Sx+X*wl,Sy-X*(Ly-Sy)-KL*Z*wa];
      for(let i=0;i<=NS;i++){const s=i/NS;if(i>0){const a=ang(i,v);X+=Math.cos(a)/NS;Z+=Math.sin(a)/NS}
        const q=toImg(X,Z);rp.push([bx+q[0]*kb,by+q[1]*kb]);rf.push([Sx+s*wr,Sy+s*(Oy-Sy)]);rb.push([Sx-s*wl,Sy+s*(Ly-Sy)]);
        const xs=clamp(X+.42*Z,-1,1),qs=toImg(xs,0),ps=[bx+qs[0]*kb,by+qs[1]*kb];rs.push(ps);sxMin=Math.min(sxMin,ps[0]);sxMax=Math.max(sxMax,ps[0]);rz.push(Z)}
      P_.push(rp);F_.push(rf);B_.push(rb);S_.push(rs);Z_.push(rz)}
    /* ombra del full sobre les pàgines: més fosca al plec i esvaïda cap enfora */
    const sa=.24*Math.sin(th);if(sa>.01){const x0=bx+PG.S[0]*kb,far=Math.abs(sxMax-x0)>Math.abs(sxMin-x0)?sxMax:sxMin,g=c.createLinearGradient(x0,0,far,0);
      g.addColorStop(0,`rgba(92,54,22,${sa.toFixed(3)})`);g.addColorStop(.55,`rgba(92,54,22,${(sa*.55).toFixed(3)})`);g.addColorStop(1,'rgba(92,54,22,0)');
      c.save();if(!LOWQ)c.filter='blur(3px)';c.fillStyle=g;c.beginPath();
      for(let i=0;i<=NS;i++)c.lineTo(S_[0][i][0],S_[0][i][1]);for(let j=1;j<=NV;j++)c.lineTo(S_[j][NS][0],S_[j][NS][1]);for(let i=NS;i>=0;i--)c.lineTo(S_[NV][i][0],S_[NV][i][1]);
      c.closePath();c.fill();c.restore()}
    const tex=shadeTex(img,ang,NS);
    /* cel·les del full, de la més baixa a la més alta */
    const cells=[];for(let j=0;j<NV;j++)for(let i=0;i<NS;i++)cells.push([j,i,Z_[j][i]+Z_[j][i+1]+Z_[j+1][i]+Z_[j+1][i+1]]);cells.sort((p,q)=>p[2]-q[2]);
    for(const [j,i] of cells){const p00=P_[j][i],p10=P_[j][i+1],p11=P_[j+1][i+1],p01=P_[j+1][i];
      const ar=(p10[0]-p00[0])*(p11[1]-p00[1])-(p10[1]-p00[1])*(p11[0]-p00[0]),T=ar>=0?F_:B_;
      texTri(c,tex,p00,p10,p11,T[j][i],T[j][i+1],T[j+1][i+1]);texTri(c,tex,p00,p11,p01,T[j][i],T[j+1][i+1],T[j+1][i])}
    /* cantell del full (el gruix del paper) */
    c.strokeStyle='rgba(150,105,62,.45)';c.lineWidth=1.2;c.lineJoin='round';c.beginPath();
    for(let i=0;i<=NS;i++)c.lineTo(P_[0][i][0],P_[0][i][1]);for(let j=1;j<=NV;j++)c.lineTo(P_[j][NS][0],P_[j][NS][1]);for(let i=NS;i>=0;i--)c.lineTo(P_[NV][i][0],P_[NV][i][1]);c.stroke()}
  const iconFor=c=>PAG[0].includes(c)?c:PAG[2].includes(c)?c+'_0':ok('i_'+c)?'i_'+c:'p_'+c;
  function drawFlaps(f){if(!st.flaps.length)return;const hi=idle>HELP?hint():null;
    for(const q of st.flaps){if(q.in<=0)continue;let x=q.x,y=q.y+(1-ez(c01(q.in)))*170,s=1,al=1;if(q.shake>0)x+=Math.sin(q.shake*50)*8*q.shake;
      if(q.out>=0){const u=c01(q.out/.5);if(q.chosen){s=1+.18*ez(u);al=1-u*u;y-=30*ez(u)}else{y+=150*u*u;al=1-u}}
      if(q===hi&&q.fold<=0)y-=Math.abs(Math.sin(now*5))*12;
      const fold=q.fold>0?c01(Math.min(q.fold,1.4-q.fold)/.25):0;
      f.save();f.globalAlpha=al;f.translate(x,y);f.scale(s,s*(1-.85*fold));
      if(q===hi&&idle>HELP*2&&q.fold<=0){const p=.5+.5*Math.sin(now*3);f.fillStyle=`rgba(255,240,160,${.35+.3*p})`;f.beginPath();f.roundRect(-q.w/2-12,-q.h/2-12,q.w+24,q.h+24,26);f.fill()}
      if(cur===q&&actionable(q)){f.fillStyle='rgba(255,246,200,.55)';f.beginPath();f.roundRect(-q.w/2-8,-q.h/2-8,q.w+16,q.h+16,22);f.fill()}
      const k='solapa_'+q.col;if(ok(k))f.drawImage(IM[k],-q.w/2,-q.h/2,q.w,q.h);
      const ik=iconFor(q.c);if(ok(ik)){const ia=asp(ik),bw=q.w*.88,bh=q.h*.84;let iw=bw,ih=iw/ia;if(ih>bh){ih=bh;iw=ih*ia}f.drawImage(IM[ik],-iw/2,-ih/2+q.h*.05,iw,ih)}
      f.restore()}
    if(LL&&LL.cn==='point'&&hi&&st.helpSaid){const b=Math.abs(Math.sin(now*4))*12,x=hi.x,y=hi.y-hi.h/2-14-b;f.fillStyle='#fff6d8';f.strokeStyle='#7a4a1c';f.lineWidth=4;f.lineJoin='round';
      f.beginPath();f.moveTo(x,y);f.lineTo(x-16,y-22);f.lineTo(x+16,y-22);f.closePath();f.fill();f.stroke()}}
  function star(f,r){f.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;f.lineTo(Math.cos(a)*q,Math.sin(a)*q)}f.closePath()}
  function drawP(f,p){if(p.t<0)return;const a=Math.max(0,1-p.t/p.d);f.save();f.globalAlpha=clamp(a*1.6,0,1);f.translate(p.x,p.y);
    if(p.k==='bub'){f.strokeStyle='rgba(225,242,255,.95)';f.fillStyle='rgba(190,230,255,.25)';f.lineWidth=2.5;f.beginPath();f.arc(0,0,p.r,0,7);f.fill();f.stroke();f.fillStyle='rgba(255,255,255,.8)';f.beginPath();f.arc(-p.r*.35,-p.r*.35,p.r*.25,0,7);f.fill()}
    else if(p.k==='drp'){f.fillStyle='rgba(120,185,235,.9)';f.beginPath();f.arc(0,0,p.r,0,7);f.fill()}
    else if(p.k==='spk'){f.rotate(p.t*3);f.fillStyle=p.c;star(f,p.r*(1-.4*p.t/p.d));f.fill()}
    else if(p.k==='conf'){f.rotate(p.rot);f.fillStyle=p.c;f.beginPath();f.ellipse(0,0,p.r,p.r*.5,0,0,7);f.fill()}
    else if(p.k==='zzz'){f.globalAlpha=clamp(a*1.4,0,1)*Math.min(1,p.t*3);f.font=`900 ${Math.round(p.r)}px Nunito, "Segoe UI", system-ui, sans-serif`;f.textAlign='center';f.lineWidth=5;f.lineJoin='round';
      f.strokeStyle='#5a3a8a';f.fillStyle='#f4ecff';f.strokeText('z',0,0);f.fillText('z',0,0)}
    f.restore()}
  function lines(f,s,max){if(f.measureText(s).width<=max)return [s];const w=s.split(' ');let best=null;
    for(let i=1;i<w.length;i++){const a=w.slice(0,i).join(' '),b=w.slice(i).join(' '),m=Math.max(f.measureText(a).width,f.measureText(b).width);if(!best||m<best[0])best=[m,a,b]}return best?[best[1],best[2]]:[s]}
  function drawCap(f){const c=st.cap;if(!c||!c.s)return;f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';const L=lines(f,c.s,1060),lh=40,n=L.length;
    const tw2=Math.max(...L.map(s=>f.measureText(s).width)),x=640,yb=st.ph==='ask'?160:700-(n-1)*lh,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,250,238,.94)';f.beginPath();f.roundRect(x-tw2/2-26,yb-48,tw2+52,54+(n-1)*lh,27);f.fill();f.fillStyle='#6a3a12';f.textAlign='center';f.textBaseline='alphabetic';
    L.forEach((s,i)=>f.fillText(s,x,yb-9+i*lh));f.textAlign='left';f.globalAlpha=1}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&ok('fons'))c.drawImage(IM.fons,0,0,W,H);
    if(!R||!ready||!st)return;
    drawBook(c);drawTurn(c);drawScene(c);shadows(c);
    R.render(S3,cam);
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    for(const p of fxp)drawP(f,p);f.globalAlpha=1;drawFlaps(f);drawCap(f)}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function clearAll(){for(const x of INST)if(x!==LL)give(x);for(const k in A)A[k]=null;if(LL){LL.mx.stopAllAction();LL.cur=null;LL.cn='';LL.A={}}}
  function layout(){if(!ready||!st)return;if(st.ph==='ask')buildFlaps()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready){clearAll();newGame()}}
  function tray(){const t=$('#tray');t.innerHTML='';['co.m1','co.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;first=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready){clearAll();newGame()}}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus:()=>'m_conte',amb:()=>null,hit,hint,activate,actionable,scr,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},get LL(){return LL},get vOn(){return vOn},A,INST,IX,proj}
})();
