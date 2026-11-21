/* =========================================================
   ESCENARI: EL RENTACOTXES
   La Rita (ós rentador de llauna, 3D) renta els vehicles de joguina de sis animals (llauna litografiada, fets amb Blender):
   hipopòtam/autobús, rinoceront/excavadora, tortuga/cotxet, cangur/moto amb sidecar, flamenc/caravana, llama/furgoneta de gelats.
   El fons és el collage de papers pintats; taques, esponja, escuma, aigua, aire i rètols en 2D.
   «Neteja'l!»: el vehicle passa pel bassal i s'embruta (3/5/8 taques de fang, fulles, pols, un cuc o una marieta).
     Mirar una taca hi envia l'esponja de la Rita i la neteja (bombolla que puja de to). Mirar el conductor el fa riure.
     Tot net: túnel (raspalls, dutxes i assecador amb el gag de cada animal), brilla, botzina i se'n va. Festa cada 3 vehicles.
   «Com el vols?»: tria lliure, sense resposta correcta: color de l'escuma, adhesiu i detall del sostre (2/3/4 opcions al
     prestatge); la Rita fa una foto que es penja al suro; amb 6 fotos, festa.
   Ajuda: als 6 s brilla el que toca; als 12 s la Rita ho assenyala. Sense error ni flaixos. Tecla P: canvia de mode.
   ========================================================= */
const RENTA=(()=>{
  const TX=__RCTX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['renta.'+k]=TX[l][k];
  const IX=__RCIX__;
  const AN=['hipopotam','rinoceront','tortuga','cangur','flamenc','llama'];
  const SPOTS=['fang0','fang1','fang2','fang3','fulles0','fulles1','fulles2','pols0','pols1','pols2','cuc0','cuc1','marieta0','marieta1'];
  const FOAM={rosa:'#ff9ec8',blava:'#8fd0ff',verda:'#9de39a',groga:'#ffe27a'};
  const OPT=[Object.keys(FOAM),['estrelles','flors','llamps','cors'],['globus','bandera','garlanda','pompo']];
  /* adhesiu: [x, alçada, escala] al costat del vehicle que mira a la càmera (provat a blender/test_three) */
  const ADH={autobus:[-.62,.42,.55],excavadora:[-.52,.5,.42],cotxet:[-.48,.42,.42],caravana:[-.42,.42,.6],moto:[-.3,.27,.42],furgoneta:[-.98,.52,.55]};
  const TOPOFF={moto:[-.88,.02,0]};/* detall del sostre de la moto: al darrere del sidecar, lluny del cangur */
  const VOX={hipopotam:.8,rinoceront:.74,tortuga:1.12,cangur:1,flamenc:1.25,llama:.92};   // to de la botzina i del riure
  const SIZES=[{n:3,sp:200,opts:2,os:160,k:1},{n:5,sp:150,opts:3,os:140,k:1.03},{n:8,sp:112,opts:4,os:122,k:1.06}];
  const SCALE=[0,2,4,7,9,12,14,16,19,21];                     // pentatònica: cada taca neta, la bombolla puja una nota
  const P=255,PIT=16*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6;
  const VX=700,VY0=598,VY2=616,RX=205,RY=660,RK=1.15,K2=.84,SHY=270,ZOPT=-1.2,BOARD=[24,118,222,192];
  let VY=VY0;
  const LOOPS=new Set(['repos','caminar','fregar','conduir','rodar','tremolar','girar','ruixar','gronxar']);
  let SL=null,R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,loading=0;
  const PROTO={},CL={},MX={},MAT={},TXS={},IM={},RIG={};
  let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],helpSaid=false,order=[],snapReq=false;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lerp=(a,b,t)=>a+(b-a)*t,eo=t=>1-Math.pow(1-t,3),c01=t=>clamp(t,0,1);
  const V1=new THREE.Vector3(),V2=new THREE.Vector3();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3r';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3rf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.42);sun=new THREE.DirectionalLight(0xffffff,1.25);sun.position.set(-3,5,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    /* capa de les taques: un pla vertical just davant del costat del vehicle; s'hi dibuixa en coordenades de pantalla i la Rita el tapa (prova de profunditat) */
    {const c=document.createElement('canvas');c.width=W;c.height=H;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;
     const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));m.renderOrder=50;   /* sense prova de profunditat: cap peça del vehicle (erugues, rodes) tapa les taques; la Rita va en una passada posterior */
     m.visible=false;m.frustumCulled=false;S3.add(m);SL={c,g:c.getContext('2d'),t,m}}
    IM.fons=img('renta/fons.webp');IM.davant=img('renta/fons_davant.webp');for(const k of SPOTS)IM[k]=img('renta/s/'+k+'.webp');
    load();resize()}
  /* càrrega: els 25 models d'una vegada (5,5 MB); cada malla recorda el seu model per al material */
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX);let n=keys.length;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const k of keys)L.load(U('renta/m/'+k+'.glb'),g=>{PROTO[k]=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name]=c;MX[k]=new THREE.AnimationMixer(g.scene);RIG[k]=rigOf(k);
        g.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.userData.mk=k}});done()},undefined,e=>{console.error(e);done()})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── material de llauna (LLEGEIX dels models): alta = Standard amb RoomEnvironment; ràpid = Phong ───── */
  function tx(n){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('renta/t/'+n+'.webp'));t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mk(k){const m=IX[k],c=tx(m.tex),side=m.doble?THREE.DoubleSide:THREE.FrontSide;
    return LOWQ?new THREE.MeshPhongMaterial({map:c,shininess:70,specular:0x4a4a4a,side}):new THREE.MeshStandardMaterial({map:c,roughness:.3,metalness:0,envMap:ENV,envMapIntensity:.9,side})}
  function quality(){if(!R)return;lq=LOWQ;for(const k in MAT){MAT[k].dispose();delete MAT[k]}
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in PROTO)MAT[k]=mk(k);
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const k in PROTO)PROTO[k].traverse(o=>{if(o.isMesh)o.material=MAT[o.userData.mk]});
    amb.intensity=LOWQ?1.05:.42;sun.intensity=LOWQ?1.5:1.25;resize()}

  /* ───── pantalla (px, 1280×720) ↔ món ───── */
  const gpos=(v,px,py)=>v.set((px-640)/P,0,(py-360)/(P*SP));
  const at=(v,px,py,z)=>v.set((px-640)/P,(360+z*SP*P-py)/(CP*P),z);
  const proj=v=>[640+v.x*P,360+v.z*SP*P-v.y*CP*P];
  function later(t,f){wait.push({t:now+t,f})}
  function sz(){return SIZES[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=3){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs v4: renta/v/<idioma>_<clau>.mp3; si no hi són, només el rètol) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('renta/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=2.6,more){cap(k,d);say(more?[k].concat(more):[k])}

  /* ───── clips (un esquelet per model: cada model és únic a l'escena i es reaprofita) ───── */
  function rigOf(k){return{k,A:{},cur:null,cn:'',ct:0,dur:0,once:false}}
  function clip(k,name,fade=.25,ts=1){const r=RIG[k],c=CL[k]&&CL[k][IX[k].prefix+name];if(!c)return;let a=r.A[name];if(!a)a=r.A[name]=MX[k].clipAction(c);
    const once=!LOOPS.has(name),prev=r.cur;a.enabled=true;a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=once;a.setEffectiveTimeScale(ts);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a&&fade>0)prev.crossFadeTo(a,fade,false);else if(prev&&prev!==a)prev.stop();
    r.cur=a;r.cn=name;r.ct=0;r.dur=c.duration;r.once=once}
  const ends=(k,m=.08)=>{const r=RIG[k];return r&&r.once&&r.ct>=r.dur-m};
  function stopAll(k){if(!MX[k])return;MX[k].stopAllAction();const r=RIG[k];r.cur=null;r.cn='';r.ct=0;r.once=false}
  function detach(k){const o=PROTO[k];if(o&&o.parent)o.parent.remove(o);stopAll(k)}
  function holder(k){const g=new THREE.Group(),o=PROTO[k];if(o.parent)o.parent.remove(o);g.add(o);o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.setScalar(1);ROOT.add(g);return g}
  function glint(k,v){const m=MAT[k];if(m&&m.emissive)m.emissive.setScalar(v)}

  /* ───── partida ───── */
  function clearAll(){for(const k in PROTO){detach(k);glint(k,0)}while(ROOT.children.length)ROOT.remove(ROOT.children[0])}
  function newGame(){if(!ready)return;vStop();clearAll();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;
    st={v:null,done:0,photos:[],cap:null,festa:null,rita:0,ritaT:0,tun:null,rg:holder('rita'),rw:{x:RX,y:RY,yaw:.38,ph:'home',s:null}};
    gpos(st.rg.position,RX,RY);st.rg.scale.setScalar(RK);st.rg.rotation.y=.38;clip('rita','repos');
    newVehicle()}
  function nextAn(){if(!order.length)order=shuffle(AN.slice());let a=order.pop();if(st&&st.last===a&&order.length){order.unshift(a);a=order.pop()}if(st)st.last=a;return a}
  function newVehicle(){VY=MODE===1?VY2:VY0;const an=nextAn(),vk=IX[an].vehicle,vm=IX[vk],k=MODE===0?sz().k:K2;
    const g=holder(vk),o=PROTO[vk],ao=PROTO[an];if(ao.parent)ao.parent.remove(ao);o.getObjectByName(vm.peces.animal).add(ao);ao.position.set(0,0,0);ao.rotation.set(0,0,0);ao.scale.setScalar(1);
    if(vk==='furgoneta'){const ge=o.getObjectByName('gelat');if(ge)ge.scale.setScalar(1)}
    g.scale.setScalar(k);glint(vk,0);glint(an,0);
    const v={an,vk,g,k,x:-660,ph:'enter',t:0,spots:[],laugh:0,foam:null,stick:null,top:null,q:0,opts:null,sel:null,splash:0,shine:0,shot:0,cos:o.getObjectByName('cos'),hintI:0};
    st.v=v;gpos(g.position,v.x,VY);clip(vk,'rodar');clip(an,'conduir');play('rc_motor',.45,rnd(.95,1.05));idle=0;helpSaid=false;cur=null;dw=0}
  function clearVeh(v){for(const k of [v.stick&&('adhesiu_'+v.stick),v.top&&('sostre_'+v.top)])if(k)detach(k);
    if(v.opts)for(const o of v.opts)if(o.mk)detach(o.mk);detach(v.an);detach(v.vk);if(v.g.parent)ROOT.remove(v.g);glint(v.vk,0);glint(v.an,0)}

  /* posició d'un punt del model del vehicle (coordenades de Blender exportades: x, y amunt, z cap a la càmera), seguint els bots de l'os «cos» */
  function vpt(v,x,y,z){V1.set(x,y-.3,z);v.cos.localToWorld(V1);return proj(V1)}
  function vBox(v){const M=IX[v.vk].mask,x1=M.x0+M.nx*M.cell,y1=M.ny*M.cell,z=IX[v.vk].meta.amplada/2;let a=[1e9,1e9,-1e9,-1e9];
    for(const [x,y] of [[M.x0,0],[x1,0],[M.x0,y1],[x1,y1]]){const [px,py]=vpt(v,x,y,z);a=[Math.min(a[0],px),Math.min(a[1],py),Math.max(a[2],px),Math.max(a[3],py)]}return a}
  function aniBox(v){const M=IX[v.vk].mask,A=M.ani;let a=[1e9,1e9,-1e9,-1e9];
    for(const [x,y] of [[A[0],A[1]],[A[2],A[1]],[A[0],A[3]],[A[2],A[3]]]){const [px,py]=vpt(v,x,y,M.aniz);a=[Math.min(a[0],px),Math.min(a[1],py),Math.max(a[2],px),Math.max(a[3],py)]}
    return [a[0]-10,a[1]-10,a[2]+10,a[3]+6]}
  const spotXY=(v,s)=>vpt(v,s.x,s.y,s.z);
  function mcell(M,x,y){const i=Math.floor((x-M.x0)/M.cell),j=Math.floor(y/M.cell);if(i<0||j<0||i>=M.nx||j>=M.ny)return null;return M.z[j][i]}
  /* taques: dins la carrosseria (màscara de la cara que mira a la càmera), fora del conductor, separades */
  function placeSpots(v){const s=sz(),M=IX[v.vk].mask,ru=.45*s.sp/(P*v.k),A=M.ani,mg=ru*.4;
    const ok=(x,y)=>{for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1],[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]])if(mcell(M,x+dx*ru*.55,y+dy*ru*.55)==null)return false;
      return !(x>A[0]-mg&&x<A[2]+mg&&y>A[1]-mg&&y<A[3]+mg)};
    const X0=M.x0,X1=M.x0+M.nx*M.cell,Y1=M.ny*M.cell;let d=(s.sp+26)/(P*v.k),best=[];
    for(let tries=0;tries<10&&best.length<s.n;tries++){for(let q=0;q<25;q++){const L=[];for(let n=0;n<2500&&L.length<s.n;n++){const x=rnd(X0,X1),y=rnd(0,Y1);if(!ok(x,y))continue;if(L.every(p=>Math.hypot(p.x-x,p.y-y)>=d))L.push({x,y})}
      if(L.length>best.length)best=L;if(best.length>=s.n)break}d*=.93}
    const kinds=shuffle(SPOTS.slice());
    v.spots=best.slice(0,s.n).map((p,i)=>({x:p.x,y:p.y,z:mcell(M,p.x,p.y)+.012,k:kinds[i%kinds.length],r:rnd(-.5,.5),st:0,t:0,in:0}))}
  /* escuma (mode 2): bombolles sobre la carrosseria, fora del conductor */
  function makeFoam(v,col){const M=IX[v.vk].mask,A=M.ani,L=[];for(let n=0;n<4000&&L.length<90;n++){const x=rnd(M.x0,M.x0+M.nx*M.cell),y=rnd(0,M.ny*M.cell),z=mcell(M,x,y);
      if(z==null||(x>A[0]-.06&&x<A[2]+.06&&y>A[1]-.06))continue;L.push({x,y,z:z+.02,r:rnd(.06,.13),p:rnd(0,6)})}
    L.sort((a,b)=>a.x-b.x);const x0=M.x0,x1=M.x0+M.nx*M.cell;v.foam={col,t:0,b:L,x0,x1}}

  /* ───── opcions del mode 2 (prestatge): escuma en 2D, adhesius i detalls de sostre en 3D ───── */
  function makeOpts(v){const s=sz(),n=s.opts,q=v.q,list=shuffle(OPT[q].slice()).slice(0,n),gap=s.os*.35,tot=n*s.os+(n-1)*gap,x0=640-tot/2+s.os/2;
    v.hintI=Math.floor(Math.random()*n);
    v.opts=list.map((k,i)=>{const o={q,k,x:x0+i*(s.os+gap),y:SHY,sz:s.os,in:-i*.12,gone:0};o.box=[o.x-o.sz*.55,o.y-o.sz*1.05,o.x+o.sz*.55,o.y+14];
      if(q>0){o.mk=(q===1?'adhesiu_':'sostre_')+k;o.g=holder(o.mk);o.base=o.sz*.84/(IX[o.mk].meta.mida[1]*P);at(o.g.position,o.x,o.y-4,ZOPT);o.g.scale.setScalar(.001);clip(o.mk,q===1?'posar':'gronxar')}
      return o})}
  function choose(o){const v=st.v;if(!v||v.ph!=='ask'||o.gone)return;v.ph='apply';v.t=0;v.sel=o;STATS.n++;$('#oN').textContent=STATS.n;idle=0;helpSaid=false;
    play('rc_tria',.7);tell('o_'+o.k,1.8);for(const p of v.opts)if(p!==o)p.gone=.001;
    if(o.q>0){o.fly={t:0,x:o.g.position.x,y:o.g.position.y,z:o.g.position.z,s:o.g.scale.x}}else o.fly={t:0}}
  function advanceQ(v){for(const o of v.opts||[])if(o.mk&&o!==v.sel)detach(o.mk);v.sel=null;
    if(v.q<2){v.q++;makeOpts(v);v.ph='ask';v.t=0;idle=0;helpSaid=false;tell('q'+v.q,3.2)}
    else{v.opts=null;v.ph='photo';v.t=0;v.fgo=0}}

  /* ───── túnel de rentat: arc al fons, raspalls i dutxes que passen per davant, assecador al costat ───── */
  function startTunnel(v){v.ph='tunnel';v.t=0;tell('tunel',2.2);const T=st.tun={};
    for(const [n,k] of [['arc','tunel_arc'],['rasp','tunel_raspalls'],['aig','tunel_aigua'],['ass','tunel_assecador']]){T[n]={k,g:holder(k)};T[n].g.scale.setScalar(.001)}
    clip('tunel_arc','passar');clip('tunel_raspalls','girar');clip('tunel_aigua','ruixar');clip('tunel_assecador','girar');if(st.rw.ph==='home')clip('rita','celebrar',.2);clip(v.an,'riure',.2)}
  const pop=(t,a,b)=>t<a?0:t<b?eBack(c01((t-a)/.38)):1-eo(c01((t-b)/.3));
  function stepTunnel(v,dA){const t=v.t,T=st.tun,k=v.k,X=v.g.position.x,Z=v.g.position.z,m=IX[v.vk].meta,tp=t-dA;
    const put=(p,x,z,s,ry=0)=>{p.g.position.set(x,0,z);p.g.rotation.y=ry;p.g.scale.setScalar(Math.max(.001,s));p.g.visible=s>.002};
    put(T.arc,X,Z-.85,pop(t,0,8)*k*.98);
    const ur=ease(c01((t-.4)/2.2));put(T.rasp,X+lerp(-1.2,1.25,ur)*k,Z+.78,pop(t,.3,2.6)*k*.86);
    const ua=ease(c01((t-2.5)/2));put(T.aig,X+lerp(1.05,-.9,ua)*k,Z+.78,pop(t,2.4,4.5)*k*.86);
    put(T.ass,X+(m.mida[0]/2+.36)*k,Z+.35,pop(t,4.4,7.6)*k*.6,-.62);
    if(tp<.5&&t>=.5){clip(v.vk,'tremolar',.2);play('rc_raspalls',.55)}
    if(tp<2.5&&t>=2.5)play('rc_aigua',.55);
    if(tp<4.6&&t>=4.6)play('rc_aire',.55);
    if(tp<4.75&&t>=4.75){clip(v.an,'assecador',.2);if(v.vk==='excavadora')clip(v.vk,'assecador',.2)}
    if(tp<7.4&&t>=7.4){play('rc_brilla',.6);tell('brilla',1.8);if(v.vk!=='excavadora')clip(v.vk,'botzina',.2)}
    v.shine=t>7.3&&t<8.7?Math.sin(c01((t-7.3)/1.4)*Math.PI):0;glint(v.vk,v.shine*.14);glint(v.an,v.shine*.1);
    /* aigua de les dutxes, aire de l'assecador i espurnes */
    if(t>2.5&&t<4.5&&T.aig.g.visible){for(const d of IX.tunel_aigua.meta.dutxes){if(Math.random()>.55)continue;V2.set(d[0],d[2],-d[1]);T.aig.g.localToWorld(V2);const [px,py]=proj(V2);
      fxp.push({kind:'drop',x:px+rnd(-6,6),y:py+8,vx:rnd(-20,20),vy:rnd(120,220),g:1500,t:0,d:rnd(.35,.55)})}}
    if(t>4.7&&t<7.3&&Math.random()<.5){V2.set(0,IX.tunel_assecador.meta.centre[2],0);T.ass.g.localToWorld(V2);const [px,py]=proj(V2);
      fxp.push({kind:'air',x:px-40,y:py+rnd(-60,60),vx:-rnd(650,900),vy:0,g:0,t:0,d:rnd(.6,.9),w:rnd(40,80)})}
    if(v.shine>.1&&Math.random()<.35){const b=vBox(v);fxp.push({kind:'spark',x:rnd(b[0]+20,b[2]-20),y:rnd(b[1]+10,b[3]-30),vx:0,vy:0,g:0,t:0,d:.7,r:rnd(8,15)})}
    if(t>=8.8){for(const n in T){detach(T[n].k);if(T[n].g.parent)ROOT.remove(T[n].g)}st.tun=null;horn(v)}}
  function horn(v){v.ph='horn';v.t=0;clip(v.vk,'botzina',.15);clip(v.an,'botzina',.15);play('rc_botzina',.6,VOX[v.an]);tell('adeu_'+v.an,2.4)}

  /* ───── mirada ───── */
  function hit(x,y){if(!st||!st.v)return null;const v=st.v;
    if(MODE===0&&v.ph==='wash'){let best=null,bd=1e9;const r=sz().sp*.55;for(const s of v.spots){if(s.st)continue;const [px,py]=spotXY(v,s),d=Math.hypot(x-px,y-py);if(d<r&&d<bd){bd=d;best=s}}if(best)return{k:'spot',sp:best}}
    if(MODE===1&&v.ph==='ask'&&v.opts){for(const o of v.opts){if(o.gone)continue;const b=o.box;if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3])return{k:'opt',o}}}
    if(v.ph==='wash'||v.ph==='ask'){const b=aniBox(v);if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3])return{k:'ani'}}
    {const w=st.rw;if(x>w.x-80&&x<w.x+80&&y>w.y-300&&y<w.y+10)return{k:'rita'}}
    return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.sp===b.sp&&a.o===b.o);
  function actionable(g){if(!g||!st||!st.v)return false;const v=st.v;if(g.k==='spot')return !g.sp.st&&v.ph==='wash';if(g.k==='opt')return v.ph==='ask'&&!g.o.gone&&g.o.in>.5;
    if(g.k==='ani')return v.laugh<=0;if(g.k==='rita')return st.rita<=0&&RIG.rita.cn==='repos'&&st.rw.ph==='home';return false}
  function activate(g){if(!g||!st||!st.v)return;const v=st.v;
    if(g.k==='spot'){const s=g.sp;if(s.st||v.ph!=='wash')return;s.st=1;s.t=0;idle=0;helpSaid=false;STATS.n++;$('#oN').textContent=STATS.n;s.go=0;   /* la taca espera que la Rita hi arribi (stepRita) */
      return}
    if(g.k==='opt'){choose(g.o);return}
    if(g.k==='ani'){if(v.laugh>0)return;v.laugh=2.2;clip(v.an,'riure',.2);play('rc_riure',.6,VOX[v.an]);const b=aniBox(v);
      for(let i=0;i<7;i++)fxp.push({kind:'heart',x:(b[0]+b[2])/2+rnd(-40,40),y:b[1]+20,vx:rnd(-40,40),vy:rnd(-150,-90),g:0,t:0,d:1.4,r:rnd(10,16)});return}
    if(g.k==='rita'){st.rita=5;clip('rita',Math.random()<.5?'saludar':'riure',.2);if(RIG.rita.cn==='riure')play('rc_riure',.45,1.15)}}
  function hint(){if(!st||!st.v)return null;const v=st.v;
    if(MODE===0&&v.ph==='wash'){const left=v.spots.filter(s=>!s.st);if(!left.length)return null;const ref=cmx>-999?toWorld(cmx,cmy):[640,400];
      left.sort((a,b)=>{const pa=spotXY(v,a),pb=spotXY(v,b);return Math.hypot(pa[0]-ref[0],pa[1]-ref[1])-Math.hypot(pb[0]-ref[0],pb[1]-ref[1])});
      const s=left[0],[x,y]=spotXY(v,s);return{x,y,r:sz().sp*.5,sp:s}}
    if(MODE===1&&v.ph==='ask'&&v.opts){const L=v.opts.filter(o=>!o.gone);if(!L.length)return null;const o=L[v.hintI%L.length];return{x:o.x,y:o.y-o.sz*.5,r:o.sz*.6,o}}
    return null}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    for(const k in MX)MX[k].update(dA);for(const k in RIG)RIG[k].ct+=dA;
    ROOT.updateMatrixWorld(true);
    const v=st.v;
    /* mirada: hover (0,15 s), temps de selecció o clic */
    const g=has?hit(wx,wy):null;
    if(!same(g,cur)){cur=g;dw=0;if(g&&g.k==='opt'&&actionable(g))cap('o_'+g.o.k,1.2)}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur={k:'lock'};activate(g)}}else dw=0;
    /* la Rita torna al repòs */
    st.rita=Math.max(0,st.rita-dA);
    if(RIG.rita.once&&ends('rita'))ritaLoop(.3);
    stepRita(v,dA);
    if(v)stepVeh(v,dA);
    if(st.festa){const f=st.festa;f.t+=dA;if(!f.sp)f.sp=spinPlan(1,1.3,0)[0];st.rg.rotation.y=.38+spinA(f.sp,f.t);   /* la Rita fa un gir de festa */
      if(Math.random()<.9)for(let i=0;i<2;i++)fxp.push({kind:'conf',x:rnd(0,W),y:-10,vx:rnd(-40,40),vy:rnd(120,220),g:30,t:0,d:4,r:rnd(0,6),c:['#ffd85a','#ff9ec4','#8fd0ff','#9de39a','#e2564b'][i+Math.floor(Math.random()*3)]});
      if(f.t>5.2){st.festa=null;if(MODE===1)st.photos=[];newVehicle()}}
    for(const p of fxp){p.t+=dA;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA}fxp=fxp.filter(p=>p.t<p.d);
    for(const p of st.photos)p.t+=dA;
    const busy=!v||!(v.ph==='wash'||v.ph==='ask')||(v.spots.some(s=>s.st===1));
    if(busy)idle=0;else idle+=dA;
    if(idle>HELP*2&&!helpSaid){helpSaid=true;if(st.rw.ph==='home')clip('rita','assenyalar',.25);say(['mira'])}}
  /* ───── la Rita va a fregar cada taca: camina fins davant del vehicle, s'hi gira d'esquena, frega,
     i quan no en queda cap de pendent torna a poc a poc al seu lloc; si se n'activa una altra mentre torna, es gira i hi va ───── */
  const angTo=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*Math.min(1,k)};
  function ritaLoop(f){const w=st.rw;clip('rita',w.ph==='home'?'repos':w.ph==='scrub'?'fregar':'caminar',f,w.ph==='go'?1.5:1)}
  function ritaGo(w,s){w.ph='go';w.s=s;clip('rita','caminar',.2,1.5)}
  /* on va la Rita: a la taca (mode 1) o a l'escuma, l'adhesiu o el sostre que s'ha triat (mode 2) */
  const VR=new THREE.Vector3();
  function jobX(v,j){if(MODE===0)return spotXY(v,j)[0];const m=IX[v.vk].meta;
    if(j.q===0){const b=vBox(v);return (b[0]+b[2])/2}
    if(j.q===1){const a=ADH[v.vk];VR.set(a[0],a[1]-.3,m.amplada/2);v.cos.localToWorld(VR)}
    else{VR.set(...(TOPOFF[v.vk]||[0,0,0]));v.g.children[0].getObjectByName(IX[v.vk].peces.sostre).localToWorld(VR)}
    return proj(VR)[0]}
  function stepRita(v,dA){const w=st.rw,g=st.rg;
    const pend=!v?[]:MODE===0?(v.ph==='wash'?v.spots.filter(s=>s.st===1&&!s.go):[]):(v.ph==='apply'&&v.sel&&!v.sel.go?[v.sel]:[]);
    const live=j=>!!(j&&v&&(MODE===0?v.ph==='wash'&&j.st===1:v.ph==='apply'&&v.sel===j));
    const near=()=>pend.slice().sort((a,b)=>Math.abs(jobX(v,a)-w.x)-Math.abs(jobX(v,b)-w.x))[0];
    if(w.ph==='scrub'&&!live(w.s)){w.s=null;if(pend.length)ritaGo(w,near());else{w.ph='back';clip('rita','caminar',.3)}}
    if((w.ph==='home'||w.ph==='back')&&pend.length)ritaGo(w,near());
    if(w.ph==='go'&&(!live(w.s)||w.s.go)){w.s=null;w.ph='back';clip('rita','caminar',.3)}
    let tx=RX,ty=RY,face=.38;
    if(w.ph==='go'||w.ph==='scrub'){tx=clamp(jobX(v,w.s)-62,RX,W-120);ty=VY+52;face=Math.PI}
    const dx=(tx-w.x)/P,dz=(ty-w.y)/(P*SP),d=Math.hypot(dx,dz);
    if(w.ph==='go'||w.ph==='back'){const sp=(w.ph==='go'?2.1:.75)*dA;
      if(d<=sp+1e-4){w.x=tx;w.y=ty;
        if(w.ph==='go'){w.ph='scrub';w.s.go=1;if(MODE===0){w.s.t=0;play('rc_frega',.6,rnd(.95,1.08))}clip('rita','fregar',.2)}
        else{w.ph='home';clip('rita','repos',.4)}}
      else{w.x+=dx/d*sp*P;w.y+=dz/d*sp*P*SP;w.yaw=angTo(w.yaw,Math.atan2(dx,dz),dA*(w.ph==='go'?10:5))}}
    else w.yaw=angTo(w.yaw,face,dA*(w.ph==='scrub'?9:1.6));
    gpos(g.position,w.x,w.y);g.rotation.y=w.yaw}
  function stepVeh(v,dA){v.t+=dA;v.laugh=Math.max(0,v.laugh-dA);const m=IX[v.vk].meta,circ=2*Math.PI*(m.roda_r||0)*v.k;
    const wheels=spd=>{const a=RIG[v.vk].A.rodar;if(a&&RIG[v.vk].cn==='rodar')a.setEffectiveTimeScale(circ>0?clamp(spd/P/circ,0,3):Math.min(1.5,spd/250))};
    /* el conductor torna a conduir o al repòs quan acaba un gest */
    if(RIG[v.an].once&&ends(v.an))clip(v.an,v.ph==='enter'||v.ph==='leave'?'conduir':'repos',.3);
    if(v.ph==='enter'){const u=c01(v.t/2.6),x0=-660;v.x=lerp(x0,VX,eo(u));wheels((VX-x0)*3*Math.pow(1-u,2)/2.6);
      if(MODE===0&&!v.splash&&v.x>-80){v.splash=1;play('rc_xof',.75);placeSpots(v);clip(v.an,'sorpresa',.15);if(RIG.rita.cn==='repos')clip('rita','sorpresa',.2);
        const [fx0,fy0]=vpt(v,(m.mida[0]*.3),0,m.amplada/2);for(let i=0;i<24;i++)fxp.push({kind:'mud',x:fx0+rnd(-90,60),y:fy0+rnd(-14,6),vx:rnd(-120,220),vy:rnd(-520,-240),g:1100,t:0,d:1,r:rnd(5,11),c:Math.random()<.5?'#7a4a24':'#8e5a2e'})}
      if(u>=1){v.x=VX;v.t=0;clip(v.vk,'frenar',.12);play('rc_frena',.55);clip(v.an,'saludar',.2);
        if(MODE===0){v.ph='wash';tell('hola_'+v.an,2.2,['fang']);later(1.4,()=>{if(st&&st.v===v&&v.ph==='wash')cap('fang',2)})}
        else{v.ph='ask';v.q=0;makeOpts(v);tell('hola_'+v.an,2,['q0']);later(1.3,()=>{if(st&&st.v===v&&v.ph==='ask'&&v.q===0)cap('q0',3)})}}
      gpos(v.g.position,v.x,VY)}
    else if(v.ph==='wash'){for(const s of v.spots){s.in=Math.min(1,s.in+dA*3);if(s.st===1&&s.go){s.t+=dA;if(s.t>.75){s.st=2;s.t=0;const n=v.spots.filter(q=>q.st===2).length;
          play('rc_bombolla',.75,Math.pow(2,SCALE[Math.min(n-1,9)]/12));const [px,py]=spotXY(v,s);
          for(let i=0;i<10;i++)fxp.push({kind:'spark',x:px+rnd(-30,30),y:py+rnd(-30,30),vx:rnd(-60,60),vy:rnd(-90,-30),g:0,t:0,d:.9,r:rnd(5,9)});
          if(s.k.startsWith('cuc'))play('rc_boing',.6);if(s.k.startsWith('marieta'))play('rc_vola',.5);
          if(v.spots.every(q=>q.st===2)){clip(v.an,'riure',.2);play('rc_riure',.5,VOX[v.an])}}}else if(s.st===2)s.t+=dA}
      if(v.spots.length&&v.spots.every(s=>s.st===2&&s.t>1.2)&&st.rw.ph==='home')startTunnel(v)}   /* el túnel espera que la Rita torni al seu lloc */
    else if(v.ph==='tunnel')stepTunnel(v,dA);
    else if(v.ph==='ask'){for(const o of v.opts)stepOpt(o,dA)}
    else if(v.ph==='apply'&&!(v.sel&&v.sel.go)){for(const o of v.opts)stepOpt(o,dA);v.t=0}   /* espera que la Rita arribi al vehicle */
    else if(v.ph==='apply'){for(const o of v.opts)stepOpt(o,dA);const o=v.sel,t=v.t;
      if(o.q===0){if(o.fly)o.fly.t+=dA;if(!v.foam&&t>.55){makeFoam(v,FOAM[o.k]);play('rc_escuma',.6)}if(v.foam)v.foam.t+=dA;
        if(t-dA<2.7&&t>=2.7){play('rc_aigua',.5);clip(v.an,'riure',.2)}
        if(v.foam&&v.foam.t>2.1&&Math.random()<.7){const b=vBox(v);for(let i=0;i<3;i++)fxp.push({kind:'drop',x:rnd(b[0],b[2]),y:b[1]+rnd(-40,0),vx:0,vy:rnd(200,300),g:1400,t:0,d:rnd(.4,.6)})}
        if(t>3.9){v.foam=null;advanceQ(v)}}
      else{const f=o.fly;if(f&&!f.done){f.t+=dA;const u=c01(f.t/.8),e=ease(u),e2=eo(u);let tx,ty,tz,ts;
          if(o.q===1){const a=ADH[v.vk];V2.set(a[0],a[1]-.3,IX[v.vk].meta.amplada/2+.004);v.cos.localToWorld(V2);ts=a[2]*v.k}
          else{V2.set(...(TOPOFF[v.vk]||[0,0,0]));v.g.children[0].getObjectByName(IX[v.vk].peces.sostre).localToWorld(V2);ts=.8*v.k}
          tx=V2.x;ty=V2.y;tz=V2.z;o.g.position.set(lerp(f.x,tx,e),lerp(f.y,ty,e)+Math.sin(u*Math.PI)*.7,lerp(f.z,tz,e));o.g.scale.setScalar(lerp(f.s,ts,e2));
          if(u>=1){f.done=1;const obj=PROTO[o.mk];o.g.remove(obj);if(o.g.parent)ROOT.remove(o.g);
            if(o.q===1){const a=ADH[v.vk];v.cos.add(obj);obj.position.set(a[0],a[1]-.3,IX[v.vk].meta.amplada/2+.004);obj.scale.setScalar(a[2]);v.stick=o.k}
            else{v.g.children[0].getObjectByName(IX[v.vk].peces.sostre).add(obj);obj.position.set(...(TOPOFF[v.vk]||[0,0,0]));obj.scale.setScalar(.8);v.top=o.k}
            obj.rotation.set(0,0,0);clip(o.mk,'posar',.05);play('rc_plic',.7);clip(v.an,'riure',.2);v.applied=t}}
        if(o.q===2&&RIG[o.mk].cn==='posar'&&ends(o.mk))clip(o.mk,'gronxar',.2);
        if(f&&f.done&&t>v.applied+1)advanceQ(v)}}
    else if(v.ph==='photo'&&!v.fgo){v.t=0;const w=st.rw;   /* la foto es fa quan la Rita torna a ser al seu lloc */
      if(w.ph==='home'&&Math.abs(Math.atan2(Math.sin(w.yaw-.38),Math.cos(w.yaw-.38)))<.12){v.fgo=1;tell('foto',2.4);clip('rita','foto',.2);clip(v.an,'saludar',.2)}}
    else if(v.ph==='photo'){if(v.top&&RIG['sostre_'+v.top].cn==='posar'&&ends('sostre_'+v.top))clip('sostre_'+v.top,'gronxar',.2);
      if(!v.shot&&v.t>=1.42){v.shot=1;play('rc_foto',.7);snapReq=true}
      if(v.t>3.5)horn(v)}
    else if(v.ph==='horn'){if(v.t>1.25){v.ph='leave';v.t=0;clip(v.vk,'arrencar',.12);clip(v.an,'saludar',.2);play('rc_motor',.45,rnd(1,1.08))}}
    else if(v.ph==='leave'){const spd=v.t<.4?60:Math.min(640,170+(v.t-.4)*400);if(v.t>=.4&&RIG[v.vk].cn!=='rodar')clip(v.vk,'rodar',.15);wheels(spd);
      /* surt girant cap a la seva dreta (cap a nosaltres) i marxa per la part de baix de la pantalla, cap a la dreta:
         el camí es corba fins a 62° avall i el vehicle gira fins a 58°, de manera que se'l veu de tres quarts i una mica més gran */
      if(v.ly==null)v.ly=VY;const ph=1.08*ease(c01((v.t-.3)/1.45));v.yaw=ph*.94;
      v.x+=spd*Math.cos(ph)*dA;v.ly+=spd*Math.sin(ph)*dA;gpos(v.g.position,v.x,v.ly);v.g.rotation.y=-v.yaw;v.g.scale.setScalar(v.k*(1+.12*c01((v.ly-VY)/260)));
      if(v.x>W+640||v.ly>H+120&&vBox(v)[1]>H+8||v.ly>H+700){clearVeh(v);st.v=null;st.done++;const fest=MODE===0?st.done%3===0:st.photos.length>=6;
        if(fest){st.festa={t:0};play('rc_festa',.6);tell(MODE===0?'festa1':'festa2',4);clip('rita','celebrar',.2)}else newVehicle()}}
    if(v.ph==='photo'||v.ph==='horn'||v.ph==='leave'){if(v.top&&RIG['sostre_'+v.top].cn==='posar'&&ends('sostre_'+v.top))clip('sostre_'+v.top,'gronxar',.2)}}
  function stepOpt(o,dA){o.in+=dA*2.2;const s=o.gone?Math.max(0,1-o.gone):eBack(c01(o.in));if(o.gone)o.gone+=dA*3.2;
    if(o.g&&!(o.fly)){o.g.scale.setScalar(Math.max(.001,o.base*s));o.g.visible=s>.01}}

  /* ───── dibuix ───── */
  function glow(c,x,y,rx,ry,k=1){const p=.5+.5*Math.sin(now*3);c.fillStyle=`rgba(255,248,200,${(.22+.2*p)*k})`;c.beginPath();c.ellipse(x,y,rx+6*p,ry+4*p,0,0,7);c.fill()}
  function arrow(c,x,y){c.fillStyle='#ffd85a';c.strokeStyle='#7a4a00';c.lineWidth=3;const by=y-Math.abs(Math.sin(now*4))*16;c.beginPath();c.moveTo(x,by+34);c.lineTo(x-24,by);c.lineTo(x+24,by);c.closePath();c.fill();c.stroke()}
  function star4(c,x,y,s,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s*.3,y);c.lineTo(x,y+s);c.lineTo(x-s*.3,y);c.closePath();c.fill();c.beginPath();c.moveTo(x-s*.7,y);c.lineTo(x,y+s*.22);c.lineTo(x+s*.7,y);c.lineTo(x,y-s*.22);c.closePath();c.fill()}
  function foamPile(c,col,x,y,sz){c.save();c.translate(x,y-sz*.45);c.fillStyle=col;c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=3;
    for(const [dx,dy,rr] of [[-.22,.08,.26],[.2,.1,.27],[0,-.12,.3],[-.05,.18,.24],[.28,-.08,.18],[-.3,-.1,.17]]){c.beginPath();c.arc(dx*sz,dy*sz,rr*sz,0,7);c.fill();c.stroke()}
    c.fillStyle='rgba(255,255,255,.7)';for(const [dx,dy,rr] of [[-.08,-.2,.06],[.18,0,.045],[-.25,.02,.04]]){c.beginPath();c.arc(dx*sz,dy*sz,rr*sz,0,7);c.fill()}c.restore()}
  function drawShelf(c,v,H0){const L=v.opts;if(!L||!L.length)return;const s=L[0].sz,x0=L[0].x-s*.72,x1=L[L.length-1].x+s*.72,y=SHY;
    c.fillStyle='rgba(60,40,20,.18)';c.beginPath();c.roundRect(x0+6,y+10,x1-x0,16,6);c.fill();
    c.fillStyle='#c48a52';c.strokeStyle='#7d5229';c.lineWidth=4;c.beginPath();c.roundRect(x0,y,x1-x0,18,6);c.fill();c.stroke();
    c.fillStyle='#9a6a3a';for(const xx of [x0+30,x1-30]){c.beginPath();c.moveTo(xx-10,y+18);c.lineTo(xx+10,y+18);c.lineTo(xx,y+44);c.closePath();c.fill()}
    for(const o of L){if(o.gone>=1)continue;const hl=H0&&H0.o===o;if(v.ph==='ask'&&o.in>.5)glow(c,o.x,o.y-o.sz*.5,o.sz*.6,o.sz*.56,hl?1.3:.3);
      if(cur&&cur.o===o&&v.ph==='ask')glow(c,o.x,o.y-o.sz*.5,o.sz*.62,o.sz*.6,.9);
      if(o.q===0&&!(o.fly&&o.fly.t>.5)){let sc=o.gone?Math.max(0,1-o.gone):eBack(c01(o.in)),x=o.x,yy=o.y;
        if(o.fly){const u=c01(o.fly.t/.5),b=vBox(v);x=lerp(o.x,(b[0]+b[2])/2,ease(u));yy=lerp(o.y,(b[1]+b[3])/2,ease(u))-Math.sin(u*Math.PI)*90;sc=lerp(1,.6,u)}
        if(sc>.01)foamPile(c,FOAM[o.k],x,yy,o.sz*sc)}}}
  function drawBoard(c){const [x,y,w,h]=BOARD;c.fillStyle='rgba(60,40,20,.2)';c.beginPath();c.roundRect(x+6,y+8,w,h,10);c.fill();
    c.fillStyle='#c79a63';c.strokeStyle='#8a5f33';c.lineWidth=6;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();c.stroke();
    c.fillStyle='rgba(120,80,40,.25)';for(let i=0;i<70;i++){c.beginPath();c.arc(x+10+((i*37)%(w-20)),y+10+((i*53)%(h-20)),2,0,7);c.fill()}
    st.photos.forEach((p,i)=>{if(p.t<1)return;drawPhoto(c,p,i,slot(i)[0],slot(i)[1],1)})}
  const slot=i=>[BOARD[0]+40+(i%3)*68,BOARD[1]+56+Math.floor(i/3)*88];
  function drawPhoto(c,p,i,x,y,s){c.save();c.translate(x,y);c.rotate((i%2?.06:-.05));c.scale(s,s);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(-28,-28,60,70);c.fillStyle='#fffdf6';c.fillRect(-31,-31,60,70);
    if(p.img)c.drawImage(p.img,-27,-27,52,44);c.fillStyle='#d9483b';c.beginPath();c.arc(-1,-32,4.5,0,7);c.fill();c.restore()}
  function snap(){snapReq=false;const v=st.v;if(!v)return;const b=vBox(v),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2-20,hw=Math.max(b[2]-b[0],(b[3]-b[1]+120)*1.18)/2+30,hh=hw/1.18;
    const pc=document.createElement('canvas');pc.width=208;pc.height=176;const g=pc.getContext('2d');const x0=cx-hw,y0=cy-hh;
    g.fillStyle='#9fd3ef';g.fillRect(0,0,208,176);
    try{const k=SC*DPR;g.drawImage(cv,OX*DPR+x0*k,OY*DPR+y0*k,2*hw*k,2*hh*k,0,0,208,176);const q=cvs.width/W;g.drawImage(cvs,x0*q,y0*q,2*hw*q,2*hh*q,0,0,208,176)}catch(e){}
    let fx0=0,fy0=0;{const r=PROTO.rita.getObjectByName('camera');if(r){r.getWorldPosition(V2);[fx0,fy0]=proj(V2)}else{fx0=RX;fy0=RY-220}}
    st.photos.push({img:pc,t:0,fx:fx0,fy:fy0,an:v.an})}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&IM.fons&&IM.fons.complete)c.drawImage(IM.fons,0,0,W,H);
    if(!R||!ready||!st)return;
    const v=st.v,H0=idle>HELP?hint():null;
    if(MODE===1)drawBoard(c);
    if(MODE===1&&v&&v.opts&&(v.ph==='ask'||v.ph==='apply'))drawShelf(c,v,H0);
    /* ombres */
    c.fillStyle='rgba(60,40,20,.2)';c.beginPath();c.ellipse(st.rw.x+6,st.rw.y+4,74,13,0,0,7);c.fill();
    if(v){const m=IX[v.vk].meta,yw=v.yaw||0,ks=v.g.scale.x,[sx,sy]=proj(V1.set(v.g.position.x,0,v.g.position.z+.06));c.fillStyle='rgba(60,40,20,.22)';c.beginPath();   /* l'ombra segueix el gir de la sortida */
      c.ellipse(sx,sy+8,P*ks*.5*(m.mida[0]*Math.cos(yw)+(m.amplada||.6)*Math.sin(yw)),18*ks+P*SP*ks*.5*m.mida[0]*Math.sin(yw)*.8,0,0,7);c.fill()}
    if(H0&&H0.o)arrowIf(c,H0);
    {const sp=!!(v&&MODE===0&&(v.ph==='wash'||v.ph==='enter')&&v.spots.length),on=sp||!!(v&&v.foam);SL.m.visible=on;
     if(on){const g=SL.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);if(sp){drawSpotImgs(g,v);if(v.ph==='wash'){drawGlows(g,v,H0);drawOnCar(g,v)}}if(v.foam)drawFoam(g,v);   /* l'escuma del mode 2 també, per darrere de la Rita */SL.t.needsUpdate=true;
       const zp=v.g.position.z+(IX[v.vk].meta.amplada||.6)/2*v.g.scale.x+.04,Yt=(360+zp*SP*P)/(CP*P);SL.m.scale.set(W/P,H/(CP*P),1);SL.m.position.set((W/2-640)/P,Yt-H/(CP*P)/2,zp)}}
    /* la Rita sempre per davant de l'escena 3D (túnel, raspalls, vehicle, taques): segona passada amb la profunditat esborrada */
    st.rg.traverse(o=>o.layers.set(1));amb.layers.enable(1);sun.layers.enable(1);
    cam.layers.set(0);R.render(S3,cam);R.autoClear=false;R.clearDepth();cam.layers.set(1);R.render(S3,cam);R.autoClear=true;cam.layers.set(0);
    if(snapReq)snap();
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    if(!CFG.simple&&IM.davant&&IM.davant.complete)f.drawImage(IM.davant,0,0,W,H);   /* vegetació de baix a l'esquerra per davant de la Rita (i dels vehicles) */
    if(v&&MODE===0&&v.ph==='wash')drawSpots(f,v,H0);
    if(v&&(v.ph==='wash'||v.ph==='ask')&&cur&&cur.k==='ani'&&actionable(cur)){const b=aniBox(v);glow(f,(b[0]+b[2])/2,(b[1]+b[3])/2,(b[2]-b[0])*.5,(b[3]-b[1])*.5,.5)}
    for(const p of fxp)drawP(f,p);f.globalAlpha=1;
    /* fotos que volen cap al suro */
    st.photos.forEach((p,i)=>{if(p.t>=1)return;const u=ease(c01(p.t)),[tx,ty]=slot(i);drawPhoto(f,p,i,lerp(p.fx,tx,u),lerp(p.fy,ty,u),lerp(2.2,1,u))});
    if(H0&&H0.sp&&idle>HELP*2)arrow(f,H0.x,H0.y-sz().sp*.55-36);
    drawCap(f)}
  function arrowIf(c,H0){if(idle>HELP*2)arrow(c,H0.x,H0.y-H0.r-40)}
  function drawSpotImgs(f,v){const s0=sz().sp;
    for(const s of v.spots){if(s.st===2)continue;const im=IM[s.k];if(!im||!im.complete||!im.naturalWidth)continue;let a=s.in;if(s.st===1)a*=1-c01((s.t-.3)/.45);if(a<=.01)continue;
      const [x,y]=spotXY(v,s),hh=s0*Math.min(1,im.naturalHeight/im.naturalWidth)*1.25,w=hh*im.naturalWidth/im.naturalHeight;
      f.save();f.globalAlpha=a;f.translate(x,y);f.rotate(s.r);f.drawImage(im,-w/2,-hh/2,w,hh);f.restore()}}
  function drawGlows(f,v,H0){const s0=sz().sp;   /* brillantor de les taques: a la capa del vehicle, també per darrere de la Rita */
    for(const s of v.spots){if(s.st)continue;const [x,y]=spotXY(v,s),hl=H0&&H0.sp===s;glow(f,x,y,s0*.5,s0*.42,hl?1.2:.12);if(cur&&cur.sp===s)glow(f,x,y,s0*.54,s0*.46,.8)}}
  function drawSpots(f,v,H0){
    /* gags: la marieta se'n va volant (per sobre de tot) */
    for(const s of v.spots){if(s.st!==2||s.t>2)continue;const [px,py]=spotXY(v,s);
      if(s.k.startsWith('marieta')){const u=s.t/2,x=px+u*260,y=py-Math.sin(u*Math.PI)*200-u*120;f.fillStyle='#d63a2f';f.beginPath();f.arc(x,y,13,0,7);f.fill();f.fillStyle='#222';f.beginPath();f.arc(x+11,y,6,0,7);f.arc(x-4,y-4,2.6,0,7);f.arc(x+2,y+5,2.6,0,7);f.fill();f.fillStyle='rgba(255,255,255,.6)';f.beginPath();f.ellipse(x-4,y-11,9,5,Math.sin(now*40)*.6,0,7);f.fill()}}}
  /* sobre la xapa (capa 3D enganxada al costat del vehicle, que la Rita tapa quan hi passa per davant): esponja i cuc */
  function drawOnCar(f,v){
    /* esponja de la Rita: surt de la mà, vola fins a la taca i frega */
    let ex=RX+40,ey=RY-140;const so=PROTO.rita.getObjectByName('esponja');if(so){so.getWorldPosition(V2);[ex,ey]=proj(V2)}
    for(const s of v.spots){if(s.st!==1||!s.go)continue;const [px,py]=spotXY(v,s),u=c01(s.t/.75),fl=c01(u/.3);
      const x=lerp(ex,px,ease(fl))+(fl>=1?Math.cos(s.t*22)*22:0),y=lerp(ey,py,ease(fl))-Math.sin(fl*Math.PI)*80+(fl>=1?Math.sin(s.t*22)*14:0);
      f.fillStyle='rgba(255,255,255,.85)';if(fl>=1)for(let i=0;i<6;i++){f.beginPath();f.arc(px+Math.cos(i*1.1+s.t*4)*34,py+Math.sin(i*1.7+s.t*3)*24,8+i%3*3,0,7);f.fill()}
      f.fillStyle='#ffd45a';f.strokeStyle='#c9952a';f.lineWidth=3;f.beginPath();f.roundRect(x-30,y-20,60,40,12);f.fill();f.stroke();f.fillStyle='rgba(201,149,42,.55)';for(let i=0;i<5;i++){f.beginPath();f.arc(x-16+i*8,y-6+(i%2)*10,3,0,7);f.fill()}}
    /* gags: el cuc saluda */
    for(const s of v.spots){if(s.st!==2||s.t>2)continue;const [px,py]=spotXY(v,s);
      if(s.k.startsWith('cuc')){const a=Math.sin(c01(s.t/2)*Math.PI);f.save();f.globalAlpha=a;f.translate(px,py-10);f.rotate(Math.sin(s.t*10)*.25);f.fillStyle='#f4a7b4';f.strokeStyle='#c46d7d';f.lineWidth=3;f.beginPath();f.roundRect(-12,-60,24,64,12);f.fill();f.stroke();f.fillStyle='#3b2a2a';f.beginPath();f.arc(-5,-46,3,0,7);f.arc(5,-46,3,0,7);f.fill();f.restore()}}}
  function drawFoam(f,v){const F=v.foam,u=c01(F.t/1.1),out=F.t>2.7?c01((F.t-2.7)/1):0,span=F.x1-F.x0;f.globalAlpha=(1-out)*.94;f.fillStyle=F.col;
    for(const b of F.b){if((b.x-F.x0)/span>u+.04)continue;const [x,y]=vpt(v,b.x,b.y,b.z);f.beginPath();f.arc(x,y+out*70,b.r*P*v.k*(.9+.1*Math.sin(now*3+b.p)),0,7);f.fill()}
    f.fillStyle='rgba(255,255,255,.7)';for(const b of F.b){if((b.x-F.x0)/span>u||b.p>2.2)continue;const [x,y]=vpt(v,b.x,b.y,b.z),r=b.r*P*v.k;f.beginPath();f.arc(x-r*.35,y-r*.35+out*70,r*.22,0,7);f.fill()}f.globalAlpha=1}
  function drawP(f,p){const a=Math.max(0,1-p.t/p.d);
    if(p.kind==='heart'){f.globalAlpha=a;f.fillStyle='#ff6e96';f.font=`${Math.round(p.r*2)}px system-ui`;f.textAlign='center';f.fillText('♥',p.x,p.y);f.textAlign='left';return}
    if(p.kind==='spark'){f.globalAlpha=a;star4(f,p.x,p.y,p.r*(1-p.t/p.d)*1.6+2,'rgba(255,250,215,1)');return}
    if(p.kind==='drop'){f.globalAlpha=a*.85;f.strokeStyle='#8cc8f0';f.lineWidth=3;f.beginPath();f.moveTo(p.x,p.y);f.lineTo(p.x-p.vx*.02,p.y-14);f.stroke();return}
    if(p.kind==='air'){f.globalAlpha=Math.sin(c01(p.t/p.d)*Math.PI)*.75;f.strokeStyle='#ffffff';f.lineWidth=4;f.lineCap='round';f.beginPath();f.moveTo(p.x,p.y);f.quadraticCurveTo(p.x+p.w*.5,p.y-10,p.x+p.w,p.y);f.stroke();f.lineCap='butt';return}
    if(p.kind==='conf'){f.globalAlpha=Math.min(1,a*2);f.save();f.translate(p.x,p.y);f.rotate(p.t*4+p.r);f.fillStyle=p.c;f.fillRect(-7,-4,14,8);f.restore();return}
    f.globalAlpha=a;f.fillStyle=p.c||'#7a4a24';f.beginPath();f.arc(p.x,p.y,p.r||6,0,7);f.fill()}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('renta.'+c.k);f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=W/2,y=MODE===1?698:150,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,253,244,.94)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,54,27);f.fill();f.fillStyle='#244a66';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+3);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function layout(){if(!ready)return;newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newGame()}
  function tray(){const t=$('#tray');t.innerHTML='';['renta.m1','renta.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  function mus(){return 'm_renta'}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:()=>null,hit,hint,activate,actionable,scr,spotXY,aniBox,vBox,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},PROTO,RIG,IX}
})();
