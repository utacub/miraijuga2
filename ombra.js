/* =========================================================
   ESCENARI: ENDEVINA L'OMBRA
   Teatre d'ombres a la platja. La Pepa, la pop titellaire (3D, model de Blender fet per ChatGPT, 18-11-2026), agafa
   els objectes de paper maixé de la taula (3D) i els passa per darrere la pantalla: a la pantalla en surt l'ombra
   (silueta frontal del mateix model) i, amb un «Abracadabra!», l'ombra es transforma en una criatura de paper retallat
   articulada (peces 2D amb pivots, rigs a ombra/models.json) que fa el seu número.
   «Ombres màgiques»: a la taula hi ha 3/5/8 objectes; mirar-ne un fa la màgia. Vistos tots, la Pepa s'acomiada.
   «Endevina l'ombra»: a la pantalla hi ha una ombra i a la taula 2/3/4 objectes; el bo encaixa i es transforma;
     l'equivocat mostra les dues ombres de costat 2 s («Aquesta no»), sense so d'error. Cada 4 encerts, comiat.
   Ajuda: 6 s brilla el bo; 12 s la Pepa assenyala la taula i diu «Mira aquí!». Tecla P: canvia de mode.
   ========================================================= */
const OMBRA=(()=>{
  const TX=__OMTX__;
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['ombra.'+k]=TX[l][k];
  const IX=__OMIX__;
  const OBJ=['tetera','tisores','platan','broquil','guant','paraigua','raspall','pinya'];
  const CRE={tetera:'elefant',tisores:'cocodril',platan:'lluna',broquil:'arbre',guant:'gallina',paraigua:'medusa',raspall:'erico',pinya:'palmera'};
  /* formes que s'assemblen: no surten juntes a les mides gran i mitjana d'«Endevina l'ombra» */
  const SIM={platan:['raspall'],raspall:['platan'],broquil:['pinya','paraigua'],pinya:['broquil'],paraigua:['broquil'],tetera:[],tisores:[],guant:[]};
  const SZ=[{n1:3,n2:2,w:230},{n1:5,n2:3,w:190},{n1:8,n2:4,w:145}];
  const P=165,PIT=5*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6;
  const SCR={x:620,y:284,w:540,h:380},SH=300,SW=440,TY=632,TH=170,PEPA={x:1065,y:540,h:290},CAPY=500;
  const SHC='92,38,70',CONF=['#f3c84a','#e8736b','#4fb3a9','#f6e7c8','#b48fd6'];
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,loading=0;
  const PROTO={},CL={},TXS={},IM={},BB={},RB={};
  let st=null,now=0,cur=null,dw=0,idle=0,wait=[],fxp=[],helpSaid=false,PE=null,GRAB=null;
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const lerp=(a,b,t)=>a+(b-a)*t,c01=t=>clamp(t,0,1),ez=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3(),Q1=new THREE.Quaternion(),Q0=new THREE.Quaternion();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3o';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3of';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.5);sun=new THREE.DirectionalLight(0xfff2e0,1.3);sun.position.set(-3,6,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    IM.fons=img('ombra/fons.webp');for(const k in IX.shadow)IM['s_'+k]=img('ombra/s/'+k+'.webp');for(const k in IX.pieces)IM[k]=img('ombra/cr/'+k+'.webp');
    for(const c in IX.rigs)RB[c]=rigBounds(c);
    load();resize()}
  function load(){const L=new GLTFLoader(),keys=Object.keys(IX.models);let n=keys.length*2;loading=1;
    const done=()=>{if(--n>0)return;loading=0;ready=true;quality();if(on)newGame()};
    for(const k of keys)tx(k,()=>done());
    for(const k of keys)L.load(U('ombra/m/'+k+'.glb'),g=>{const o=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name.replace('pepa_','')]=c;
        o.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(o),s=new THREE.Vector3(),c=new THREE.Vector3();b.getSize(s);b.getCenter(c);BB[k]={min:b.min.clone(),max:b.max.clone(),s,c};
        o.traverse(m=>{if(m.isMesh){m.frustumCulled=false;m.userData.glass=/vidre/i.test(m.material&&m.material.name||'')}});PROTO[k]=o;done()},undefined,e=>{console.error(e);done()})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: un per model (els objectes s'esvaeixen quan passen darrere la pantalla); vernís 0,35; vidre de la llanterna emissiu ───── */
  function tx(n,cb){if(TXS[n])return TXS[n];const t=new THREE.TextureLoader().load(U('ombra/t/'+n+'.webp'),cb,undefined,cb);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;return TXS[n]=t}
  function mkMat(k,glass){const c=tx(k);let m;
    if(LOWQ)m=new THREE.MeshPhongMaterial({map:c,shininess:40,specular:0x2a2a2a});
    else m=new THREE.MeshStandardMaterial({map:c,roughness:.35,metalness:0,envMap:ENV,envMapIntensity:.85});
    if(glass){m.emissive=new THREE.Color(0xffc870);m.emissiveMap=c;m.emissiveIntensity=1.5}
        return m}
  function quality(){if(!R)return;lq=LOWQ;
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const k in PROTO){const mats={};PROTO[k].traverse(m=>{if(!m.isMesh)return;const g=m.userData.glass?1:0;if(m.material)m.material.dispose();m.material=mats[g]||(mats[g]=mkMat(k,g));m.userData.mats=mats})}
    amb.intensity=LOWQ?1.0:.55;sun.intensity=LOWQ?1.6:1.25;resize()}
  /* opacitat només mentre s'esvaeix (amb transparència es veurien les cares interiors); els objectes ja vistos s'enfosqueixen una mica */
  function opacity(k,a,dim){PROTO[k].traverse(m=>{if(!m.isMesh||!m.material)return;const t=a<.995,mt=m.material;if(mt.transparent!==t){mt.transparent=t;mt.needsUpdate=true}mt.opacity=a;mt.depthWrite=!t||a>.6;
    if(dim!=null&&!m.userData.glass)mt.color.setScalar(dim?.7:1)})}

  /* ───── pantalla (px, 1280×720) ↔ món (z=0) ───── */
  const gpos=(v,px,py,z=0)=>v.set((px-640)/P,(360-py)/(P*CP)+z*SP/CP,z);
  const proj=v=>[640+v.x*P,360-P*(v.y*CP-v.z*SP)];
  function later(t,f){wait.push({t:now+t,f})}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=2.6){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs v4: ombra/v/<idioma>_<clau>.mp3) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('ombra/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),120)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=2.6){cap(k,d);say([k])}
  const snd=(n,g=.6,r=1)=>play('om_'+n,g,r);

  /* ───── la Pepa: clips del lliurament (idle, wave, point, grab, present, no, clap, bow, laugh) ───── */
  function clip(n,fade=.2){const x=PE,c=CL.pepa[n],info=IX.models.pepa.clips[n];if(!c||!info)return;let a=x.A[n];if(!a)a=x.A[n]=x.mx.clipAction(c);
    const loop=!!info[1],prev=x.cur;a.enabled=true;a.reset();a.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,Infinity);a.clampWhenFinished=!loop;a.setEffectiveTimeScale(1);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a){if(fade>0)prev.crossFadeTo(a,fade,false);else prev.stop()}
    x.cur=a;x.cn=n;x.ct=0;x.dur=c.duration;x.once=!loop;x.fired={}}
  function evt(name){const x=PE;if(!x.cn)return false;const e=IX.models.pepa.clips[x.cn][2][name];if(e==null||x.fired[name])return false;if(x.ct>=e){x.fired[name]=1;return true}return false}
  const ends=(m=.06)=>PE.once&&PE.ct>=PE.dur-m;
  const fitH=(k,h)=>h/(BB[k].s.y*P*CP);

  /* ───── objectes de la taula ───── */
  function setTable(names){const S=SZ[CFG.size],n=names.length,gap=n>6?10:24,tot=n*S.w+(n-1)*gap,x0=(W-tot)/2+S.w/2;
    for(const k of OBJ){const o=PROTO['o_'+k];if(o){o.removeFromParent();o.visible=false}}
    st.objs=names.map((nm,i)=>{const k='o_'+nm,b=BB[k],o={n:nm,k,x:x0+i*(S.w+gap),y:TY,w:S.w,h:TH,react:0,away:false,pop:-i*.07};
      o.s=Math.min(o.w*.8/(b.s.x*P),o.h*.74/(b.s.y*P*CP));const m=PROTO[k];ROOT.add(m);m.visible=true;m.quaternion.identity();placeObj(o);opacity(k,1,false);return o})}
  function placeObj(o){const m=PROTO[o.k],b=BB[o.k],pp=o.pop<0?0:o.pop<1?eBack(o.pop):1,s=Math.max(.001,o.s*pp),dx=o.react>0?Math.sin(o.react*16)*10:0,bob=cur&&cur.o===o&&actionable(cur)?Math.sin(now*5)*3:0;
    gpos(m.position,o.x+dx,o.y+o.h*.4-bob,.4);m.position.x-=b.c.x*s;m.position.y-=b.min.y*s;m.scale.setScalar(s);m.rotation.set(0,0,o.react>0?Math.sin(o.react*16)*.05:0)}

  /* ───── criatures d'ombra: peces 2D articulades (rigs, pivots en px de la peça, z per ordre de dibuix) ───── */
  const AN={wag:u=>.25*Math.sin(u*5),wag2:u=>.35*Math.sin(u*5+1),step:u=>.16*Math.sin(u*6),step2:u=>.16*Math.sin(u*6+3.14),trunk:u=>.2*Math.sin(u*3)-.04,
    flap:u=>.16*Math.sin(u*4),jawup:u=>.22*Math.abs(Math.sin(u*4.5)),jawlow:u=>-.14*Math.abs(Math.sin(u*4.5)),twinkle:u=>.35*Math.sin(u*2),twinkle2:u=>-.35*Math.sin(u*2.4),
    bob:u=>.06*Math.sin(u*3),wave:u=>.45*Math.sin(u*6),hop:u=>.12*Math.sin(u*8),hop2:u=>.12*Math.sin(u*8+1),flapw:u=>.45*Math.sin(u*14),flapw2:u=>.45*Math.sin(u*14+1),
    fan:u=>.1*Math.sin(u*3),tent:u=>.22*Math.sin(u*3),tent2:u=>.22*Math.sin(u*3+1.5),sway:u=>.08*Math.sin(u*2),swing:u=>.15*Math.sin(u*2.5),none:()=>0};
  const mul=(a,b)=>[a[0]*b[0]+a[1]*b[3],a[0]*b[1]+a[1]*b[4],a[0]*b[2]+a[1]*b[5]+a[2],a[3]*b[0]+a[4]*b[3],a[3]*b[1]+a[4]*b[4],a[3]*b[2]+a[4]*b[5]+a[5]];
  const app=(m,x,y)=>[m[0]*x+m[1]*y+m[2],m[3]*x+m[4]*y+m[5]];
  /* matrius de cada peça (coordenades de la peça arrel); u<0 = repòs; ov[nom] = {r, dx, dy} extra */
  function rigMats(c,u,ov){const rg=IX.rigs[c],M={root:[1,0,0,0,1,0]},pend=rg.parts.slice();let guard=20;
    while(pend.length&&guard--)for(let i=pend.length-1;i>=0;i--){const p=pend[i];if(!M[p.par])continue;const o=ov&&ov[p.n]||{};
      const r=(p.r||0)+(u>=0?AN[p.an||'none'](u):0)+(o.r||0),s=p.s,cs=Math.cos(r)*s,sn=Math.sin(r)*s;
      M[p.n]=mul(M[p.par],mul([cs,-sn,p.a[0]+(o.dx||0),sn,cs,p.a[1]+(o.dy||0)],[1,0,-p.pv[0],0,1,-p.pv[1]]));pend.splice(i,1)}
    return M}
  function rigBounds(c){const rg=IX.rigs[c],M=rigMats(c,-1);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    const add=(m,k)=>{const [w,h]=IX.pieces[k];for(const [x,y] of [[0,0],[w,0],[0,h],[w,h]]){const q=app(m,x,y);x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}};
    add(M.root,c+'_'+rg.root);for(const p of rg.parts)add(M[p.n],c+'_'+p.p);return{x0,y0,x1,y1,w:x1-x0,h:y1-y0}}
  /* escala i origen perquè la criatura càpiga a la pantalla (SH × SW) centrada a (cx,cy) */
  function crFit(c,cx,cy,k=1){const b=RB[c],s=Math.min(SH/b.h,SW/b.w)*.94*k;return{s,ox:cx-(b.x0+b.w/2)*s,oy:cy-(b.y0+b.h/2)*s}}
  function drawRig(g,c,u,o){const rg=IX.rigs[c],M=rigMats(c,u,o.ov),f=crFit(c,SCR.x+(o.dx||0),SCR.y+(o.dy||0),o.k||1),items=[[0,'root',c+'_'+rg.root]];
    for(const p of rg.parts)if(!(o.hide&&o.hide[p.n]))items.push([p.z,p.n,c+'_'+p.p]);items.sort((a,b)=>a[0]-b[0]);
    g.save();g.globalAlpha=o.a;g.translate(f.ox,f.oy);g.scale(f.s,f.s);
    const b=RB[c],cx=b.x0+b.w/2,cy=b.y0+b.h/2;g.translate(cx,cy);g.rotate(o.r||0);g.scale(o.sx||1,o.sy||1);g.translate(-cx,-cy);
    for(const [,n,k] of items){const m=M[n],im=IM[k];if(!im||!im.complete)continue;g.save();g.transform(m[0],m[3],m[1],m[4],m[2],m[5]);g.drawImage(im,0,0);g.restore()}
    g.restore();
    return (n,x,y)=>{const m=M[n];let q=app(m,x,y);q=[q[0]-cx,q[1]-cy];const cs=Math.cos(o.r||0),sn=Math.sin(o.r||0);q=[(q[0]*cs-q[1]*sn)*(o.sx||1),(q[0]*sn+q[1]*cs)*(o.sy||1)];return[f.ox+(q[0]+cx)*f.s,f.oy+(q[1]+cy)*f.s]}}
  /* moviment de tot el cos i detalls de cada número (u: segons des que ha cobrat vida) */
  function crAnim(n,u){const o={dx:0,dy:0,r:0,sx:1,sy:1,ov:{},hide:{}};if(u<0)return o;
    if(n==='elefant'){o.dy=-Math.abs(Math.sin(u*Math.PI*1.5))*10;o.r=Math.sin(u*3)*.03}
    if(n==='cocodril'){o.dx=Math.sin(u*1.6)*50;o.dy=Math.sin(u*5)*4}
    if(n==='lluna'){o.r=Math.sin(u*2)*.1}
    if(n==='arbre'){o.r=Math.sin(u*2.4)*.025;o.ov.ocell1={dy:-Math.abs(Math.sin(u*5))*12};o.ov.ocell2={dy:-Math.abs(Math.sin(u*5+1.2))*12}}
    if(n==='gallina'){o.dy=-Math.abs(Math.sin(u*Math.PI*1.8))*16*(u<2?1:0)}
    if(n==='medusa'){o.dy=Math.sin(u*2.2)*24;o.sy=1+.06*Math.sin(u*4.4);o.sx=1-.04*Math.sin(u*4.4)}
    if(n==='erico'){o.dy=0}
    if(n==='palmera'){o.r=Math.sin(u*2)*.04;if(u>2.1){const f=Math.min(1,(u-2.1)/.7);o.ov.coco={dy:f*f*170};if(f>=1)o.hide.coco=1}}
    return o}

  /* ───── partida ───── */
  function newGame(){if(!ready)return;vStop();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;
    if(!PE){const o=PROTO.pepa;ROOT.add(o);PE={o,mx:new THREE.AnimationMixer(o),A:{},cur:null,cn:'',ct:0,dur:0,once:false,fired:{}};o.traverse(n=>{if(n.name==='s_grab')GRAB=n})}
    PE.k=fitH('pepa',PEPA.h);
    st={ph:'intro',t:0,cap:null,count:0,seen:new Set(),last:null,shadow:null,cur:null,objs:[],wrong:null,first:true,crU:-1};
    if(MODE===0)setTable(shuffle(OBJ.slice()).slice(0,SZ[CFG.size].n1));else setTable([]);
    clip('wave',0);later(.3,()=>tell(MODE===0?'hola':'endevina',2.2))}
  function newRound(){const S=SZ[CFG.size],big=CFG.size<2;let pool=OBJ.filter(n=>n!==st.last);const tgt=pool[Math.floor(Math.random()*pool.length)];st.last=tgt;
    const others=shuffle(OBJ.filter(n=>n!==tgt&&(!big||!SIM[tgt].includes(n)))),picked=[];
    for(const o of others){if(picked.length>=S.n2-1)break;if(!big||!picked.some(p=>SIM[p].includes(o)))picked.push(o)}
    setTable(shuffle([tgt,...picked]));st.target=tgt;st.shadow={k:tgt,a:0};st.ph='show';st.t=0;idle=0;helpSaid=false;tell('dequi',2.6)}
  function toAsk(){st.ph='ask';st.t=0;idle=0;helpSaid=false;if(PE.cn!=='idle')clip('idle',.3)}

  /* ───── la màgia: la Pepa agafa l'objecte, l'ensenya i el passa darrere la pantalla ───── */
  function startFly(o){const m=PROTO[o.k];st.cur={o,ok:MODE===0||o.n===st.target,t:0,p0:m.position.clone(),s0:m.scale.x};o.away=true;st.ph='fly';st.t=0;clip('grab',.15);snd('agafa',.5)}
  function stepFly(){const c=st.cur,m=PROTO[c.o.k],u=ez(c01(st.t/.55));
    GRAB.getWorldPosition(V1);V1.y-=BB[c.o.k].s.y*PE.k*.05;m.position.lerpVectors(c.p0,V1,u);m.position.y+=Math.sin(u*Math.PI)*.35;m.scale.setScalar(lerp(c.s0,PE.k,u));
    GRAB.getWorldQuaternion(Q1);m.quaternion.copy(Q0).slerp(Q1,u);
    if(evt('grab')||st.t>.7){GRAB.add(m);const g=IX.models[c.o.k].grab||[0,0,0];m.position.set(g[0],g[1],g[2]);m.quaternion.identity();
      const ws=new THREE.Vector3();GRAB.getWorldScale(ws);m.scale.setScalar(PE.k/ws.x);clip('present',.12);st.ph='present';st.t=0}}
  function startToScreen(){const c=st.cur,m=PROTO[c.o.k];ROOT.attach(m);c.p0=m.position.clone();c.q0=m.quaternion.clone();c.s0=m.scale.x;st.ph='up';st.t=0;snd('puja',.5);clip('idle',.35)}
  function stepUp(){const c=st.cur,m=PROTO[c.o.k],u=ez(c01(st.t/.9));gpos(V1,SCR.x,SCR.y-SCR.h*.5,-.6);m.position.lerpVectors(c.p0,V1,u);m.position.y+=Math.sin(u*Math.PI)*.3;
    m.quaternion.copy(c.q0).slerp(Q0,u);m.scale.setScalar(lerp(c.s0,c.s0*.6,u));opacity(c.o.k,1-c01((u-.55)/.4));
    if(st.t>=.9){m.visible=false;if(MODE===0){st.shadow={k:c.o.n,a:1,grow:0};st.ph='grow';st.t=0;snd('creix',.5)}
      else if(c.ok){st.ph='match';st.t=0;snd('creix',.45)}}}
  function startMagic(){const c=st.cur;st.ph='magic';st.t=0;st.played=0;snd('xup',.6);clip('laugh',.2);
    const n=CRE[c.o.n];cap(MODE===0?'abra':'si',1.2);say([MODE===0?'abra':'si','c_'+n])}
  function stepMagic(dA){const c=st.cur,n=CRE[c.o.n];
    if(st.t>.7&&!st.played){st.played=1;snd(n,.7);cap('c_'+n,2.6);clip('clap',.25);STATS.n++;$('#oN').textContent=STATS.n}
    if(n==='gallina'&&st.t>2.8&&st.played===1){st.played=2;snd('xup',.35,1.3)}
    actFx(dA,n,st.t-.6);
    if(st.t>5.2){st.ph='back';st.t=0;clip('idle',.35);const m=PROTO[c.o.k];m.visible=true;opacity(c.o.k,0);c.p0=m.position.clone();c.s0=m.scale.x}}
  function stepBack(){const c=st.cur,o=c.o,m=PROTO[o.k],b=BB[o.k],u=ez(c01(st.t/.9));
    gpos(V2,o.x,o.y+o.h*.4,.4);V2.x-=b.c.x*o.s;V2.y-=b.min.y*o.s;m.position.lerpVectors(c.p0,V2,u);m.position.y+=Math.sin(u*Math.PI)*.4;m.scale.setScalar(lerp(c.s0,o.s,u));
    opacity(o.k,c01(u*3),MODE===0&&u>.8);
    if(st.t>=.9){snd('torna',.5);o.away=false;placeObj(o);const ok=c.ok;st.cur=null;st.shadow=null;
      if(ok){st.seen.add(o.n);st.count++}
      if(MODE===0){if(st.objs.every(q=>st.seen.has(q.n)))farewell();else toAsk()}
      else{st.shadow=null;if(st.count%4===0)farewell();else newRound()}}}
  /* «Endevina l'ombra»: objecte equivocat, les dues ombres de costat (sense so d'error) */
  function startWrong(o){o.react=1.3;st.wrong={k:o.n,a:0,o};st.ph='wrong';st.t=0;clip('no',.15);tell('no',1.6)}
  function farewell(){st.ph='bye';st.t=0;clip('bow',.25);say(['molt','adeu']);cap('adeu',3);snd('reverencia',.5);later(1.2,()=>snd('aplaudiment',.55))}

  /* efectes de cada número */
  function actFx(dA,n,u){if(u<0)return;const T=st.tip;
    if(n==='elefant'&&u>.4&&u<2.6&&T&&Math.random()<dA*16)fxp.push({k:'drop',x:T[0],y:T[1],vx:rnd(-70,0),vy:rnd(-220,-120),g:340,t:0,d:1.1,r:rnd(5,9),scr:1});
    if(n==='lluna'&&Math.random()<dA*4)fxp.push({k:'star',x:SCR.x+rnd(-230,230),y:SCR.y+rnd(-160,140),vx:0,vy:0,t:0,d:1.6,r:rnd(8,14),scr:1});
    if(n==='arbre'&&Math.random()<dA*3)fxp.push({k:'note',x:SCR.x+rnd(-90,90),y:SCR.y-110,vx:rnd(-20,20),vy:-40,t:0,d:1.8,r:16,scr:1});
    if(n==='cocodril'&&Math.random()<dA*5)fxp.push({k:'bub',x:SCR.x+rnd(-170,170),y:SCR.y+130,vx:rnd(-10,10),vy:-30,t:0,d:1.4,r:rnd(4,8),scr:1});
    if(n==='medusa'&&Math.random()<dA*6)fxp.push({k:'bub',x:SCR.x+rnd(-130,130),y:SCR.y+rnd(-40,150),vx:rnd(-10,10),vy:-38,t:0,d:1.6,r:rnd(4,9),scr:1});
    if(n==='erico'&&u>.3&&u<3.1&&Math.random()<dA*8)fxp.push({k:'leaf',x:st.ball?st.ball[0]:SCR.x,y:SCR.y+120,vx:rnd(-60,60),vy:rnd(-90,-40),g:160,t:0,d:1.2,r:rnd(5,8),rot:rnd(0,6),vr:rnd(-5,5),c:'rgba('+SHC+',.85)',scr:1})}

  /* ───── mirada ───── */
  function inBox(o,x,y){return x>o.x-o.w/2&&x<o.x+o.w/2&&y>o.y-o.h/2&&y<o.y+o.h/2}
  function hit(x,y){if(!st||st.ph!=='ask')return null;for(const o of st.objs)if(!o.away&&inBox(o,x,y))return{k:'obj',o};return null}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.o===b.o);
  function actionable(g){return !!g&&!!st&&g.k==='obj'&&st.ph==='ask'&&g.o.react<=0&&g.o.pop>=1&&!g.o.away}
  function activate(g){if(!actionable(g))return;idle=0;helpSaid=false;const o=g.o;
    if(MODE===1&&o.n!==st.target){startWrong(o);return}startFly(o)}
  function hint(){if(!st||st.ph!=='ask')return null;let o;
    if(MODE===1)o=st.objs.find(o=>o.n===st.target);else o=st.objs.find(o=>!st.seen.has(o.n))||st.objs[0];return o?{k:'obj',o,x:o.x,y:o.y}:null}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;st.t+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    PE.mx.update(dA);PE.ct+=dA;
    const g=has?hit(wx,wy):null;
    if(!same(g,cur)){cur=g;dw=0}
    if(g&&actionable(g)&&CFG.mode!==2){dw+=dt;const need=CFG.mode===1?CFG.dwell:.15;if(CFG.mode===1)ringP=c01(dw/need);if(dw>=need){dw=0;cur={k:'lock'};activate(g)}}else dw=0;
    /* la Pepa */
    gpos(PE.o.position,PEPA.x,PEPA.y,.2);PE.o.position.x-=BB.pepa.c.x*PE.k;PE.o.position.y-=BB.pepa.min.y*PE.k;PE.o.scale.setScalar(PE.k);PE.o.rotation.y=-.42;
    if(PE.once&&ends()&&!['present','bow'].includes(PE.cn)&&!(PE.cn==='grab'))clip(st.ph==='magic'?'clap':'idle',.3);
    if(PE.cn==='point'&&PE.ct>3)clip('idle',.3);
    for(const o of st.objs){if(o.away)continue;o.react=Math.max(0,o.react-dA);if(o.pop<1)o.pop=Math.min(1,o.pop+dA*2.4);placeObj(o)}
    if(st.ph==='intro'){if(st.t>1.6){if(MODE===0)toAsk();else newRound()}}
    else if(st.ph==='show'){st.shadow.a=c01(st.t/.6);if(st.t>.8)toAsk()}
    else if(st.ph==='fly')stepFly();
    else if(st.ph==='present'){if(st.t>1.45)startToScreen()}
    else if(st.ph==='up')stepUp();
    else if(st.ph==='grow'){st.shadow.grow=ez(c01(st.t/1));if(st.t>1.1)startMagic()}
    else if(st.ph==='match'){if(st.t>.9)startMagic()}
    else if(st.ph==='magic')stepMagic(dA);
    else if(st.ph==='back')stepBack();
    else if(st.ph==='wrong'){const u=st.t;st.wrong.a=c01(u/.4)*(1-c01((u-1.6)/.4));if(u>2.0){st.wrong=null;toAsk()}}
    else if(st.ph==='bye'){if(Math.random()<dA*14)fxp.push({k:'leaf',x:rnd(0,W),y:-20,vx:rnd(-20,20),vy:rnd(70,130),g:0,t:0,d:4,r:rnd(7,12),rot:rnd(0,6),vr:rnd(-3,3),c:CONF[Math.floor(Math.random()*5)]});
      if(st.t>5.8){st.seen.clear();if(MODE===0){setTable(shuffle(OBJ.slice()).slice(0,SZ[CFG.size].n1));toAsk();clip('wave',.2);tell('tornem',1.8)}else{clip('idle',.3);newRound()}}}
    for(const p of fxp){p.t+=dA;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA;if(p.rot!=null)p.rot+=p.vr*dA}fxp=fxp.filter(p=>p.t<p.d);
    /* ajuda: als 6 s brilla el bo; als 12 s la Pepa assenyala la taula */
    if(st.ph==='ask')idle+=dA;else idle=0;
    if(idle>HELP*2&&!helpSaid&&hint()){helpSaid=true;clip('point',.25);say(['mira']);cap('mira',2.2)}
    ROOT.updateMatrixWorld(true)}

  /* ───── dibuix ───── */
  function glow(c,x,y,rx,ry_,k=1){const p=.5+.5*Math.sin(now*2.6);c.fillStyle=`rgba(255,240,170,${(.22+.25*p)*k})`;c.beginPath();c.ellipse(x,y,rx+6*p,ry_+4*p,0,0,7);c.fill()}
  function shadowE(c,x,y,rx,ry_,a=.18){c.fillStyle=`rgba(90,40,30,${a})`;c.beginPath();c.ellipse(x,y,rx,ry_,0,0,7);c.fill()}
  const sAsp=k=>IX.shadow[k][0]/IX.shadow[k][1];
  function shH(k){return Math.min(SH,SW/sAsp(k))}
  function shadowImg(c,k,x,y,h,o={}){const im=IM['s_'+k];if(!im||!im.complete)return;const w=h*sAsp(k);c.save();c.globalAlpha=o.a??1;if(!LOWQ)c.filter='blur(.8px)';c.translate(x,y);if(o.r)c.rotate(o.r);c.scale(o.sx||1,o.sy||1);c.drawImage(im,-w/2,-h/2,w,h);c.restore()}
  function drawScreen(c){
    if(st.ph==='bye'){const u=st.t,a=c01(u/.6)*(1-c01((u-5.1)/.6));shadowImg(c,'pepa',SCR.x,SCR.y+Math.sin(now*3)*6,SH*.95,{a,r:Math.sin(now*2)*.06});return}
    const cr=st.cur;st.tip=null;st.ball=null;
    if(st.ph==='magic'&&cr){const n=CRE[cr.o.n],u=st.t,m=c01(u/.6),o=crAnim(n,u-.6);
      if(m<1)shadowImg(c,cr.o.n,SCR.x,SCR.y,shH(cr.o.n),{a:1-m,sx:1+.08*m,sy:1+.08*m});
      const uu=u-.6;
      if(n==='erico'&&uu>.4&&uu<3.2){/* l'eriçó es fa una bola i roda */const k=(uu-.4)/2.8,im=IM.erico_4,h=shH('raspall')*.8,x=SCR.x+Math.sin(k*Math.PI*2)*130;st.ball=[x,SCR.y];
        if(im&&im.complete){c.save();c.globalAlpha=m;c.translate(x,SCR.y+30);c.rotate(Math.sin(k*Math.PI*2)>0?k*Math.PI*5:k*Math.PI*5);c.drawImage(im,-h/2,-h/2,h,h);c.restore()}return}
      const P_=drawRig(c,n,uu,Object.assign(o,{a:m}));
      if(n==='elefant')st.tip=P_('trompa',22,16);
      if(n==='gallina'&&uu>2.2){const e=eBack(c01((uu-2.2)/.4)),im=IM.gallina_5,q=P_('root',150,214),f=crFit(n,0,0).s*.9;if(im&&im.complete){const w=IX.pieces.gallina_5[0]*f*e,h=IX.pieces.gallina_5[1]*f*e;c.drawImage(im,q[0]-w/2,q[1]-h/2,w,h)}}
      return}
    if(st.ph==='back'&&cr&&cr.ok&&MODE===0){const n=CRE[cr.o.n],a=1-c01(st.t/.6);if(a>0)drawRig(c,n,4.6+st.t,Object.assign(crAnim(n,4.6+st.t),{a}));return}
    if(st.ph==='back'&&cr&&cr.ok&&MODE===1){const n=CRE[cr.o.n],a=1-c01(st.t/.6);if(a>0)drawRig(c,n,4.6+st.t,Object.assign(crAnim(n,4.6+st.t),{a}));return}
    const s=st.shadow;if(!s)return;
    if(st.ph==='grow'){const g=s.grow,h=shH(s.k)*lerp(.35,1,g);shadowImg(c,s.k,SCR.x,lerp(SCR.y-120,SCR.y,g),h,{a:lerp(.3,1,g)});return}
    if(st.ph==='wrong'&&st.wrong){const u=ez(c01(st.t/.4))*(1-ez(c01((st.t-1.6)/.4))),half=k=>Math.min(shH(k)*.8,240/sAsp(k));
      shadowImg(c,s.k,SCR.x-128*u,SCR.y,lerp(shH(s.k),half(s.k),u),{a:s.a});shadowImg(c,st.wrong.k,SCR.x+132,SCR.y,half(st.wrong.k),{a:st.wrong.a*.85});return}
    if(st.ph==='match'){const p=Math.sin(c01(st.t/.9)*Math.PI);c.fillStyle=`rgba(255,240,170,${.5*p})`;c.beginPath();c.ellipse(SCR.x,SCR.y,SCR.w*.42,SCR.h*.46,0,0,7);c.fill()}
    shadowImg(c,s.k,SCR.x,SCR.y,shH(s.k),{a:s.a})}
  function drawP(f,p){const a=Math.max(0,1-p.t/p.d);f.save();f.globalAlpha=clamp(a*1.6,0,1);f.translate(p.x,p.y);
    if(p.k==='drop'){f.fillStyle=`rgba(${SHC},.9)`;f.beginPath();f.arc(0,0,p.r,0,7);f.fill()}
    else if(p.k==='bub'){f.strokeStyle=`rgba(${SHC},.8)`;f.lineWidth=3;f.beginPath();f.arc(0,0,p.r,0,7);f.stroke()}
    else if(p.k==='star'){const k=Math.sin(p.t/p.d*Math.PI);f.fillStyle='#f2b33d';f.beginPath();for(let i=0;i<10;i++){const r=(i%2?.45:1)*p.r*k,an=i*Math.PI/5-Math.PI/2;f.lineTo(Math.cos(an)*r,Math.sin(an)*r)}f.fill()}
    else if(p.k==='note'){f.fillStyle=`rgb(${SHC})`;f.font='700 30px serif';f.fillText('♪',0,0)}
    else if(p.k==='leaf'){f.rotate(p.rot);f.fillStyle=p.c;f.beginPath();f.ellipse(0,0,p.r,p.r*.5,0,0,7);f.fill()}
    f.restore()}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!CFG.simple&&IM.fons&&IM.fons.complete)c.drawImage(IM.fons,0,0,W,H);
    if(!R||!ready||!st)return;
    /* pantalla: el llum de darrere respira molt suaument; les ombres hi queden retallades */
    if(CFG.simple){c.fillStyle='#f7ecd2';c.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h)}
    const lg=c.createRadialGradient(SCR.x,SCR.y,20,SCR.x,SCR.y,300);lg.addColorStop(0,`rgba(255,246,215,${.18+.04*Math.sin(now*1.3)})`);lg.addColorStop(1,'rgba(255,246,215,0)');c.fillStyle=lg;c.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
    c.save();c.beginPath();c.rect(SCR.x-SCR.w/2+2,SCR.y-SCR.h/2+2,SCR.w-4,SCR.h-4);c.clip();drawScreen(c);for(const p of fxp)if(p.scr)drawP(c,p);c.restore();
    /* taula: ombres de contacte, brillantors i anell */
    const H0=idle>HELP?hint():null;
    for(const o of st.objs){if(o.away)continue;const pp=o.pop<0?0:Math.min(1,o.pop);if(pp<=0)continue;
      if(H0&&H0.o===o)glow(c,o.x,o.y,o.w*.55,o.h*.55,1.3);
      if(cur&&cur.o===o&&actionable(cur))glow(c,o.x,o.y,o.w*.5,o.h*.5,.55);
      shadowE(c,o.x,o.y+o.h*.4+2,o.w*.34*pp,9*pp)}
    shadowE(c,PEPA.x-8,PEPA.y+2,92,13,.2);
    R.render(S3,cam);
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    for(const p of fxp)if(!p.scr)drawP(f,p);f.globalAlpha=1;
    drawCap(f)}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('ombra.'+c.k);f.font='800 32px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=SCR.x,y=CAPY,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,250,238,.94)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,54,27);f.fill();f.fillStyle='#5c2646';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+3);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);if(actionable(g))activate(g)}
  function clearAll(){for(const k in PROTO){const m=PROTO[k];if(k!=='pepa'){m.removeFromParent();m.visible=false}}if(PE){PE.mx.stopAllAction();PE.cur=null;PE.cn=''}}
  function layout(){if(!ready)return;clearAll();newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready){clearAll();newGame()}}
  function tray(){const t=$('#tray');t.innerHTML='';['ombra.m1','ombra.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  function mus(){return 'm_ombra'}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:()=>null,hit,hint,activate,actionable,scr,
    get st(){return st},get ready(){return ready},get mode(){return MODE},get idle(){return idle},get loading(){return loading},get R(){return R},get PE(){return PE},PROTO,IX,BB,RB}
})();
