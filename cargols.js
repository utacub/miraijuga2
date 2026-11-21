/* =========================================================
   ESCENARI: LA CURSA DE CARGOLS
   Sis cargols de ceràmica esmaltada (mateix model, closca i complement propis: la Rogeta i el casquet, en Blauet i la bufanda,
   la Menta i la diadema, en Mel i la gorra, la Lila i les ulleres, en Tronc i el barret de copa) i la Mariona, la marieta àrbitra.
   Fons de brodat; pista, rastre, ombres i pètals en 2D; tot el que es mou és 3D (models fets amb Blender).
   «Endavant, cargol!» (alternar la mirada): pedres de sortida i bandera; mirar un cargol el fa lliscar un tram (rastre brillant i
     una nota que puja); després badalla, es fica a la closca i descansa; mentrestant les banyes d'un altre brillen.
     Sorpreses al camí (gota, bolet paraigua, molsa amb trèvol). A la meta: arc de margarides, medalla de la Mariona i el gag
     de cada cargol. Tots arriben, sense guanyador: foto de grup. Festa gran cada 3 curses.
   «Del petit al gran» (seriació): mirar el més petit dels que esperen; s'arrengleren i desfilen fins a la meta. Error: «no»
     amb les banyes, sense so.
   Ajuda: als 6 s brilla el que toca; als 12 s la Mariona hi vola i l'assenyala. Sense flaixos. Tecla P: canvia de mode.
   ========================================================= */
const CARGOLS=(()=>{
  const TX=__CGTX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['cargols.'+k]=TX[l][k];
  const IX=__CGIX__;
  const NOMS=['rogeta','blauet','menta','mel','lila','tronc'];
  const GAG={rogeta:'helix',blauet:'bufanda',menta:'petals',mel:'gorra',lila:'ulleres',tronc:'barret'};
  const NOTES=[233.08,261.63,293.66,311.13,349.23,392,440,466.16].map(f=>f/261.63);   // si♭ major a partir de la mostra (do 4)
  const S1=[{n:2,tr:3,h:190,lanes:[470,650]},{n:3,tr:4,h:150,lanes:[410,530,650]},{n:4,tr:5,h:112,lanes:[372,468,564,660]}];
  const S2=[[.55,1],[.55,.75,1],[.5,.63,.8,1]],H2=200,ROWY=455,WAITY=688;
  const XS=150,XE=1050,FINX=1130,SLIDE=2,HIDE=2.4;
  const P=200,PIT=14*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6;
  const MHOME=[1200,300],MSTART=[150,262],METAP=[FINX,262],PED=[[330,266],[1010,284]],MH=128,METAH=150;
  const PETC=['#f6e7c8','#f3c84a','#e88b8b','#b9d38a','#b9a3d6','#ffffff'];
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,loading=0;
  const PROTO={},CL={},MAT={},TXS={},IM={},INST=[];
  let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],helpSaid=false,order=[],M=null,META=null,PEB=null,ales=null,races=0;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const lerp=(a,b,t)=>a+(b-a)*t,eo=t=>1-Math.pow(1-t,3),c01=t=>clamp(t,0,1);
  const ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3();
  const kOf=h=>h/(P*CP);

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3g';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3gf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.5);sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-3,6,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    IM.fons=img('cargols/fons.webp');
    load();resize()}
  /* càrrega: 14 models (2,3 MB); cada malla recorda la seva textura per al material */
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX);let n=keys.length;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const k of keys)L.load(U('cargols/m/'+k+'.glb'),g=>{PROTO[k]=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name]=c;
        g.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.userData.tex=IX[k].tex}});done()},undefined,e=>{console.error(e);done()})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── ceràmica esmaltada (LLEGEIX dels models): alta = Standard amb RoomEnvironment; ràpid = Phong ───── */
  function tx(n){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('cargols/t/'+n+'.webp'));t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mat(n){if(MAT[n])return MAT[n];const c=tx(n),glass=n==='gota_color';let m;
    if(LOWQ)m=new THREE.MeshPhongMaterial({map:c,shininess:110,specular:0x666666});
    else m=new THREE.MeshStandardMaterial({map:c,roughness:glass?.08:.2,metalness:0,envMap:ENV,envMapIntensity:1});
    if(glass){m.transparent=true;m.opacity=.86}
    return MAT[n]=m}
  function paint(o,n){o.traverse(m=>{if(m.isMesh){m.userData.tex=n;m.material=mat(n)}})}
  function quality(){if(!R)return;lq=LOWQ;for(const k in MAT){MAT[k].dispose();delete MAT[k]}
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    S3.traverse(o=>{if(o.isMesh&&o.userData.tex)o.material=mat(o.userData.tex)});
    amb.intensity=LOWQ?1.0:.5;sun.intensity=LOWQ?1.6:1.3;resize()}

  /* ───── pantalla (px, 1280×720) ↔ món ───── */
  const gpos=(v,px,py)=>v.set((px-640)/P,0,(py-360)/(P*SP));
  const proj=v=>[640+v.x*P,360+v.z*SP*P-v.y*CP*P];
  function later(t,f){wait.push({t:now+t,f})}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=3){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs v4: cargols/v/<idioma>_<clau>.mp3; si no hi són, només el rètol) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('cargols/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=2.6,more){cap(k,d);say(more?[k].concat(more):[k])}
  const snd=(n,g=.6,r=1)=>play('cg_'+n,g,r);
  /* brunzit de les ales de la Mariona (bucle d'1 s fet per síntesi; es repeteix de 0,1 a 0,9 s, un nombre sencer de cicles) */
  function alesOn(){if(ales||!AC||!BUF.cg_ales||!CFG.sound)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=BUF.cg_ales;s.loop=true;s.loopStart=.1;s.loopEnd=.9;
    g.gain.setValueAtTime(0,AC.currentTime);g.gain.linearRampToValueAtTime(.55,AC.currentTime+.2);s.connect(g);g.connect(SG);s.start();ales={s,g}}
  function alesOff(){if(!ales)return;const a=ales;ales=null;try{a.g.gain.cancelScheduledValues(AC.currentTime);a.g.gain.setValueAtTime(a.g.gain.value,AC.currentTime);a.g.gain.linearRampToValueAtTime(0,AC.currentTime+.25);a.s.stop(AC.currentTime+.3)}catch(e){}}

  /* ───── instàncies (clons amb esquelet propi) i clips ───── */
  function cloneSkinned(src){const c=src.clone(true),sm=new Map(),cm=new Map();
    (function par(a,b){sm.set(a,b);cm.set(b,a);for(let i=0;i<a.children.length;i++)par(a.children[i],b.children[i])})(src,c);
    c.traverse(n=>{if(!n.isSkinnedMesh)return;const s=cm.get(n),sk=s.skeleton;n.skeleton=sk.clone();n.bindMatrix.copy(s.bindMatrix);
      n.skeleton.bones=sk.bones.map(b=>sm.get(b));n.bind(n.skeleton,n.bindMatrix);n.frustumCulled=false});return c}
  function inst(k,parent,tex){const o=cloneSkinned(PROTO[k]),w=new THREE.Group();w.add(o);(parent||ROOT).add(w);paint(o,tex||IX[k].tex);
    const x={k,w,o,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',ct:0,dur:0,ts:1,once:false,fired:{}};INST.push(x);return x}
  function free(x){if(!x)return;x.w.removeFromParent();x.mx.stopAllAction();x.o.traverse(n=>{if(n.isSkinnedMesh)n.skeleton.dispose()});const i=INST.indexOf(x);if(i>=0)INST.splice(i,1)}
  function clip(x,n,fade=.2,ts=1){if(!x)return;const c=CL[x.k][IX[x.k].prefix+n],info=IX[x.k].clips[n];if(!c||!info)return;let a=x.A[n];if(!a)a=x.A[n]=x.mx.clipAction(c);
    const loop=!!info[1],prev=x.cur;a.enabled=true;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveTimeScale(ts);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a){if(fade>0)prev.crossFadeTo(a,fade,false);else prev.stop()}
    x.cur=a;x.cn=n;x.ct=0;x.ts=ts;x.dur=c.duration/ts;x.once=!loop;x.fired={}}
  const ends=(x,m=.06)=>x&&x.once&&x.ct>=x.dur-m;
  function evt(x,name){if(!x||!x.cn)return false;const e=IX[x.k].clips[x.cn][2][name];if(e==null||x.fired[name])return false;if(x.ct>=e/x.ts){x.fired[name]=1;return true}return false}
  const wpos=(x,bone,v)=>{const b=x.o.getObjectByName(bone);if(b)b.getWorldPosition(v);else x.w.getWorldPosition(v);return v};

  /* ───── partida ───── */
  function clearAll(){while(INST.length)free(INST[INST.length-1]);while(ROOT.children.length)ROOT.remove(ROOT.children[0]);M=null;META=null;PEB=null;alesOff()}
  function pick(n){const out=[];while(out.length<n){if(!order.length)order=shuffle(NOMS.slice());const s=order.pop();if(!out.includes(s))out.push(s)}return out}
  function newGame(){if(!ready)return;vStop();clearAll();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;races=0;
    st={sn:[],sur:[],trail:[],cap:null,ph:'intro',t:0,festa:null,placed:0,first:true};
    META=inst('meta');const km=kOf(METAH);gpos(META.w.position,METAP[0],METAP[1]);META.w.scale.setScalar(km);clip(META,'repos');
    M={x:inst('mariona'),X:MHOME[0],Y:MHOME[1],alt:0,mode:'stand',t:0,tx:0,ty:0,then:null,react:0,ry:0,help:null,k:kOf(MH)};
    PEB=inst('pedres');PEB.w.scale.setScalar(1.15);clip(PEB,'repos');
    newRace()}
  function newRace(){if(st.sn.length){for(const sn of st.sn){free(sn.medal);free(sn.comp);free(sn.x)}for(const s of st.sur)free(s.x)}
    st.sn=[];st.sur=[];st.trail=[];st.festa=null;st.placed=0;st.ph='intro';st.t=0;idle=0;helpSaid=false;cur=null;dw=0;
    const ped=PED[MODE];gpos(PEB.w.position,ped[0],ped[1]);clip(PEB,'repos');clip(META,'repos',.3);
    if(MODE===0){const s=S1[CFG.size],L=pick(s.n),k=kOf(s.h);
      st.sn=L.map((nom,i)=>mkSnail(nom,{lane:i,Y:s.lanes[i],h:s.h,k,X:XS,p:0,tram:0,ph:'wait',wait:0,pop:-i*.12}));
      /* sorpreses: una per carril, cadascuna en un tram diferent (mai el primer) perquè no es tapin */
      {const trs=shuffle(Array.from({length:s.tr-1},(_,i)=>i+2)),kinds=shuffle(['gota','bolet','molsa']);
        const kk=st.sn.map((_,i)=>kinds[i%3]),j=trs.indexOf(s.tr);
        /* el bolet no va a l'últim tram: taparia el cargol a la foto de la meta */
        if(j>=0&&kk[j]==='bolet'){const o=kk.findIndex(q=>q!=='bolet');if(o>=0){kk[j]=kk[o];kk[o]='bolet'}}
        st.sn.forEach((sn,i)=>st.sur.push(mkSur(sn,kk[i],lerp(XS,XE,(trs[i]-.5)/s.tr))))}
      if(st.first){M.X=MSTART[0];M.Y=MSTART[1];M.alt=0;M.mode='stand';clip(M.x,'repos',.1);later(.5,()=>tell('hola',2.4));later(2.8,count)}
      else if(M.mode==='stand'&&Math.hypot(M.X-MSTART[0],M.Y-MSTART[1])<4)later(1.1,count);else marGo(MSTART[0],MSTART[1],()=>later(.4,count))}
    else{const sc=S2[CFG.size],L=pick(sc.length),n=sc.length,ord=shuffle(sc.map((_,i)=>i));
      /* esperen a baix en ordre barrejat, sense tocar-se i dins la pantalla */
      const wd=ord.map(i=>H2*sc[i]*(.62+.75)),tot=wd.reduce((a,b)=>a+b,0),g=Math.min(130,(1100-tot)/Math.max(1,n-1));let x0=90+(1100-tot-g*(n-1))/2;const X2=[];
      ord.forEach((i,j)=>{X2[i]=x0+H2*sc[i]*.62;x0+=wd[j]+g});
      st.sn=L.map((nom,i)=>mkSnail(nom,{sc:sc[i],rank:i,h:H2*sc[i],k:kOf(H2*sc[i]),X:X2[i],Y:WAITY,ph:'wait',react:0,pop:-i*.12}));
      if(Math.hypot(M.X-MHOME[0],M.Y-MHOME[1])>4)marGo(MHOME[0],MHOME[1]);
      later(.7,()=>{if(st&&st.ph==='intro'){st.ph='line';idle=0;tell('petit',3)}})}
    st.first=false}
  function mkSnail(nom,o){const x=inst('cargol',null,IX.cargol.closques[nom]),ck=IX.cargol.complements[nom],b=x.o.getObjectByName(IX[ck].meta.buit);
    const sn=Object.assign({nom,x,comp:inst(ck,b),medal:null,t:0,ry:0,ry0:0,ry1:0,react:0,gag:0,wob:0},o);clip(x,'repos',0);x.mx.setTime(Math.random()*3);place(sn);return sn}
  function mkSur(sn,kind,X){const k=sn.k,x=inst(kind);const s={sn,kind,x,X,st:0,t:0,pop:sn.pop-.3};
    if(kind==='gota'){s.sc=1.25*k;s.px=X-.1*k*P;s.py=sn.Y;s.alt=1.0*k;clip(x,"repos")}
    else if(kind==='bolet'){s.sc=2.7*k;s.px=X+.25*k*P;s.py=sn.Y-10;s.alt=0;clip(x,'repos')}
    else{s.sc=2.0*k;s.px=X+.2*k*P;s.py=sn.Y-8;s.alt=0;clip(x,'repos')}
    s.trig=kind==='gota'?X-24:s.px-(kind==='bolet'?.35:.62)*k*P;return s}
  function place(sn){gpos(sn.x.w.position,sn.X,sn.Y);const pp=sn.pop<0?0:sn.pop<1?eBack(sn.pop):1;sn.x.w.scale.setScalar(Math.max(.001,sn.k*pp));sn.x.w.rotation.set(0,sn.ry+(st&&st.festa&&sn.sp?spinA(sn.sp,st.festa.t):0),sn.wob>0?Math.sin(sn.wob*16)*.06*sn.wob:0)}
  function box(sn){const h=sn.h;return [sn.X-h*.62,sn.Y-h,sn.X+h*.75,sn.Y+8]}

  /* ───── sortida: les pedres compten (preparats, llestos, ja!) i la Mariona abaixa la bandera ───── */
  function count(){if(!st)return;st.ph='count';clip(PEB,'compte',.1,.75);later(2.2222-1.1667,()=>{if(st&&M.mode==='stand')clip(M.x,'sortida',.15)})}
  function stepCount(){if(evt(PEB,'u')){snd('pedra',.75,.9);tell('preparats',1.1)}
    if(evt(PEB,'dos')){snd('pedra',.75,1.0);tell('llestos',1.1)}
    if(evt(PEB,'ja')){snd('pedra',.8,1.26);snd('bandera',.6);tell('ja',1.4);go()}}
  function go(){st.t=0;idle=0;
    if(MODE===0){st.ph='race';for(const sn of st.sn){sn.ph='ready';sn.wait=0}
      later(.9,()=>{if(st&&st.ph==='race')marGo(MHOME[0],MHOME[1])});if(races===0)later(1.3,()=>{if(st&&st.ph==='race')tell('mira_cargol',3)})}
    else{st.ph='parade';const last=st.sn.reduce((a,s)=>s.X+.63*s.k*P>a?s.X+.63*s.k*P:a,-1e9),dx=FINX+40-last;st.pd=clamp(dx/110,2.5,5);
      for(const sn of st.sn){sn.px0=sn.X;sn.dx=dx;clip(sn.x,'lliscar',.2,1.15)}snd('llisca',.55)}}

  /* ───── la Mariona: camina a terra o vola (enlairar → volar → posar) ───── */
  function marGo(px,py,then){if(!M)return;M.tx=px;M.ty=py;M.then=then||null;if(Math.hypot(px-M.X,py-M.Y)<4&&M.mode==='stand'){if(then)then();return}
    if(M.mode==='stand'||M.mode==='down'){M.mode='up';M.t=0;clip(M.x,'enlairar',.15);alesOn()}}
  function stepMar(dA){const x=M.x;M.t+=dA;M.react=Math.max(0,M.react-dA);
    if(M.mode==='up'){M.alt=.55*eo(c01(M.t/.6));if(M.t>=.6){M.mode='fly';M.t=0;clip(x,'volar',.2)}}
    else if(M.mode==='fly'){const dx=M.tx-M.X,dy=M.ty-M.Y,d=Math.hypot(dx,dy),v=Math.min(d,dA*Math.min(430,90+d*2.2));
      if(d>2){M.X+=dx/d*v;M.Y+=dy/d*v}M.alt=.55+Math.sin(M.t*5)*.05;M.ry=lerp(M.ry,clamp(dx/300,-1,1)*.55,c01(dA*4));
      if(d<=2){M.mode='down';M.t=0;clip(x,'posar',.15)}}
    else if(M.mode==='down'){M.alt=.55*(1-eo(c01(M.t/.5)));M.ry=lerp(M.ry,0,c01(dA*5));if(M.t>=.5)alesOff();
      if(ends(x)){M.mode='stand';M.t=0;M.alt=0;const f=M.then;M.then=null;clip(x,'repos',.25);if(f)f()}}
    else{M.ry=lerp(M.ry,0,c01(dA*5));if(x.once&&ends(x)&&x.cn!=='posar')clip(x,'repos',.3)}
    gpos(x.w.position,M.X,M.Y);x.w.position.y+=M.alt;x.w.scale.setScalar(M.k);x.w.rotation.y=M.ry}

  /* ───── mirada ───── */
  function hit(x,y){if(!st)return null;let best=null,bd=1e9;
    for(const sn of st.sn){const b=box(sn);if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]){const d=Math.hypot(x-(b[0]+b[2])/2,y-(b[1]+b[3])/2);if(d<bd){bd=d;best=sn}}}
    if(best)return{k:'sn',sn:best};
    if(M&&M.mode==='stand'&&x>M.X-60&&x<M.X+60&&y>M.Y-MH-10&&y<M.Y+8)return{k:'mar'};
    return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.sn===b.sn);
  function actionable(g){if(!g||!st)return false;
    if(g.k==='mar')return M.mode==='stand'&&M.react<=0&&M.x.cn==='repos'&&!M.help;
    const sn=g.sn;
    if(MODE===0){if(st.ph!=='race')return false;return sn.ph==='ready'||(sn.ph==='rest'&&sn.react<=0)||(sn.ph==='done'&&sn.react<=0&&sn.gag<=0)}
    return st.ph==='line'&&sn.ph==='wait'&&sn.react<=0}
  function activate(g){if(!actionable(g))return;idle=0;helpSaid=false;
    if(g.k==='mar'){M.react=3;clip(M.x,'onejar',.2);snd('bandera',.45);later(2.6,()=>{if(M&&M.mode==='stand'&&M.x.cn==='onejar')clip(M.x,'repos',.3)});return}
    const sn=g.sn;if(M.help){M.help=null;marGo(MHOME[0],MHOME[1])}
    if(MODE===0){
      if(sn.ph==='ready'){sn.ph='slide';sn.t=0;sn.p0=sn.p;sn.tram++;sn.wait=0;STATS.n++;$('#oN').textContent=STATS.n;clip(sn.x,'lliscar',.2);snd('llisca',.55,rnd(.95,1.05));
        later(SLIDE*.5,()=>snd('nota',.7,NOTES[Math.min(7,sn.tram-1+sn.lane)]));return}
      if(sn.ph==='rest'){sn.react=1.4;sn.wob=1;snd('tanca',.35,1.15);return}
      if(sn.ph==='done'){sn.react=2.4;doGag(sn);return}}
    else{const next=st.sn.filter(s=>s.ph==='wait').sort((a,b)=>a.sc-b.sc)[0];
      if(sn===next){sn.ph='turn';sn.t=0;sn.slot=st.placed++;sn.fx0=sn.X;sn.fy0=sn.Y;sn.tx=slotX(sn.slot);sn.ty=ROWY;STATS.n++;$('#oN').textContent=STATS.n;
        const [ax,az]=[(sn.tx-sn.X)/P,(sn.ty-sn.Y)/(P*SP)];sn.ry1=Math.atan2(-az,ax);sn.ry0=sn.ry;clip(sn.x,'lliscar',.2);snd('llisca',.55);
        later(.9,()=>snd('nota',.7,NOTES[Math.min(7,sn.slot*2)]));const left=st.sn.filter(s=>s.ph==='wait').length;if(left)later(.5,()=>{if(st&&st.ph==='line')tell(left===1?'ultim':'iara',2.2)})}
      else{sn.react=1.7;clip(sn.x,'no',.15)}}}
  function slotX(i){const ord=st.sn.slice().sort((a,b)=>a.sc-b.sc);let x=150+ord[0].h*.62;for(let j=0;j<i;j++)x+=ord[j].h*.75+ord[j+1].h*.62+26;return x}
  function hint(){if(!st)return null;
    if(MODE===0&&st.ph==='race'){const r=st.sn.filter(s=>s.ph==='ready');if(!r.length)return null;r.sort((a,b)=>b.wait-a.wait);const sn=r[0],b=box(sn);return{x:(b[0]+b[2])/2,y:(b[1]+b[3])/2,sn}}
    if(MODE===1&&st.ph==='line'){const sn=st.sn.filter(s=>s.ph==='wait').sort((a,b)=>a.sc-b.sc)[0];if(!sn)return null;const b=box(sn);return{x:(b[0]+b[2])/2,y:(b[1]+b[3])/2,sn}}
    return null}

  /* ───── gags i medalles ───── */
  function doGag(sn){sn.gag=2.1;clip(sn.x,'gag_'+sn.nom,.15);clip(sn.comp,'gag',.05);later(.25,()=>snd(GAG[sn.nom],.6))}
  function giveMedal(sn,fly){const m=inst('medalla');sn.medal=m;m.w.visible=false;
    if(fly){if(M.mode==='stand')clip(M.x,'medalla',.15);m.fly={t:-.8,s:.45*sn.k}}
    else{m.fly={t:0,done:1};attachMedal(sn,m)}}
  function attachMedal(sn,m){const b=sn.x.o.getObjectByName('s_pit');m.w.visible=true;b.add(m.w);m.w.position.set(0,0,0);m.w.rotation.set(0,0,0);m.w.scale.setScalar(1);
    clip(m,'posar',.05);snd('medalla',.6);m.fly.done=1;
    const [px,py]=proj(m.w.getWorldPosition(V2));for(let i=0;i<9;i++)fxp.push({kind:'spark',x:px+rnd(-26,26),y:py+rnd(-26,26),vx:rnd(-50,50),vy:rnd(-80,-20),g:0,t:0,d:.9,r:rnd(5,9)})}
  function stepMedal(sn,dA){const m=sn.medal;if(!m)return;const f=m.fly;
    if(!f.done){f.t+=dA;if(f.t<0)return;const u=c01(f.t/.75),e=ez(u);if(!f.from){wpos(M.x,'s_ma_E',V1);f.from=V1.clone()}
      const pit=sn.x.o.getObjectByName('s_pit');pit.getWorldPosition(V2);m.w.visible=true;
      m.w.position.set(lerp(f.from.x,V2.x,e),lerp(f.from.y,V2.y,e)+Math.sin(u*Math.PI)*.8,lerp(f.from.z,V2.z,e));m.w.scale.setScalar(lerp(f.s,sn.k,e));
      if(u>=1)attachMedal(sn,m)}
    else if(m.cn==='posar'&&ends(m))clip(m,'gronxar',.2)}
  function arrive(sn){sn.ph='done';sn.t=0;clip(sn.x,'salt',.15);tell('arriba_'+sn.nom,2.4);clip(META,'arribada',.15);
    for(let i=0;i<12;i++)fxp.push({kind:'pet',x:sn.X+rnd(-30,60),y:sn.Y-sn.h*.8,vx:rnd(-110,110),vy:rnd(-220,-80),g:240,t:0,d:1.6,r:rnd(6,10),rot:rnd(0,6),vr:rnd(-4,4),c:PETC[i%5]});
    giveMedal(sn,true);later(2.2,()=>{if(st&&sn.ph==='done'&&!st.festa)doGag(sn)})}

  /* ───── festa: foto de grup ───── */
  function festa(){races++;const big=races%3===0;st.ph='festa';st.t=0;st.festa={t:0,big,shot:0};idle=0;
    for(const [i,sn] of st.sn.entries())later(i*.12,()=>{if(st&&st.festa){clip(sn.x,'foto',.25);sn.ry1=0;sn.ry0=sn.ry}});
    {const sp=spinPlan(st.sn.length,.45,.35);st.sn.forEach((sn,i)=>sn.sp=sp[i])}   /* girs de festa: cada cargol fa un gir sobre si mateix, desincronitzats i uns cap a cada costat */
    clip(META,'festa',.2);const cel=()=>{if(M&&st&&st.festa)clip(M.x,'celebrar',.2)};if(M.mode==='stand'&&Math.hypot(M.X-MHOME[0],M.Y-MHOME[1])<4)cel();else marGo(MHOME[0],MHOME[1],cel);
    snd('festa',.6);if(big)later(.4,()=>snd('visca',.5));if(MODE===0)tell('tots',2.8,['foto']);else tell('foto',2.6)}
  function stepFesta(dA){const f=st.festa;f.t+=dA;const k=f.big?2.2:1;
    if(Math.random()<dA*14*k)fxp.push({kind:'pet',x:rnd(0,W),y:-20,vx:rnd(-25,25),vy:rnd(70,130),g:0,t:0,d:5,r:rnd(7,12),rot:rnd(0,6),vr:rnd(-3,3),c:PETC[Math.floor(Math.random()*6)]});
    for(const sn of st.sn)sn.ry=lerp(sn.ry,0,c01(dA*4));
    if(!f.shot&&f.t>3.9){f.shot=1;snd('foto',.6);if(f.big)later(.9,()=>tell('festa',2.2))}
    if(f.t>(f.big?8.5:7)){st.festa=null;for(const sn of st.sn)sn.out=0;st.ph='out';st.t=0}}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;st.t+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    for(const x of INST){x.mx.update(dA);x.ct+=dA}
    ROOT.updateMatrixWorld(true);
    /* mirada: hover (0,15 s), temps de selecció o clic */
    const g=has?hit(wx,wy):null;
    if(!same(g,cur)){cur=g;dw=0}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur={k:'lock'};activate(g)}}else dw=0;
    stepMar(dA);
    if(META.once&&ends(META))clip(META,st.festa?'festa':'repos',.3);
    if(st.ph==='count')stepCount();
    if(MODE===0)step1(dA);else step2(dA);
    for(const sn of st.sn){sn.t+=dA;sn.react=Math.max(0,sn.react-dA);sn.gag=Math.max(0,sn.gag-dA);sn.wob=Math.max(0,sn.wob-dA*1.6);if(sn.pop<1)sn.pop+=dA*2.2;
      if(sn.gag<=0&&sn.ph==='done'&&!st.festa&&sn.x.cn!=='orgullos'&&ends(sn.x))clip(sn.x,'orgullos',.25);
      stepMedal(sn,dA);place(sn)}
    for(const s of st.sur)stepSur(s,dA);
    if(st.festa)stepFesta(dA);
    if(st.ph==='out'){let all=true;for(const sn of st.sn){sn.pop=Math.max(0,1-st.t*2.4);all=all&&sn.pop<=0}for(const s of st.sur)s.out=1;if(st.t>.5)newRace()}
    for(const p of fxp){p.t+=dA;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA;if(p.rot!=null)p.rot+=p.vr*dA}fxp=fxp.filter(p=>p.t<p.d);
    for(const p of st.trail)p.t+=dA;if(st.trail.length&&st.trail[0].t>5)st.trail=st.trail.filter(p=>p.t<5);
    const H0=hint(),busy=!H0||st.sn.some(s=>s.ph==='slide'||s.ph==='turn'||s.ph==='go'||s.ph==='back');
    if(busy){idle=0;if(M.help&&!H0){M.help=null;marGo(MHOME[0],MHOME[1])}}else idle+=dA;
    /* ajuda: als 6 s el cargol que toca crida l'atenció; als 12 s la Mariona hi vola i l'assenyala */
    for(const sn of st.sn){const want=H0&&H0.sn===sn&&idle>HELP&&(sn.ph==='ready'||sn.ph==='wait');
      if(want&&sn.x.cn==='repos')clip(sn.x,'crida',.25);else if(!want&&sn.x.cn==='crida')clip(sn.x,'repos',.3)}
    if(idle>HELP*2&&!helpSaid&&H0){helpSaid=true;const sn=H0.sn;M.help=sn;say(['mira']);
      marGo(clamp(sn.X+sn.h*.75+40,80,1220),sn.Y-4,()=>{if(M&&M.help===sn)clip(M.x,'assenyalar',.2)})}}
  function step1(dA){const s=S1[CFG.size];if(st.ph!=='race')return;
    for(const sn of st.sn){
      if(sn.ph==='ready'){sn.wait+=dA}
      else if(sn.ph==='slide'){const u=c01(sn.t/SLIDE);sn.p=lerp(sn.p0,sn.tram/s.tr,ez(u));const ox=sn.X;sn.X=lerp(XS,XE,sn.p);
        if(Math.floor(sn.X/9)!==Math.floor(ox/9))st.trail.push({x:sn.X-sn.h*.42,y:sn.Y-2,r:sn.h*.07,t:0});
        if(u>=1){sn.t=0;if(sn.tram>=s.tr)arrive(sn);else{sn.ph='tired';clip(sn.x,'cansat',.2)}}}
      else if(sn.ph==='tired'){if(evt(sn.x,'badall'))snd('badall',.5,rnd(.95,1.1));if(ends(sn.x)){sn.ph='hide';sn.t=0;clip(sn.x,'amagar',.12)}}
      else if(sn.ph==='hide'){if(evt(sn.x,'dins'))snd('tanca',.55);if(ends(sn.x)){sn.ph='rest';sn.t=0;clip(sn.x,'amagat',.12)}}
      else if(sn.ph==='rest'){if(sn.t>HIDE){sn.ph='out';sn.t=0;clip(sn.x,'sortir',.12)}}
      else if(sn.ph==='out'){if(evt(sn.x,'fora'))snd('treu',.5);if(ends(sn.x)){sn.ph='ready';sn.t=0;sn.wait=0;clip(sn.x,'repos',.25)}}
      else if(sn.ph==='done'){if(sn.x.cn==='salt'&&evt(sn.x,'salt'))snd('salt',.6)}}
    if(st.sn.length&&st.sn.every(sn=>sn.ph==='done'&&sn.t>4.6))festa()}
  function step2(dA){
    for(const sn of st.sn){
      if(sn.ph==='turn'){const u=c01(sn.t/.35);sn.ry=lerp(sn.ry0,sn.ry1,ez(u));if(u>=1){sn.ph='go';sn.t=0}}
      else if(sn.ph==='go'){const u=c01(sn.t/1.8),e=ez(u),ox=sn.X;sn.X=lerp(sn.fx0,sn.tx,e);sn.Y=lerp(sn.fy0,sn.ty,e);
        if(Math.hypot(sn.X-ox,0)>0&&Math.random()<dA*14)st.trail.push({x:sn.X-Math.cos(sn.ry)*sn.h*.42,y:sn.Y-2,r:sn.h*.07,t:0});
        if(u>=1){sn.ph='back';sn.t=0;sn.ry0=sn.ry;clip(sn.x,'repos',.25)}}
      else if(sn.ph==='back'){const u=c01(sn.t/.35);sn.ry=lerp(sn.ry0,0,ez(u));if(u>=1){sn.ph='row';sn.t=0;clip(sn.x,'salt',.15)}}
      else if(sn.ph==='row'){if(sn.x.cn==='salt'&&evt(sn.x,'salt'))snd('salt',.55);if(sn.x.cn==='salt'&&ends(sn.x))clip(sn.x,'repos',.25)}
      else if(sn.ph==='wait'){if(sn.x.cn==='no'&&ends(sn.x))clip(sn.x,'repos',.25)}}
    if(st.ph==='line'&&st.sn.length&&st.sn.every(sn=>sn.ph==='row'&&sn.t>1.2)){st.ph='lined';st.t=0;tell('molt_be',2.6);later(2.8,count)}
    if(st.ph==='parade'){const u=c01(st.t/st.pd);
      for(const sn of st.sn){sn.X=sn.px0+sn.dx*ez(u);if(Math.random()<dA*9)st.trail.push({x:sn.X-sn.h*.42,y:sn.Y-2,r:sn.h*.07,t:0})}
      if(u>=1){st.ph='medals';st.t=0;clip(META,'arribada',.15);for(const sn of st.sn){clip(sn.x,'salt',.15)}
        st.sn.slice().sort((a,b)=>a.sc-b.sc).forEach((sn,i)=>{later(.5+i*.25,()=>{if(st&&st.ph==='medals')giveMedal(sn,false)});later(1.6+i*.8,()=>{if(st&&st.ph==='medals')doGag(sn)})});
        later(1.6+st.sn.length*.8+1.6,()=>{if(st&&st.ph==='medals')festa()})}}
    if(st.ph==='medals')for(const sn of st.sn){if(sn.x.cn==='salt'&&evt(sn.x,'salt'))snd('salt',.5);if(sn.gag<=0&&sn.x.once&&ends(sn.x))clip(sn.x,'orgullos',.25)}}

  /* ───── sorpreses del camí ───── */
  function stepSur(s,dA){const x=s.x,sn=s.sn;s.t+=dA;if(s.pop<1)s.pop+=dA*2.2;let pp=s.pop<0?0:s.pop<1?eBack(s.pop):1;
    if(s.out){s.ot=(s.ot||0)+dA;pp*=Math.max(0,1-s.ot*2.4)}
    if(s.kind==='gota'){
      if(!s.st){gpos(x.w.position,s.px,s.py);x.w.position.y=s.alt+Math.sin(now*2+s.px)*.03*sn.k;x.w.scale.setScalar(Math.max(.001,s.sc*pp));
        if(sn.ph==='slide'&&sn.X>=s.trig){s.st=1;s.t=0;clip(x,'caure',.05);x.w.getWorldPosition(V3);s.from=V3.clone()}}
      else if(s.st===1){const u=c01(s.t/.25);gpos(V2,sn.X-.1*sn.k*P,sn.Y);V2.y=.7*sn.k;x.w.position.set(lerp(s.from.x,V2.x,u),lerp(s.from.y,V2.y,u*u),lerp(s.from.z,V2.z,u));
        if(u>=1){s.st=2;s.t=0;sn.x.w.attach(x.w);snd('gota',.6);const [px,py]=proj(x.w.getWorldPosition(V2));
          for(let i=0;i<10;i++)fxp.push({kind:'drop',x:px+rnd(-8,8),y:py-4,vx:rnd(-140,140),vy:rnd(-200,-60),g:900,t:0,d:.7,r:rnd(3,6)})}}
      else if(s.st===2){if(s.t>.9){const k=Math.max(0,1-(s.t-.9)/.35);x.w.scale.setScalar(Math.max(.001,s.sc/sn.k*k));if(k<=0){s.st=3;x.w.visible=false}}}
      return}
    gpos(x.w.position,s.px,s.py);x.w.scale.setScalar(Math.max(.001,s.sc*pp));
    if(!s.st&&sn.ph==='slide'&&sn.X+.55*sn.k*P>=s.trig){s.st=1;s.t=0;clip(x,s.kind==='bolet'?'obrir':'brotar',.05)}
    if(s.st===1){if(evt(x,s.kind==='bolet'?'pop':'brot'))snd(s.kind,.6);if(ends(x)){s.st=2;clip(x,s.kind==='bolet'?'obert':'florit',.2)}}}

  /* ───── dibuix ───── */
  function glow(c,x,y,rx,ry,k=1){const p=.5+.5*Math.sin(now*2.6);c.fillStyle=`rgba(255,246,190,${(.2+.22*p)*k})`;c.beginPath();c.ellipse(x,y,rx+6*p,ry+4*p,0,0,7);c.fill()}
  function stitch(c,x0,y0,x1,y1,col='rgba(250,240,215,.85)'){c.save();c.strokeStyle=col;c.lineWidth=4;c.lineCap='round';c.setLineDash([14,12]);c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore()}
  function checker(c,x,y0,y1){for(let y=y0;y<y1;y+=18)for(let i=0;i<2;i++){c.fillStyle=((Math.floor(y/18))+i)%2?'#2e2a26':'#f4ead4';c.fillRect(x+i*14,y,14,Math.min(18,y1-y))}
    c.strokeStyle='rgba(60,40,20,.35)';c.lineWidth=2;c.strokeRect(x,y0,28,y1-y0)}
  function drawTrack(c){if(MODE===0){const s=S1[CFG.size],L=s.lanes,top=L[0]-s.h-8;
      for(let i=0;i<L.length-1;i++){const y=(L[i]+L[i+1])/2+8;stitch(c,40,y,1240,y)}
      stitch(c,XS+s.h*.82,top+10,XS+s.h*.82,676,'rgba(250,250,250,.9)');checker(c,FINX-14,top+8,676)}
    else{checker(c,FINX-14,300,ROWY+64);stitch(c,60,ROWY+10,1100,ROWY+10,'rgba(250,240,215,.75)')}}
  function shadowE(c,x,y,rx,ry,a=.2){c.fillStyle=`rgba(50,45,25,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&IM.fons&&IM.fons.complete)c.drawImage(IM.fons,0,0,W,H);
    if(!R||!ready||!st)return;
    drawTrack(c);
    /* rastre brillant */
    for(const p of st.trail){const a=Math.max(0,1-p.t/5);c.fillStyle=`rgba(255,255,245,${.42*a})`;c.beginPath();c.ellipse(p.x,p.y,p.r*2.3,p.r*.5,0,0,7);c.fill()}
    /* ombres */
    for(const sn of st.sn){const pp=sn.pop<0?0:Math.min(1,sn.pop);if(pp<=0)continue;shadowE(c,sn.X+sn.h*.05,sn.Y+2,sn.h*.62*pp,sn.h*.08*pp)}
    for(const s of st.sur){if(s.out)continue;if(s.kind!=='gota')shadowE(c,s.px,s.py+2,s.sc*P*.2,s.sc*P*.035,.16);
      /* la gota que espera fa una taca d'aigua al seu carril: així es veu on caurà */
      else if(!s.st){const r=s.sc*P*.16*(.9+.1*Math.sin(now*2+s.px));c.fillStyle='rgba(110,170,215,.28)';c.beginPath();c.ellipse(s.px,s.py+1,r,r*.26,0,0,7);c.fill()}}
    {const a=Math.max(0,.22-M.alt*.18);shadowE(c,M.X,M.Y+2,52*(1-M.alt*.5),9,a)}
    shadowE(c,METAP[0]-124,METAP[1]+3,22,6,.18);shadowE(c,METAP[0]+124,METAP[1]+3,22,6,.18);
    /* brillantors (darrere els models): banyes dels cargols a punt, el que toca, la mirada */
    const H0=idle>HELP?hint():null;
    for(const sn of st.sn){const hl=H0&&H0.sn===sn;
      if(MODE===0&&st.ph==='race'&&sn.ph==='ready'){wpos(sn.x,'banya_E2',V1);wpos(sn.x,'banya_D2',V2);const [ax,ay]=proj(V1),[bx,by]=proj(V2);glow(c,(ax+bx)/2,(ay+by)/2,sn.h*.2,sn.h*.16,hl?1.5:.7)}
      if(hl&&MODE===1){const b=box(sn);glow(c,(b[0]+b[2])/2,(b[1]+b[3])/2+sn.h*.05,(b[2]-b[0])*.55,(b[3]-b[1])*.52,1.2)}
      if(cur&&cur.sn===sn&&actionable(cur)){const b=box(sn);glow(c,(b[0]+b[2])/2,(b[1]+b[3])/2,(b[2]-b[0])*.52,(b[3]-b[1])*.5,.55)}}
    R.render(S3,cam);
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    for(const p of fxp)drawP(f,p);f.globalAlpha=1;
    drawCap(f)}
  function star4(c,x,y,s,col){c.fillStyle=col;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s*.3,y);c.lineTo(x,y+s);c.lineTo(x-s*.3,y);c.closePath();c.fill();c.beginPath();c.moveTo(x-s*.7,y);c.lineTo(x,y+s*.22);c.lineTo(x+s*.7,y);c.lineTo(x,y-s*.22);c.closePath();c.fill()}
  function drawP(f,p){const a=Math.max(0,1-p.t/p.d);
    if(p.kind==='pet'){f.globalAlpha=Math.min(1,a*2);f.save();f.translate(p.x,p.y);f.rotate(p.rot);f.fillStyle=p.c;f.beginPath();f.ellipse(0,0,p.r,p.r*.5,0,0,7);f.fill();f.restore();return}
    if(p.kind==='spark'){f.globalAlpha=a;star4(f,p.x,p.y,p.r*(1-p.t/p.d)*1.6+2,'rgba(255,250,215,1)');return}
    if(p.kind==='drop'){f.globalAlpha=a*.9;f.fillStyle='#9fd3f2';f.beginPath();f.arc(p.x,p.y,p.r,0,7);f.fill();return}}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('cargols.'+c.k);f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=W/2,y=MODE===1?140:130,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,253,244,.94)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,54,27);f.fill();f.fillStyle='#3d4f2e';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+3);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function layout(){if(!ready)return;newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newGame()}
  function tray(){const t=$('#tray');t.innerHTML='';['cargols.m1','cargols.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();alesOff();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  function mus(){return 'm_cargols'}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:()=>null,hit,hint,activate,actionable,scr,box,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},get M(){return M},get races(){return races},PROTO,IX,INST}
})();
