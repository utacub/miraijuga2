/* =========================================================
   ESCENARI: L'HABITACIÓ DE LES JOGUINES (abans «On és?»; joguines 3D three.js + llama 2D)
   modes: 0 Explorar, 1 Preguntes, 2 Endreçar
   ========================================================= */
const ONES=(()=>{
  const KEYS=['pilota','cotxe','osset','anec','tambor','tren','cubs','avio','poma','sabata','barret','llibre'];
  const LM=__LLAMA__;
  const CLIPS=['saluda','pregunta','espera','assenyala','anima','celebra','balla'];
  const LAY=[[[-.1,.25],[.95,.25]],[[-.35,-.35],[.75,-.35],[-.1,.55],[1.0,.55]],
    [[-.38,-.55],[.22,-.62],[.82,-.62],[1.38,-.52],[-.08,.62],[.45,.68],[.98,.64],[1.44,.44]]];
  const SZ=[.55,.45,.34];
  const KS={pilota:.84,tambor:.9,llibre:.86,poma:.9,anec:.95,cotxe:1.15,sabata:1.15,barret:1.15,avio:1.18,tren:1.1},TALL={cubs:3,llibre:3,osset:3,poma:2,anec:2,pilota:2,tambor:1,tren:1,avio:1,cotxe:0,sabata:0,barret:0};
  const MASS={pilota:.6,poma:.7,barret:.6,osset:.9,anec:.8,llibre:1,sabata:1,cubs:1.2,cotxe:1.2,tambor:1.1,tren:1.5,avio:1.1};
  /* física: la catifa és el terreny de joc (el·lipse al terra), separació mínima a la pantalla GAP px; LLX = marge de la llama */
  const RUG={cx:0,cz:-.06,ax:1.6,az:1.55},GR=6.5,KF=1.7,GAP=8,LLX=292,SB={l:10,r:10,t:120,b:8};
  const LL={x:164,y:690,s:.78};
  let R=null,SC3,cam,env,ground,keyL,blobTex,matcap,matcap2,PROTO={},NLOAD=0,cvs=null,on=false;
  let llA=1,llWait=0,bumpT=0;const YV=new THREE.Vector3(0,1,0),IDQ=new THREE.Quaternion(),qa=new THREE.Quaternion(),pv=new THREE.Vector3(),av=new THREE.Vector3();
  let toys=[],MODE=0,target=null,qt=0,helpL=0,nOk=0,nextQ=-1,bub=0,curV=null,llHov=0,llDw=0,llIn=false,okT=0,lastQ=null;
  const fons=img(U('ones/fons.webp'));const V={};const WHITE=()=>new THREE.Color(1,1,1);let WH=null;
  const mouse={x:-9,y:-9};
  function init(){if(R)return;
    cvs=document.createElement('canvas');cvs.id='c3';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:false,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.shadowMap.type=THREE.PCFSoftShadowMap;WH=WHITE();
    SC3=new THREE.Scene();cam=new THREE.PerspectiveCamera(32,16/9,.1,30);cam.position.set(0,.9,3.587);cam.lookAt(0,0,-1.64);cam.updateMatrixWorld();
    env=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;
    SC3.add(new THREE.HemisphereLight(0xfff8ee,0xe8c9a0,1.3));
    keyL=new THREE.DirectionalLight(0xfff0d8,2.4);keyL.position.set(-2.5,3.5,2.5);keyL.castShadow=true;keyL.shadow.mapSize.set(1024,1024);
    Object.assign(keyL.shadow.camera,{left:-2.5,right:2.5,top:2,bottom:-2,near:.5,far:10});keyL.shadow.bias=-.0008;keyL.shadow.radius=3;SC3.add(keyL);
    ground=new THREE.Mesh(new THREE.CircleGeometry(1.7,48),new THREE.ShadowMaterial({opacity:.2}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;SC3.add(ground);
    const bc=document.createElement('canvas');bc.width=bc.height=64;{const g=bc.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(90,55,20,.4)');gr.addColorStop(1,'rgba(90,55,20,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}
    blobTex=new THREE.CanvasTexture(bc);
    const mc=document.createElement('canvas');mc.width=mc.height=128;{const c=mc.getContext('2d');let g=c.createRadialGradient(54,48,4,64,64,64);g.addColorStop(0,'#fff');g.addColorStop(.55,'#f2f2f2');g.addColorStop(.9,'#b4b4b4');g.addColorStop(1,'#989898');c.fillStyle=g;c.fillRect(0,0,128,128);g=c.createRadialGradient(44,36,0,44,36,16);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128)}
    matcap=new THREE.CanvasTexture(mc);matcap.colorSpace=THREE.SRGBColorSpace;
    const mc2=document.createElement('canvas');mc2.width=mc2.height=128;{const c=mc2.getContext('2d'),g=c.createRadialGradient(56,50,4,64,64,66);g.addColorStop(0,'#fbfbfb');g.addColorStop(.6,'#e8e8e8');g.addColorStop(.92,'#b2b2b2');g.addColorStop(1,'#c2c2c2');c.fillStyle=g;c.fillRect(0,0,128,128)}
    matcap2=new THREE.CanvasTexture(mc2);matcap2.colorSpace=THREE.SRGBColorSpace;
    const L=new GLTFLoader();for(const k of KEYS)L.load(U('ones/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;if(k==='cubs')splitCubs(g.scene);NLOAD++;if(NLOAD===KEYS.length&&on)layout()},undefined,e=>console.error(e));
    for(const c of CLIPS){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.dataset.c=c;v.src=VSRC('ones/llama_'+c+'.webm');
      v.onended=()=>{if(curV===v&&on)playL('espera',true)};V[c]=v}
    resize()}
  function splitCubs(sc){const node=sc.getObjectByName('cubs')||sc.children[0],ms=[];node.traverse(o=>{if(o.isMesh)ms.push(o)});
    ['red','blu','yel'].forEach((c,i)=>{const p=new THREE.Group(),g=ms.filter(m=>m.material.name.includes(c)),bb=new THREE.Box3();p.name='piece'+i;
      for(const m of g){m.geometry.computeBoundingBox();bb.union(m.geometry.boundingBox)}const ce=bb.getCenter(new THREE.Vector3());p.position.copy(ce);node.add(p);
      for(const m of g){p.add(m);m.position.sub(ce)}})}
  function playL(c,loop){if(curV&&curV!==V[c])curV.pause();curV=V[c];curV.loop=!!loop;curV.playbackRate=TS;try{curV.currentTime=0}catch(e){}const p=curV.play();if(p)p.catch(()=>{})}
  function mk(k,x,z,size){const root=new THREE.Group(),tilt=new THREE.Group(),spin=new THREE.Group(),piv=new THREE.Group(),b=PROTO[k].clone(true);
    const box=new THREE.Box3().setFromObject(b),d=box.getSize(new THREE.Vector3()),s=size*(KS[k]||1)/Math.max(d.x,d.y,d.z);
    b.traverse(o=>{if(o.isMesh){if(!o.userData.hi){const hi=o.material.clone();hi.envMapIntensity=.8;o.userData.hi=hi;o.userData.lo=new THREE.MeshMatcapMaterial({color:hi.color.clone(),matcap:hi.roughness>.5?matcap2:matcap,toneMapped:false})}
      else{o.userData={hi:o.userData.hi.clone(),lo:o.userData.lo.clone()}}o.material=o.userData.hi}});
    const h=d.y*s,hc=h/2;b.scale.setScalar(s);b.position.y=-hc;piv.position.y=hc;piv.add(b);spin.add(piv);tilt.add(spin);root.add(tilt);
    const lb=new THREE.Box3().setFromObject(root),C=[];for(const cx of [lb.min.x,lb.max.x])for(const cy of [lb.min.y,lb.max.y])for(const cz of [lb.min.z,lb.max.z])C.push([cx,cy,cz]);
    const yaw=-.35+x*.12;root.position.set(x,0,z);root.rotation.y=yaw;
    const blob=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.set(x,.003,z);blob.scale.setScalar(size*1.3);
    const P=k==='cubs'?[0,1,2].map(i=>{const o=b.getObjectByName('piece'+i);return {o,R:o.position.clone()}}):null;
    SC3.add(blob);SC3.add(root);
    return {k,root,tilt,spin,piv,b,blob,x,z,y:0,vx:0,vz:0,vy:0,yaw,wy:0,hx:x,hz:z,hyaw:yaw,size,h,hc,s,r:.25*((lb.max.x-lb.min.x)+(lb.max.z-lb.min.z)),
      m:MASS[k]||1,e:k==='pilota'?.85:.55,C,rc:[0,0,0,0],sq:0,sqv:0,tax:0,taz:0,tvx:0,tvz:0,cd:0,rest:true,goal:false,gx:x,gz:z,P,cb:null,
      dw:0,hov:0,inside:false,act:-1,amp:1,ph:Math.random()*6,glow:0,wob:-1}}
  /* ---- geometria de pantalla: rectangle que ocupa cada joguina (coordenades del joc, 1280×720) ---- */
  function rectOf(t,x,z,yaw,y,o){const c=Math.cos(yaw),sn=Math.sin(yaw);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const p of t.C){pv.set(x+c*p[0]+sn*p[2],y+p[1],z-sn*p[0]+c*p[2]).project(cam);const sx=(pv.x+1)*W/2,sy=(1-pv.y)*H/2;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy}
    o[0]=x0;o[1]=y0;o[2]=x1;o[3]=y1;return o}
  function kxz(x,z){pv.set(x,0,z).project(cam);const ax=pv.x,ay=pv.y;pv.set(x+.05,0,z).project(cam);const kx=(pv.x-ax)*W/2/.05;pv.set(x,0,z+.05).project(cam);return [kx,(ay-pv.y)*H/2/.05]}
  /* desplaçament (món) que separa dues joguines solapades a la pantalla, pel camí més curt */
  function sepRect(A,B,gap,push=0,w=1){const a=A.rc,b=B.rc;let ox=Math.min(a[2],b[2])-Math.max(a[0],b[0])+gap,oy=Math.min(a[3],b[3])-Math.max(a[1],b[1])+gap;
    if(ox<=0||oy<=0)return null;ox+=push;oy+=push;const ka=kxz(A.x,A.z),kb=kxz(B.x,B.z);
    if(ox<=oy*w){const sa=(a[0]+a[2])<(b[0]+b[2])?-1:1;return [sa*ox/2/ka[0],0,-sa*ox/2/kb[0],0]}
    const fa=a[3]>b[3]?1:-1;return [0,fa*oy/2/ka[1],0,-fa*oy/2/kb[1]]}
  /* límits: dins de la catifa, dins de la pantalla i, si cal, fora de la zona de la llama */
  function bound(t,excl){let dx=t.x-RUG.cx,dz=t.z-RUG.cz,hit=false;const ax=RUG.ax-t.r,az=RUG.az-t.r,q=(dx/ax)**2+(dz/az)**2;
    if(q>1.0001){const f=1/Math.sqrt(q);t.x=RUG.cx+dx*f;t.z=RUG.cz+dz*f;let nx=dx/(ax*ax),nz=dz/(az*az);const l=Math.hypot(nx,nz);nx/=l;nz/=l;const vn=t.vx*nx+t.vz*nz;if(vn>0){t.vx-=1.5*vn*nx;t.vz-=1.5*vn*nz}hit=true}
    rectOf(t,t.x,t.z,t.yaw,0,t.rc);const k=kxz(t.x,t.z),L=excl?LLX:SB.l;let ex=0,ez=0;
    if(t.rc[0]<L-.05)ex=(L-t.rc[0])/k[0];else if(t.rc[2]>W-SB.r+.05)ex=(W-SB.r-t.rc[2])/k[0];
    if(t.rc[3]>H-SB.b+.05)ez=(H-SB.b-t.rc[3])/k[1];else if(t.rc[1]<SB.t-.05)ez=(SB.t-t.rc[1])/k[1];
    if(ex){t.x+=ex;if(t.vx*ex<0)t.vx*=-.5;hit=true}if(ez){t.z+=ez;if(t.vz*ez<0)t.vz*=-.5;hit=true}return hit}
  /* col·locació inicial: relaxació fins que cap joguina se solapi amb una altra */
  function relax(list,excl,N,hp){let bad=0;for(let it=0;it<N;it++){bad=0;
      for(const t of list)bound(t,excl);
      for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const A=list[i],B=list[j];let dx=B.x-A.x,dz=B.z-A.z;const d=Math.hypot(dx,dz)||1e-4,pen=A.r+B.r+.02-d;
        if(pen>0){bad++;dx/=d;dz/=d;const q=(pen+.006)/2;A.x-=dx*q;A.z-=dz*q;B.x+=dx*q;B.z+=dz*q;rectOf(A,A.x,A.z,A.yaw,0,A.rc);rectOf(B,B.x,B.z,B.yaw,0,B.rc)}
        const s=sepRect(A,B,GAP*1.6,4,hp?(it<N/4?1.5:it<N/2?3:6):1);if(s){bad++;const f=it<N/2?.7:1;A.x+=s[0]*f;A.z+=s[1]*f;B.x+=s[2]*f;B.z+=s[3]*f;rectOf(A,A.x,A.z,A.yaw,0,A.rc);rectOf(B,B.x,B.z,B.yaw,0,B.rc)}}
      if(!bad&&it>2)break}
    for(const t of list)bound(t,excl);return bad}
  function overlaps(gap=0){let n=0;for(const t of toys)rectOf(t,t.x,t.z,t.yaw,0,t.rc);for(let i=0;i<toys.length;i++)for(let j=i+1;j<toys.length;j++)if(sepRect(toys[i],toys[j],gap))n++;
    for(const t of toys)rectOf(t,t.x,t.z,t.yaw,t.y,t.rc);return n}
  function layout(force){if(!R||NLOAD<KEYS.length)return;for(const t of toys){SC3.remove(t.root);SC3.remove(t.blob)}
    const n=[2,4,8][CFG.size],ks=Array.isArray(force)?force.slice():KEYS.slice().sort(()=>Math.random()-.5).slice(0,n);
    if(n>2){ks.sort((a,b)=>TALL[b]-TALL[a]+(Math.random()-.5)*.9);const h=n/2,bk=ks.slice(0,h).sort(()=>Math.random()-.5),fr=ks.slice(h).sort(()=>Math.random()-.5);ks.length=0;ks.push(...bk,...fr)}toys=LAY[CFG.size].map((p,i)=>mk(ks[i],p[0],p[1],SZ[CFG.size]));
    for(let k=0;k<6;k++){if(!relax(toys,true,400))break;if(k<5)for(const t of toys){t.x+=(Math.random()-.5)*.1;t.z+=(Math.random()-.5)*.05}}
    for(const t of toys){t.hx=t.x;t.hz=t.z;t.root.position.set(t.x,0,t.z);t.blob.position.set(t.x,.003,t.z)}
    applyQ();target=null;nextQ=MODE===1?.8:-1;bub=0;showRug();if(MODE===2)shNew(true)}
  function applyQ(){if(!R)return;R.shadowMap.enabled=!LOWQ&&MODE!==2;SC3.environment=LOWQ?null:env;ground.visible=!LOWQ&&MODE!==2;
    for(const t of toys){t.blob.visible=LOWQ&&MODE!==2;t.b.traverse(o=>{if(o.isMesh){o.castShadow=!LOWQ;o.material=LOWQ?o.userData.lo:o.userData.hi;o.material.needsUpdate=true}})}
    if(SH)for(const it of SH.items)it.t.b.traverse(o=>{if(o.isMesh){o.material=LOWQ?o.userData.lo:o.userData.hi;o.material.needsUpdate=true}})}
  /* les joguines de la catifa només es veuen a Explorar i Preguntes */
  function showRug(){const v=MODE!==2;for(const t of toys)t.root.visible=v;if(SHG)SHG.visible=!v;applyQ()}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.round(W*SC*pr),Math.round(H*SC*pr),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});applyQ()}
  window.__onesResize=resize;
  function name(k){return T('ones.t.'+k)}
  // ---- veu de la llama (ElevenLabs, un fitxer per frase i idioma) ----
  const VB={},VN=['be','gairebe','aqui','endreca','fi'].concat(KEYS.map(k=>'q_'+k),KEYS.map(k=>'n_'+k));let vSrc=null,sayTk=0,sayIn=-1,sayWhat=null;
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('ones/veu/'+key+'.mp3')).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b));return VB[key]}
  function preload(){if(!AC)return;for(const n of VN)vload(n).catch(()=>{})}
  function hush(){sayTk++;sayIn=-1;if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}duck(false)}
  function duck(d){if(!AC)return;const base=CFG.music?CFG.mvol:0,t=AC.currentTime;MUG.gain.cancelScheduledValues(t);MUG.gain.setTargetAtTime(d?base*.3:base,t,d?.06:.25)}
  function say(n){if(!AC||!CFG.sound)return;const tk=++sayTk;vload(n).then(b=>{if(tk!==sayTk||!on)return;if(vSrc){try{vSrc.stop()}catch(e){}}
    const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=TS<1?.85:1;const g=AC.createGain();g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;duck(true);
    s.onended=()=>{if(vSrc===s){vSrc=null;duck(false)}}}).catch(()=>{})}
  function sayLater(n,d){sayWhat=n;sayIn=d}
  function ask(){const av=toys.filter(t=>t!==lastQ);target=pick(av.length?av:toys);lastQ=target;qt=0;helpL=0;bub=0;playL('pregunta');sayLater('q_'+target.k,.35)}
  function setMode(m){const keep=m===2&&MODE===2&&SH;MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));target=null;bub=0;okT=0;
    for(const t of toys){t.glow=0;t.wob=-1;t.rest=false}if(!keep)hush();
    if(m===1){nextQ=.6}else if(m===0){nextQ=-1;llWait=1;if(llA>.05)playL('saluda')}else{nextQ=-1;if(curV)curV.pause();if(!keep)shNew(true)}
    if(m!==2)shClear();showRug()}
  const MLAB=['ones.exp','ones.ask','ones.tidy'];
  function tray(){const t=$('#tray');t.innerHTML='';for(const [m,k] of MLAB.map((k,i)=>[i,k])){const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)}
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function activate(t){STATS.n++;$('#oN').textContent=STATS.n;if(okT>0)return;
    if(MODE===2)return;if(!MODE){if(ready(t)){kick(t);play('t_'+t.k,.85)||play('ding',.55,.8+KEYS.indexOf(t.k)*.04)}return}
    if(!target||bub<1)return;
    if(t===target){t.act=0;t.amp=1.15;const five=++nOk%5===0;play('t_'+t.k,.8);play(five?'jingle':'encert',.6,1,.15)||play('ding',.7,1.2);sayLater('be',five?1.25:1.05);playL(five?'balla':'celebra');okT=nOk%5===0?6:3.8;for(const q of toys){q.glow=0;q.wob=-1}}
    else{if(t.act<0){t.act=0;t.amp=.45}if(curV!==V.anima)playL('anima');if(!vSrc&&sayIn<0)say('gairebe')}}
  const spd=t=>Math.hypot(t.vx,t.vz),wrapA=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
  function ready(t){return MODE?t.act<0:t.cd<=0&&!t.cb&&!t.goal&&t.y<.02&&spd(t)<.05}
  /* impuls: la joguina surt cap a una veïna (perquè hi xoqui) amb un salt i un gir */
  function kick(t){t.cd=.75;t.rest=false;t.act=-1;
    if(t.k==='cubs'){breakCubs(t);t.vy=.5;return}
    /* direcció a l'atzar en la pantalla (amunt = cap al fons, avall = endavant), amb un recorregut visible; es prefereix un final dins la catifa */
    const k=kxz(t.x,t.z);let dx=0,dz=0;
    for(let n=0;n<10;n++){const th=Math.random()*TAU,D=150+Math.random()*190;dx=Math.cos(th)*D/k[0];dz=Math.sin(th)*D*.5/k[1];
      if(((t.x+dx-RUG.cx)/(RUG.ax-t.r))**2+((t.z+dz-RUG.cz)/(RUG.az-t.r))**2<.9)break}
    const dir=Math.atan2(dz,dx),trav=Math.min(1.6,Math.hypot(dx,dz));
    t.goal=false;const v0=trav*KF;t.vx+=Math.cos(dir)*v0;t.vz+=Math.sin(dir)*v0;t.vy=Math.sqrt(2*GR*(t.k==='pilota'?.3:.15));t.sqv+=1.2;
    if(t.k!=='pilota')t.wy+=(Math.random()<.5?-1:1)*(3+Math.random()*2.5)}
  /* cubs: es desmunten i tornen a apilar-se com si fossin magnètics */
  function breakCubs(t,snd){if(!t.P||t.cb)return;const th=Math.random()*TAU,s=t.s,G=GR/s,hh=.1725;t.cd=2.4;if(snd)play('t_cubs',.8);
    t.cb={t:0,p:t.P.map((P,i)=>{const a=th+i*2.1+(Math.random()-.5)*.5,hs=[.42,.6,.78][i]*(.85+Math.random()*.3),vy=[.35,1.05,1.5][i]/s,y0=P.R.y;
      return {P:P.R.clone(),V:new THREE.Vector3(Math.cos(a)*hs/s,vy,Math.sin(a)*hs/s),spin:(Math.random()<.5?-1:1)*(3+Math.random()*3),yawA:0,flip:[0,Math.PI,TAU][i],
        fax:new THREE.Vector3(Math.sin(a),0,-Math.cos(a)),Tl:(vy+Math.sqrt(vy*vy+2*G*Math.max(0,y0-hh)))/G,land:false,from:null,done:false}})}}
  function stepCubs(t,h){const c=t.cb,G=GR/t.s,hh=.1725;c.t+=h;
    c.p.forEach((q,i)=>{const o=t.P[i].o,R0=t.P[i].R,tm=1.25+i*.17;if(q.done)return;
      if(c.t<tm){q.V.y-=G*h;q.P.addScaledVector(q.V,h);
        if(q.P.y<hh){q.P.y=hh;if(!q.land&&q.V.y<-.5/t.s){q.V.y*=-.28;q.V.x*=.55;q.V.z*=.55;if(i)play('xoc',.32,1.25+Math.random()*.3)}else q.V.y=0;q.land=true}
        if(q.land&&q.P.y<=hh+1e-4){const f=Math.exp(-5*h);q.V.x*=f;q.V.z*=f;q.spin*=Math.exp(-4*h)}
        q.yawA+=q.spin*h;o.position.copy(q.P);o.quaternion.setFromAxisAngle(YV,q.yawA);qa.setFromAxisAngle(q.fax,q.flip*Math.min(1,c.t/q.Tl));o.quaternion.premultiply(qa)}
      else{if(!q.from)q.from={P:o.position.clone(),Q:o.quaternion.clone()};const u=Math.min(1,(c.t-tm)/.42),e=Math.pow(u,2.2);
        o.position.lerpVectors(q.from.P,R0,e);o.position.y+=Math.sin(Math.PI*e)*[.03,.12,.16][i]/t.s;o.quaternion.slerpQuaternions(q.from.Q,IDQ,Math.min(1,u*1.3));
        if(u>=1){q.done=true;o.position.copy(R0);o.quaternion.identity();play('clac',.55,1+.12*i);t.sqv-=1.2}}});
    if(c.p.every(q=>q.done))t.cb=null}
  function bump(sp){if(bumpT>0)return;bumpT=.07;play('xoc',Math.min(.8,.18+sp*.35),.85+Math.random()*.35)}
  /* reacció d'una joguina que rep un cop en la direcció (nx,nz): petit salt, balanceig i gir */
  function react(t,nx,nz,s){if(s>.35&&t.y<.01)t.vy=Math.max(t.vy,Math.min(1.1,s*.55));
    const c=Math.cos(t.yaw),sn=Math.sin(t.yaw),wx=nz*s*4,wz=-nx*s*4;t.tvx+=wx*c-wz*sn;t.tvz+=wx*sn+wz*c;
    if(t.k!=='pilota')t.wy+=(Math.random()-.5)*s*4}
  /* pas de física (subpassos fixos): Explorar = impulsos, xocs i separació; Preguntes = tornen al seu lloc */
  function phys(dt){if(MODE===2)return;const n=Math.max(1,Math.ceil(dt/.012)),h=dt/n,excl=MODE===1;
    for(let st=0;st<n;st++){
      for(const t of toys){if(t.cd>0)t.cd-=h;if(t.cb)stepCubs(t,h);
        if(MODE){if(!t.rest){t.vx+=(14*(t.hx-t.x)-7.5*t.vx)*h;t.vz+=(14*(t.hz-t.z)-7.5*t.vz)*h;
            if(Math.hypot(t.hx-t.x,t.hz-t.z)<.002&&spd(t)<.02&&t.y<=0){t.x=t.hx;t.z=t.hz;t.vx=t.vz=0;t.rest=true}}
          t.wy=4*wrapA(t.hyaw-t.yaw);if(t.k==='pilota')t.piv.quaternion.slerp(IDQ,Math.min(1,h*3))}
        else if(t.goal){t.vx+=(30*(t.gx-t.x)-11*t.vx)*h;t.vz+=(30*(t.gz-t.z)-11*t.vz)*h;
          if(Math.hypot(t.gx-t.x,t.gz-t.z)<.003&&spd(t)<.03){t.x=t.gx;t.z=t.gz;t.vx=t.vz=0;t.goal=false}}
        else if(!t.rest){const f=Math.exp(-KF*h);t.vx*=f;t.vz*=f;const v=spd(t);if(v>0){const dv=Math.min(v,.3*h)/v;t.vx-=t.vx*dv;t.vz-=t.vz*dv}}
        if(!MODE&&!t.cb&&t.y<=0&&spd(t)<.25)t.wy=clamp(4*wrapA(t.hyaw-t.yaw),-2.5,2.5);
        t.yaw+=t.wy*h;if(!MODE)t.wy*=Math.exp(-2.2*h);
        t.x+=t.vx*h;t.z+=t.vz*h;
        if(t.y>0||t.vy>0){t.vy-=GR*h;t.y+=t.vy*h;if(t.y<=0){t.y=0;const im=-t.vy;if(im>.25){t.sqv-=Math.min(5,im*2.6);t.vy=im*(t.k==='pilota'?.55:.2);if(t.vy<.3)t.vy=0}else t.vy=0}}
        t.sqv+=(-220*t.sq-9*t.sqv)*h;t.sq=clamp(t.sq+t.sqv*h,-.25,.25);
        t.tvx+=(-140*t.tax-7*t.tvx)*h;t.tvz+=(-140*t.taz-7*t.tvz)*h;t.tax=clamp(t.tax+t.tvx*h,-.3,.3);t.taz=clamp(t.taz+t.tvz*h,-.3,.3);
        const v=spd(t);if(t.k==='pilota'&&v>1e-4){av.set(t.vz,0,-t.vx).divideScalar(v);const c=Math.cos(t.yaw),sn=Math.sin(t.yaw),lx=av.x*c-av.z*sn,lz=av.x*sn+av.z*c;
          av.set(lx,0,lz);qa.setFromAxisAngle(av,v*h/t.hc);t.piv.quaternion.premultiply(qa)}}
      if(!MODE)for(let i=0;i<toys.length;i++)for(let j=i+1;j<toys.length;j++){const A=toys[i],B=toys[j];let nx=B.x-A.x,nz=B.z-A.z;const d=Math.hypot(nx,nz)||1e-4,rr=A.r+B.r;
        if(d<rr&&!A.goal&&!B.goal){nx/=d;nz/=d;const ia=1/A.m,ib=1/B.m,im=ia+ib,pen=rr-d;A.x-=nx*pen*ia/im;A.z-=nz*pen*ia/im;B.x+=nx*pen*ib/im;B.z+=nz*pen*ib/im;
          const vr=(B.vx-A.vx)*nx+(B.vz-A.vz)*nz;if(vr<0){const calm=false,e=Math.max(A.e,B.e),jj=-(1+e)*vr/im;A.vx-=jj*nx*ia;A.vz-=jj*nz*ia;B.vx+=jj*nx*ib;B.vz+=jj*nz*ib;A.rest=B.rest=false;
            const sp=-vr;if(sp>.18&&!calm){bump(sp);react(A,-nx,-nz,sp*ia/im*2);react(B,nx,nz,sp*ib/im*2);for(const C of [A,B])if(C.k==='cubs'&&sp>.7&&!C.cb)breakCubs(C,true)}}}}
      for(const t of toys){if(bound(t,excl))t.rest=false;
        if(!MODE&&!t.rest&&!t.goal&&t.y<=0&&t.vy<=0&&spd(t)<.03&&Math.abs(wrapA(t.hyaw-t.yaw))<.03){t.vx=t.vz=0;t.wy=0;t.yaw=t.hyaw;t.rest=true;setT=0}}}
    settle(dt);
    if(bumpT>0)bumpT-=dt;
    for(const t of toys)rectOf(t,t.x,t.z,t.yaw,t.y,t.rc)}
  /* quan les joguines s'alenteixen i encara se solapen a la pantalla, es busca la col·locació lliure més propera i hi llisquen */
  let setT=0;
  function settle(dt){if(MODE)return;setT-=dt;if(setT>0||toys.some(t=>t.goal))return;setT=.2;
    const sl=toys.filter(t=>t.y<=0&&t.vy<=0&&spd(t)<.25);if(sl.length<2)return;
    for(const t of sl)rectOf(t,t.x,t.z,t.hyaw,0,t.rc);let need=false;
    for(let i=0;i<sl.length&&!need;i++)for(let j=i+1;j<sl.length;j++)if(sepRect(sl[i],sl[j],GAP)){need=true;break}
    if(!need)return;
    let tm=null,best=null,bb=1e9;for(let k=0;k<4;k++){const j=k*.06;tm=sl.map(t=>({x:t.x+(Math.random()-.5)*j,z:t.z+(Math.random()-.5)*j*.5,yaw:t.hyaw,r:t.r,C:t.C,rc:[0,0,0,0],vx:0,vz:0}));const bd=relax(tm,false,300,true);if(bd<bb){bb=bd;best=tm}if(!bd)break}tm=best;
    sl.forEach((t,i)=>{const g=tm[i];if(Math.hypot(g.x-t.x,g.z-t.z)>.003){t.gx=g.x;t.gz=g.z;t.goal=true;t.rest=false}})}
  function activateLl(){STATS.n++;if(MODE===1&&target&&okT<=0){bub=0;playL('pregunta');sayLater('q_'+target.k,.3)}else if(!MODE)playL('saluda')}
  const ray=new THREE.Raycaster(),sph=new THREE.Sphere(),v3=new THREE.Vector3(),hit=new THREE.Vector3(),nd=new THREE.Vector2();
  function pickToy(cx,cy){if(cx<-999||!R)return null;const [wx,wy]=toWorld(cx,cy);let best=null,bz=-1e9;
    for(const t of toys){const r=t.rc;if(wx>r[0]-6&&wx<r[2]+6&&wy>r[1]-6&&wy<r[3]+6&&r[3]>bz){bz=r[3];best=t}}return best}
  function onLl(cx,cy){if(cx<-999||llA<.6)return false;const [wx,wy]=toWorld(cx,cy);return wx>LL.x-95&&wx<LL.x+95&&wy>LL.y-330&&wy<LL.y}
  function click(cx,cy){if(MODE===2){const q=shPick(cx,cy);if(q)shAct(q);else if(shOnCur(cx,cy))shTapCur();return}const t=pickToy(cx,cy);if(t)activate(t);else if(onLl(cx,cy))activateLl()}
  function step(dt){if(!R)return;
    if(MODE===2){llA=Math.max(0,llA-dt*3);if(llA<=0&&curV&&!curV.paused)curV.pause();shStep(dt);if(sayIn>=0){sayIn-=dt;if(sayIn<0)say(sayWhat)}return}
    const free=!optsOpen&&view==='scene';phys(dt);
    const hv=free?pickToy(cmx,cmy):null,lh=!hv&&free&&onLl(cmx,cmy);ringP=0;
    for(const t of toys){const onT=t===hv;
      if(CFG.mode===0){if(onT&&!t.inside&&ready(t))activate(t)}
      else if(CFG.mode===1){if(onT&&ready(t)&&okT<=0){t.dw+=dt;ringP=clamp(t.dw/CFG.dwell,0,1);if(t.dw>=CFG.dwell){t.dw=0;activate(t)}}else t.dw=0}
      t.inside=onT;t.hov+=((onT&&ready(t)?1:0)-t.hov)*Math.min(1,dt*8)}
    if(CFG.mode===0){if(lh&&!llIn)activateLl()}else if(CFG.mode===1){if(lh){llDw+=dt;ringP=clamp(llDw/CFG.dwell,0,1);if(llDw>=CFG.dwell){llDw=-99;activateLl()}}else llDw=0}
    llIn=lh;llHov+=((lh?1:0)-llHov)*Math.min(1,dt*8);
    if(MODE===1){llWait=0;llA=Math.min(1,llA+dt*2)}else if(llWait>0)llWait-=dt;else llA=Math.max(0,llA-dt*1.25);
    if(llA<=0&&curV&&!curV.paused)curV.pause();
    if(sayIn>=0){sayIn-=dt;if(sayIn<0)say(sayWhat)}
    if(okT>0){okT-=dt;if(okT<=0&&MODE===1)nextQ=.3}
    if(nextQ>=0){nextQ-=dt;if(nextQ<0&&MODE===1&&toys.length)ask()}
    if(MODE===1&&target&&okT<=0){bub=Math.min(1,bub+dt*3);qt+=dt;
      if(qt>7&&helpL<1){helpL=1;target.wob=0;say('q_'+target.k)}
      if(qt>13&&helpL<2){helpL=2;playL('assenyala');say('aqui')}
      if(qt>13)target.glow=Math.min(1,target.glow+dt*2);if(helpL>=1&&target.wob<0&&qt%5<dt)target.wob=0}
    else if(okT>0)bub=Math.min(1,bub+dt*3);
    const sp=CFG.speed,now=performance.now()/1000;
    for(const t of toys){let y=0,sq=1,rot=0,wz=0,em=t.hov*.08+t.glow*(.1+.06*Math.sin(now*5));
      if(t.act>=0){t.act+=dt;const a=t.act,P=.5,n=t.amp<1?1:3;
        if(a<n*P){const i=Math.floor(a/P),f=(a%P)/P,hh=(.5-i*.13)*t.h*t.amp;y=4*hh*f*(1-f);const c=Math.min(f,1-f);sq=c<.07?1-.2*t.amp*(1-c/.07)*(1-i*.25):1+.07*t.amp*Math.sin(f*Math.PI);rot=t.amp<1?0:a*(Math.PI*2/(n*P));em=Math.max(em,.12)}
        else if(a<n*P+.4){const f=(a-n*P)/.4;sq=1-.08*Math.sin(f*Math.PI*2)*(1-f)}else t.act=-1}
      if(t.wob>=0){t.wob+=dt;const f=t.wob/.9;if(f>=1)t.wob=-1;else{wz=Math.sin(f*Math.PI*6)*.09*(1-f);y=Math.max(y,Math.sin(f*Math.PI)*t.h*.12)}}
      y=Math.max(y,t.y);sq*=1+t.sq;if(t.y>0)sq*=1+clamp(t.vy*.05,-.05,.08);
      const br=1+Math.sin(now*1.4*Math.max(sp,.15)+t.ph)*.012*(sp>0?1:0);t.root.position.set(t.x,y,t.z);t.root.rotation.y=t.yaw;t.tilt.rotation.set(t.tax,0,t.taz+wz);
      t.spin.scale.set(br/Math.sqrt(sq),br*sq,br/Math.sqrt(sq));t.spin.rotation.y=rot;t.blob.position.set(t.x,.003,t.z);
      t.b.traverse(o=>{if(o.isMesh){const m=o.material;if(m.emissive){m.emissive.setRGB(1,.95,.75);m.emissiveIntensity=em}else m.color.copy(o.userData.hi.color).lerp(WH,em*.6)}});
      const hs=1-Math.min(.5,y/(t.h*2));t.blob.scale.setScalar(t.size*1.3*hs);t.blob.material.opacity=hs}}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    if(MODE===2){shRender(c);if(NLOAD<KEYS.length){c.fillStyle='rgba(90,60,30,.6)';c.font='800 30px Nunito, sans-serif';c.textAlign='center';c.fillText('…',W/2,H*.5)}R.render(SC3,cam2||cam);return}
    if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    // llama
    const v=curV;if(v&&v.readyState>=2&&llA>.003){const m=LM['llama_'+v.dataset.c],s=LL.s*(1+llHov*.03);c.globalAlpha=llA;
      if(!LOWQ){c.fillStyle='rgba(90,55,20,.22)';c.beginPath();c.ellipse(LL.x,LL.y-3,100,18,0,0,TAU);c.fill()}
      c.save();if(llHov>.02&&!LOWQ){c.shadowColor=`rgba(255,240,170,${.8*llHov})`;c.shadowBlur=24*llHov}
      c.drawImage(AF(v),LL.x-m.footX*s,LL.y-m.footY*s,m.w*s,m.h*s);c.restore();c.globalAlpha=1}
    if(NLOAD<KEYS.length){c.fillStyle='rgba(255,255,255,.85)';c.font='800 30px Nunito, sans-serif';c.textAlign='center';c.fillText('…',W/2+120,H*.7)}
    // bombolla de la pregunta
    if(MODE===1&&bub>0&&(target||okT>0)){const txt=okT>0?T('well'):T(PL(target)?'ones.qp':'ones.q').replace('{n}',name(target.k));
      const g=bub<1?eBack(bub):1;c.save();c.translate(W/2+70,170);c.scale(g,g);c.font='900 54px Nunito, "Segoe UI", sans-serif';c.textAlign='center';c.textBaseline='middle';
      const tw=c.measureText(txt).width+80;c.fillStyle='rgba(255,255,255,.95)';c.shadowColor='rgba(0,0,0,.18)';c.shadowBlur=18;c.shadowOffsetY=5;
      c.beginPath();c.roundRect(-tw/2,-48,tw,96,48);c.fill();c.beginPath();c.moveTo(-tw/2+70,40);c.lineTo(-tw/2+30,82);c.lineTo(-tw/2+120,44);c.fill();c.shadowColor='transparent';
      c.fillStyle=okT>0?'#1f6f5c':'#1d2a3a';c.fillText(txt,0,3);c.restore()}
    R.render(SC3,cam)}
  const PL=t=>t&&t.k==='cubs';
  /* =========================================================
     MODE ENDREÇAR: lleixa amb graella (3×2, 3×3, 4×3); les joguines apareixen d'una en una a la catifa
     i l'infant mira la casella on va (silueta semitransparent). Càmera frontal pròpia (cam2).
     ========================================================= */
  const GRID=[[3,2],[3,3],[4,3]],GN=g=>GRID[g][0]+'x'+GRID[g][1];
  /* lleixes pintades (ChatGPT): imatge i caselles en coordenades del joc; si no n'hi ha, lleixa provisional dibuixada per codi */
  const SHELF={"3x2":{"img":"ones/lleixa_3x2.webp","cells":[[282,146,512,333],[530,146,752,333],[770,146,998,333],[282,351,512,528],[530,351,752,528],[770,351,998,528]],"spawn":[635,662]},"3x3":{"img":"ones/lleixa_3x3.webp","cells":[[282,145,511,264],[524,145,756,264],[769,145,998,264],[282,279,511,394],[524,279,756,394],[769,279,998,394],[282,409,511,528],[524,409,756,528],[769,409,998,528]],"spawn":[635,662]},"4x3":{"img":"ones/lleixa_4x3.webp","cells":[[282,145,452,264],[467,145,633,264],[648,145,814,264],[828,145,998,264],[282,279,452,394],[467,279,633,394],[648,279,814,394],[828,279,998,394],[282,410,452,528],[467,410,633,528],[648,410,814,528],[828,410,998,528]],"spawn":[635,662]}};
  const PH={w:[.6,.6,.6],y0:122,y1:562,F:20,D:16},SPN={x:640,y:692};
  let cam2=null,SHG=null,K2=1,SH=null;const SHBG={},SHIMG={};
  /* dibuixos 2D pintats a mà (ChatGPT) de cada joguina, al fons del seu forat; si no s'han carregat, silueta 3D */
  const DIMG={},dOK=k=>{const i=DIMG[k];return !!(i&&i.complete&&i.naturalWidth)};
  function shCells(g){const S=SHELF[GN(g)];if(S)return S.cells.map(c=>({x0:c[0],y0:c[1],x1:c[2],y1:c[3]}));
    const [nc,nr]=GRID[g],w=W*PH.w[g],x0=W/2-w/2,cw=(w-2*PH.F-(nc-1)*PH.D)/nc,ch=(PH.y1-PH.y0-2*PH.F-(nr-1)*PH.D)/nr,o=[];
    for(let r=0;r<nr;r++)for(let c=0;c<nc;c++){const a=x0+PH.F+c*(cw+PH.D),b=PH.y0+PH.F+r*(ch+PH.D);o.push({x0:a,y0:b,x1:a+cw,y1:b+ch})}return o}
  function shSpawn(g){const S=SHELF[GN(g)];return S&&S.spawn?{x:S.spawn[0],y:S.spawn[1]}:SPN}
  function shBg(g){const n=GN(g),S=SHELF[n];if(S&&!CFG.simple){if(!SHIMG[n])SHIMG[n]=img(S.img);const im=SHIMG[n];if(im.complete&&im.naturalWidth)return im}
    /* fons simplificat (o mentre es carrega la imatge): parets i lleixa plans, amb les mateixes caselles */
    if(SHBG[n])return SHBG[n];const cv2=document.createElement('canvas');cv2.width=W;cv2.height=H;const c=cv2.getContext('2d'),cells=shCells(g),sp=shSpawn(g);
    const bx0=Math.min(...cells.map(q=>q.x0))-PH.F,bx1=Math.max(...cells.map(q=>q.x1))+PH.F,by0=Math.min(...cells.map(q=>q.y0))-PH.F,by1=Math.max(...cells.map(q=>q.y1))+PH.F*1.6;
    let gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#dcefe6');gr.addColorStop(.75,'#cfe6dc');c.fillStyle=gr;c.fillRect(0,0,W,H);
    const fy=by1-6;gr=c.createLinearGradient(0,fy,0,H);gr.addColorStop(0,'#e7b78b');gr.addColorStop(1,'#f0c69c');c.fillStyle=gr;c.fillRect(0,fy,W,H-fy);
    c.fillStyle='#f6efe6';c.fillRect(0,fy-10,W,10);c.strokeStyle='rgba(150,90,40,.18)';c.lineWidth=2;for(let y=fy+28;y<H;y+=34){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
    c.fillStyle='rgba(120,70,30,.18)';c.beginPath();c.ellipse(sp.x,sp.y-8,200,40,0,0,TAU);c.fill();c.fillStyle='#f4e8d6';c.beginPath();c.ellipse(sp.x,sp.y-14,196,38,0,0,TAU);c.fill();
    c.save();c.shadowColor='rgba(80,50,20,.25)';c.shadowBlur=24;c.shadowOffsetY=8;c.fillStyle='#e9cfa4';c.beginPath();c.roundRect(bx0,by0,bx1-bx0,by1-by0,16);c.fill();c.restore();
    for(const q of cells){gr=c.createLinearGradient(0,q.y0,0,q.y1);gr.addColorStop(0,'#e8dac4');gr.addColorStop(.25,'#f6ecdc');gr.addColorStop(1,'#f3e6d1');c.fillStyle=gr;c.beginPath();c.roundRect(q.x0,q.y0,q.x1-q.x0,q.y1-q.y0,8);c.fill();
      c.fillStyle='rgba(120,80,40,.10)';c.fillRect(q.x0,q.y1-10,q.x1-q.x0,10)}
    SHBG[n]=cv2;return cv2}
  const wp=(x,y)=>[(x-W/2)/K2,(H/2-y)/K2];
  function srect(t,x,y,z,yaw,s,o){const c=Math.cos(yaw),sn=Math.sin(yaw);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    for(const p of t.C){pv.set(x+s*(c*p[0]+sn*p[2]),y+s*p[1],z+s*(-sn*p[0]+c*p[2])).project(cam2);const sx=(pv.x+1)*W/2,sy=(1-pv.y)*H/2;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy}
    o[0]=x0;o[1]=y0;o[2]=x1;o[3]=y1;return o}
  /* silueta: còpia de la joguina amb materials plans semitransparents (sense copiar userData, que guarda materials) */
  function ghostOf(t){const ud=[],src=[],dst=[];t.root.traverse(o=>{ud.push([o,o.userData]);o.userData={};if(o.isMesh)src.push(o)});const g=t.root.clone(true);for(const [o,u] of ud)o.userData=u;
    g.traverse(o=>{if(o.isMesh)dst.push(o)});dst.forEach((o,i)=>{const h=src[i].userData.hi,c=h.color.clone().lerp(WHITE(),.3);
      o.material=new THREE.MeshBasicMaterial({color:c,map:h.map||null,transparent:true,opacity:.34,depthWrite:false,toneMapped:false});o.castShadow=false});return g}
  function shInit(){if(cam2)return;cam2=new THREE.PerspectiveCamera(30,16/9,.1,30);cam2.position.set(0,0,4.2);cam2.lookAt(0,0,0);cam2.updateMatrixWorld();
    K2=H/(2*4.2*Math.tan(15*Math.PI/180));SHG=new THREE.Group();SHG.visible=false;SC3.add(SHG)}
  function shClear(){if(!SH)return;for(const it of SH.items){SHG.remove(it.t.root);SHG.remove(it.g)}SH=null}
  /* ronda nova: joguines a l'atzar a les caselles, ordre d'aparició a l'atzar */
  function shNew(intro){if(!R||NLOAD<KEYS.length)return;shInit();shClear();const g=CFG.size,cells=shCells(g),ks=KEYS.slice().sort(()=>Math.random()-.5).slice(0,cells.length),sp=shSpawn(g),yaw=-.3;
    const items=cells.map((q,i)=>{const k=ks[i],t=mk(k,0,0,.6);SC3.remove(t.blob);SC3.remove(t.root);t.b.traverse(o=>{if(o.isMesh)o.castShadow=false});
      const cw=q.x1-q.x0,ch=q.y1-q.y0,[X,Y]=wp((q.x0+q.x1)/2,q.y1-ch*.07),rc=[0,0,0,0];srect(t,X,Y,0,yaw,1,rc);
      const s=Math.min(.78*cw/(rc[2]-rc[0]),.86*ch/(rc[3]-rc[1]));srect(t,X,Y,0,yaw,s,rc);const dy=(q.y1-ch*.07)-rc[3];const Y2=Y-dy/K2;
      const gh=ghostOf(t);gh.position.set(X,Y2,0);gh.rotation.y=yaw;gh.scale.setScalar(s);gh.visible=!dOK(k);SHG.add(gh);const drc=srect(t,X,Y2,0,yaw,s,[0,0,0,0]);
      t.root.visible=false;SHG.add(t.root);q.k=k;return {k,q,t,g:gh,drc,X,Y:Y2,s,yaw,placed:false,a:'',at:0,from:null,rc:[0,0,0,0],gl:.34,hop:-1}});
    cells.forEach((q,i)=>{q.it=items[i];q.hov=0;q.dw=0;q.inside=false;q.fl=0});
    SH={g,cells,items,q:items.slice().sort(()=>Math.random()-.5),cur:null,st:'intro',t:0,sign:0,signP:intro?0:1,fails:0,idle:0,hint:0,sp,said:0,trail:[],end:0};
    applyQ();if(intro){sayLater('endreca',.35)}else SH.t=2.4}
  function shNext(){const it=SH.q.shift();if(!it){shDone();return}const [X,Y]=wp(SH.sp.x,SH.sp.y),rc=[0,0,0,0];srect(it.t,X,Y,0,it.yaw,1,rc);
    /* a la catifa: una mica més gran que a la casella però sense tapar la fila de baix de la lleixa */
    const sc=Math.min(1.15*it.s,118/(rc[3]-rc[1]),230/(rc[2]-rc[0]));
    SH.cur=it;it.sX=X;it.sY=Y;it.ss=sc;it.t.root.visible=true;it.t.root.position.set(X,Y,0);it.t.root.rotation.y=it.yaw;it.t.root.scale.setScalar(.001);it.a='in';it.at=0;
    SH.st='wait';SH.fails=0;SH.idle=0;SH.hint=0;SH.said=0;play('pop',.7);sayLater('n_'+it.k,.3)}
  function shDone(){SH.st='done';SH.end=0;SH.cur=null;play('jingle',.65);sayLater('fi',.7);for(const it of SH.items){it.a='spin';it.at=-Math.random()*.25;it.turns=1}}
  function shAct(q){if(!SH||SH.st!=='wait'||!SH.cur||SH.cur.a==='in')return;STATS.n++;$('#oN').textContent=STATS.n;const it=SH.cur;
    if(q===it.q){SH.st='fly';it.a='fly';it.at=0;SH.trail.length=0;play('fiu',.6);hush();return}
    SH.fails++;it.a='no';it.at=0;q.fl=1;play('nop',.75);if(q.it.placed){q.it.hop=0}
    SH.hint=Math.max(SH.hint,SH.fails>=2?2:1);if(SH.hint>=2&&SH.said<2){SH.said=2;sayLater('aqui',.5)}else if(!vSrc&&sayIn<0)sayLater('gairebe',.25)}
  function shPick(cx,cy){if(!SH||cx<-999)return null;const [wx,wy]=toWorld(cx,cy);for(const q of SH.cells)if(wx>q.x0-4&&wx<q.x1+4&&wy>q.y0-4&&wy<q.y1+4)return q;return null}
  function shOnCur(cx,cy){if(!SH||!SH.cur||cx<-999)return false;const [wx,wy]=toWorld(cx,cy),r=SH.cur.rc;return wx>r[0]-8&&wx<r[2]+8&&wy>r[1]-8&&wy<r[3]+8}
  function shTapCur(){if(!SH||!SH.cur||SH.st!=='wait')return;STATS.n++;SH.cur.hop=0;sayLater('n_'+SH.cur.k,.05)}
  let curIn=false,curDw=0;
  function shStep(dt){if(!SH){if(NLOAD===KEYS.length&&R)shNew(true);return}
    const free=!optsOpen&&view==='scene',hv=free?shPick(cmx,cmy):null,onC=free&&!hv&&shOnCur(cmx,cmy),ok=SH.st==='wait'&&SH.cur&&SH.cur.a!=='in';ringP=0;
    for(const q of SH.cells){const on=q===hv;
      /* hover: el forat correcte s'activa en entrar-hi; un d'equivocat només si s'hi queda .6 s (passar-hi per sobre no compta).
         Després d'una activació, el forat queda bloquejat fins que la mirada en surt */
      if(!on)q.lock=false;
      if(CFG.mode===0){if(on&&ok&&!q.lock){q.dw+=dt;if(q===SH.cur.q||q.dw>=.6){q.dw=0;q.lock=true;shAct(q)}}else q.dw=0}
      else if(CFG.mode===1){if(on&&ok&&!q.lock){q.dw+=dt;ringP=clamp(q.dw/CFG.dwell,0,1);if(q.dw>=CFG.dwell){q.dw=0;q.lock=true;shAct(q)}}else q.dw=0}
      q.inside=on;q.hov+=((on&&ok?1:0)-q.hov)*Math.min(1,dt*8);if(q.fl>0)q.fl=Math.max(0,q.fl-dt*1.6)}
    if(CFG.mode===0){if(onC&&!curIn)shTapCur()}else if(CFG.mode===1){if(onC&&ok){curDw+=dt;ringP=clamp(curDw/CFG.dwell,0,1);if(curDw>=CFG.dwell){curDw=-99;shTapCur()}}else curDw=0}curIn=onC;
    SH.t+=dt;
    if(SH.st==='intro'){SH.sign=Math.min(1,SH.sign+dt*2.5);if(SH.t>3.4){SH.signP=Math.min(1,SH.signP+dt*1.6);if(SH.signP>=1&&!vSrc)shNext()}}
    else SH.signP=Math.min(1,SH.signP+dt*1.6),SH.sign=1;
    if(SH.st==='wait'&&SH.cur&&SH.cur.a!=='in'){SH.idle+=dt;if(SH.idle>8&&SH.hint<1){SH.hint=1;sayLater('n_'+SH.cur.k,0)}if(SH.idle>14&&SH.hint<2){SH.hint=2;if(SH.said<2){SH.said=2;sayLater('aqui',0)}}}
    if(SH.st==='done'){SH.end+=dt;if(SH.end>5.2)shNew(false)}
    const now=performance.now()/1000;
    for(const it of SH.items){const r=it.t.root;let x=it.placed?it.X:it.sX,y=it.placed?it.Y:it.sY,s=it.placed?it.s:it.ss,yaw=it.yaw,sp=0,hy=0,sq=1;
      if(!r.visible&&it!==SH.cur)continue;it.at+=dt;const a=it.at;
      if(it.a==='in'){const f=Math.min(1,a/.45);s*=Math.max(.001,eBack(f));if(f>=1)it.a=''}
      else if(it.a==='no'){const f=a/.8;if(f>=1)it.a='';else{yaw+=Math.sin(f*Math.PI*6)*.38*(1-f);hy=Math.sin(f*Math.PI)*.04}}
      else if(it.a==='fly'){const f=Math.min(1,a/.75),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2;x=it.sX+(it.X-it.sX)*e;y=it.sY+(it.Y-it.sY)*e+Math.sin(Math.PI*e)*.35;s=it.ss+(it.s-it.ss)*e;
        if(a%.05<dt)SH.trail.push({x,y:y+.1,l:1});
        if(f>=1){it.placed=true;it.a='spin';it.at=0;it.turns=2;SH.cur=null;it.g.visible=false;play('t_'+it.k,.8);play('encert',.6,1,.1);sayLater('be',.5);SH.st='placed';SH.pt=0}}
      else if(it.a==='spin'){if(a>0){const T2=it.turns>1?1.3:1,f=Math.min(1,a/T2),e=f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;sp=e*TAU*it.turns;hy=Math.sin(Math.PI*f)*.08*(it.turns>1?1:.6);if(f>=1)it.a=''}}
      if(it.hop>=0){it.hop+=dt;const f=it.hop/.5;if(f>=1)it.hop=-1;else{hy=Math.max(hy,Math.sin(f*Math.PI)*.06);sq=1+.06*Math.sin(f*Math.PI*2)}}
      const br=1+Math.sin(now*1.4+it.t.ph)*.012;r.position.set(x,y+hy,0);r.rotation.y=yaw;r.scale.setScalar(s);it.t.spin.rotation.y=sp;it.t.spin.scale.set(br/Math.sqrt(sq),br*sq,br/Math.sqrt(sq));
      srect(it.t,x,y+hy,0,yaw,s,it.rc);
      /* silueta: més visible amb les pistes */
      const tg=!it.placed&&SH.cur===it&&SH.hint>0?(SH.hint>1?.62:.45)+.12*Math.sin(now*5):.34;it.gl+=(tg-it.gl)*Math.min(1,dt*6);
      if(it.g.visible)it.g.traverse(o=>{if(o.isMesh)o.material.opacity=it.gl})}
    if(SH.st==='placed'){SH.pt+=dt;if(SH.pt>1.7){if(SH.q.length)shNext();else shDone()}}
    if(SH.st==='wait'&&SH.hint>=2&&SH.cur&&SH.cur.a===''){if((SH.t*10|0)%2===0&&SH.trail.length<60){const it=SH.cur,f=Math.random();SH.trail.push({x:it.sX+(it.X-it.sX)*f,y:it.sY+(it.Y-it.sY)*f+Math.sin(Math.PI*f)*.35+.1,l:1})}}
    for(const p of SH.trail)p.l-=dt*1.4;SH.trail=SH.trail.filter(p=>p.l>0)}
  const toPx=(x,y)=>{pv.set(x,y,0).project(cam2);return [(pv.x+1)*W/2,(1-pv.y)*H/2]};
  function shRender(c){c.drawImage(shBg(SH?SH.g:CFG.size),0,0,W,H);
    if(!SH)return;const now=performance.now()/1000,cur=SH.cur;
    for(const it of SH.items){if(!dOK(it.k))continue;const im=DIMG[it.k],[x0,y0,x1,y1]=it.drc,ar=im.naturalWidth/im.naturalHeight;let w=x1-x0,h=w/ar;if(h>y1-y0){h=y1-y0;w=h*ar}
      const hint=!it.placed&&cur===it&&SH.hint>0,pul=hint?1+(SH.hint>1?.07:.045)*(.5+.5*Math.sin(now*5)):1;
      c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.85;c.translate((x0+x1)/2,y1-h/2);c.scale(pul,pul);c.drawImage(im,-w/2,-h/2,w,h);c.restore();
      if(hint){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(SH.hint>1?.22:.14)*(.5+.5*Math.sin(now*5));c.translate((x0+x1)/2,y1-h/2);c.scale(pul,pul);c.drawImage(im,-w/2,-h/2,w,h);c.restore()}}
    for(const q of SH.cells){const hint=cur&&!cur.placed&&q===cur.q&&SH.hint>0,a=Math.max(q.hov*.8,hint?(SH.hint>1?.75:.45)+.25*Math.sin(now*5):0);
      if(a>.01){c.save();c.lineWidth=6;c.strokeStyle=`rgba(255,214,90,${a})`;c.shadowColor=`rgba(255,220,120,${a})`;c.shadowBlur=18;c.beginPath();c.roundRect(q.x0+3,q.y0+3,q.x1-q.x0-6,q.y1-q.y0-6,10);c.stroke();c.restore()}
      if(q.fl>0){c.fillStyle=`rgba(120,130,150,${.22*q.fl})`;c.beginPath();c.roundRect(q.x0,q.y0,q.x1-q.x0,q.y1-q.y0,10);c.fill()}}
    for(const p of SH.trail){const [x,y]=toPx(p.x,p.y),r=6+8*p.l;c.save();c.globalAlpha=Math.min(1,p.l*1.2);c.fillStyle='#ffd84a';c.translate(x,y);c.rotate(now*2+p.x*9);c.beginPath();
      for(let i=0;i<10;i++){const rr=i%2?r*.45:r,an=i*Math.PI/5;c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}c.fill();c.restore()}
    /* cartell: gran al començament, després petit a baix a l'esquerra */
    const txt=T('ones.sign');c.font='900 50px Nunito, "Segoe UI", sans-serif';const tw=c.measureText(txt).width+90,s0=Math.min(1,1180/tw),s1=Math.min(.5,360/tw);
    const sg=SH.sign>=1?1:eBack(SH.sign),p=SH.signP,e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,x1=22+tw*s1/2,cx=W/2+(x1-W/2)*e,cy=330+(672-330)*e,sc=(s0+(s1-s0)*e)*Math.max(0,sg)*(SH.st==='done'?Math.max(0,1-SH.end*3):1);
    if(sc>.01){c.save();c.translate(cx,cy);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff9ef';c.shadowColor='rgba(60,35,10,.25)';c.shadowBlur=18;c.shadowOffsetY=6;c.beginPath();c.roundRect(-tw/2,-50,tw,100,26);c.fill();
      c.shadowColor='transparent';c.lineWidth=6;c.strokeStyle='#d9a066';c.stroke();c.fillStyle='#5a3a1a';c.fillText(txt,0,3);c.restore()}
    if(SH.st==='done'&&SH.end>.3&&SH.end<5){const t=SH.end,g=t<.75?eBack((t-.3)/.45):t>4.6?1-(t-4.6)/.4:1;c.save();c.translate(W/2,H-86);c.scale(Math.max(0,g),Math.max(0,g));
      c.font='900 60px Nunito, "Segoe UI", sans-serif';c.textAlign='center';c.textBaseline='middle';const txt=T('ones.done'),tw=c.measureText(txt).width+100;
      c.fillStyle='rgba(255,255,255,.96)';c.shadowColor='rgba(0,0,0,.2)';c.shadowBlur=20;c.shadowOffsetY=6;c.beginPath();c.roundRect(-tw/2,-56,tw,112,56);c.fill();c.shadowColor='transparent';c.fillStyle='#1f6f5c';c.fillText(txt,0,3);c.restore()}}
  function start(){init();on=true;for(const k of KEYS)if(!DIMG[k])DIMG[k]=img('ones/d/'+k+'.webp');for(const n in SHELF)if(!SHIMG[n])SHIMG[n]=img(SHELF[n].img);llA=MODE===2?0:1;preload();cvs.style.display='block';tray();shClear();if(NLOAD===KEYS.length)layout();okT=0;nOk=0;setMode(MODE)}
  function stop(){on=false;hush();shClear();if(cvs)cvs.style.display='none';for(const c in V)V[c].pause();curV=null;target=null}
  function slow(){for(const c in V)V[c].playbackRate=TS}
  return {get dbg(){return {overlaps,llA,rug:RUG,toys:toys.map(t=>({k:t.k,x:+t.x.toFixed(6),z:+t.z.toFixed(6),y:+t.y.toFixed(3),v:+spd(t).toFixed(3),rest:t.rest,cb:!!t.cb,rc:t.rc.map(Math.round),r:+t.r.toFixed(6),goal:t.goal,gx:+t.gx.toFixed(3),gz:+t.gz.toFixed(3),dyaw:+wrapA(t.hyaw-t.yaw).toFixed(3),wy:+t.wy.toFixed(3),cd:+t.cd.toFixed(2),vx:+t.vx.toFixed(3),vz:+t.vz.toFixed(3)}))}},preload,get speaking(){return !!vSrc},toggle:()=>setMode((MODE+1)%3),get mode(){return MODE},get shelf(){return SH},shAct,start,stop,step,render,layout,click,slow,get toys(){return toys},get target(){return target},activate,setMode};
})();
