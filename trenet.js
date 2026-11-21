/* =========================================================
   ESCENARI: EL TRENET DE LES SORPRESES (v2: els passatgers baixen a l'andana)
   Tren de fusta 3D (three.js, models fets amb Blender) i passatgers de feltre 2D amb clips (Seedance).
   «A l'estació»: el tren arriba i s'atura. Cada vagó tancat s'obre amb la mirada: es veu qui hi ha a dins,
     salta a l'andana de davant i saluda. Quan han baixat tots, festa a l'andana. Després la locomotora brilla:
     si la miren (o al cap de 8 s) el maquinista xiula, el tren marxa buit, els passatgers diuen adéu i se'n van
     a saltets. Tot seguit arriba un altre tren d'un altre color amb passatgers nous.
   «Tren en marxa»: el tren passa a poc a poc. Si en miren un vagó, frena, el passatger baixa i torna a arrencar.
     Mentre quedin passatgers a dins, el tren torna a passar. Quan han baixat tots, festa.
   Càmera fixa (cap zoom ni moviment de càmera). Sense veus ni so d'error.
   ========================================================= */
const TREN=(()=>{
  const TX={ca:["A l'estació",'Tren en marxa'],es:['En la estación','Tren en marcha'],eu:['Geltokian','Trena martxan'],
    gl:['Na estación','Tren en marcha'],en:['At the station','Moving train'],fr:['À la gare','Train en marche']};
  for(const l in TX)if(I18N[l]){I18N[l]['tren.st']=TX[l][0];I18N[l]['tren.mv']=TX[l][1]}
  const PASS=['elefant','girafa','panda','pingui','lleo','koala'],CLIPS=['surt','repos','balla'];
  /* passatger dins de cada tipus de vagó (unitats del model): alçada de la figura, part de sota amagada, x, y amagat i y fora */
  /* lloc del passatger dins del vehicle: vp i vm, dret al terra de dins i s'acosta a la porta (z0→z1) quan s'obre; vr, puja de la caixa (y0→y1) */
  const SEAT={vp:{h:1.75,cut:0,x:0,y0:1.52,y1:1.52,z0:-.3,z1:.3,door:1},vm:{h:1.6,cut:0,x:0,y0:1.52,y1:1.52,z0:-.3,z1:.3,door:1},vr:{h:2.6,cut:.3,x:0,y0:1.63,y1:3.18,z0:0,z1:0}};
  const HINGE=-112*Math.PI/180,ZSTEP=1.28+.45;   // porta amb frontissa oberta; on trepitja en sortir (davant del graó)
  const OPS={vp:'tr_portella',vm:'tr_portella',vr:'tr_caixa'};
  /* càmera ortogràfica fixa inclinada 20°, carrils a y=430 del món 1280×720 (franja de grava del fons); escala (px per unitat) segons el nombre de vagons.
     Amb 2 vagons la figura d'un passatger fa 135 px del món (~200 px en Full HD): mai més gran que el vídeo (224 px). */
  const NV=[2,3,5],SCALE={2:50,3:44,5:31},PITCH=20*Math.PI/180;
  /* fons (estació amb dues andanes): carrils a y=Y0; foot = peus dels passatgers de l'andana de davant, en unitats de pantalla per sota dels carrils.
     L'andana de davant (des de la fila «row» de la imatge, la ratlla groga) es torna a dibuixar en 3D just davant de la via: tapa la part de la via més propera. */
  const BG={img:'tren/fons.webp',y0:430,foot:2.4,andana:'tren/andana.webp',row:594,ih:941,zEdge:2.0},Y0=BG.y0,YP=.35;
  const GARL={img:'tren/garlanda.webp',w:700,ar:199/900,top:-10};   // dues garlandes de festa, a dalt de tot (px del món)
  /* alçada dels passatgers a l'andana (unitats): 149/149/118 px del món, mai més grans que el vídeo (224 px) en Full HD */
  const PH={2:2.98,3:3.38,5:3.8};
  const LOCO_FRONT=4.72,V_FIRST=-7.64,V_STEP=5.24,V_REAR=2.81,R_LOCO=.91,R_VAG=.667,CRANK=.16;
  const VW=1.7,VH=1.5,VF=.05;              // finestra dels clips: 1,7 × 1,5 alçades de la figura, peus a 0,05 de baix (clips/proc.py)
  /* maquinista dins la cabina (només es veu per la finestra lateral): x, peu, profunditat i alçada en unitats del model */
  const MAQ={x:-2.99,y:2.38,z:.95,h:1.62};
  const ARR=5,OPEN=.65,MOVE=100,FEST=4.6,WAIT=8,HELP=10,LEAPD=.5,HOP=.75,BRK=.9,ACC=1.1;
  const HUES=[0,4.2,2.45,5.2,3.3];   // gir de to dels colors vius de cada tren nou (el daurat, la fusta i les rodes no canvien)
  let R=null,S3,cam,cvs=null,on=false,ready=false,NL=0,lq=null,ENV=null,MODE=0;
  const PROTO={},TEX={},MAT={},PIMG={},VID={},HUE={value:0},chim=new THREE.Vector3(3,5.2,0),GC1=new THREE.Color(.15,.11,.03),GC2=new THREE.Color(.18,.13,.04);
  let hemi,sun,gTrain,gVia,gFum,gPas,shadowMat,blobTex,fumTex,MQT={},conf=null,occ=null,gGar=null,garOn=false,garP=0;
  let train=null,PL=[],st='',t0=0,now=0,X=0,Xa=0,Xb=0,nT=0,done=0,queue=[],fest=-1,idle=0,chA=0,lastCh=-9,brake=false,bear=0,glow=0,K=-1,lastLand=-9,waved=false;
  const fons=img(BG.img);

  function init(){if(R)return;
    /* ordinador sense targeta gràfica: es mira ABANS de crear el renderer, perquè l'antialiàsing només es tria en crear-lo
       (amb SwiftShader, l'antialiàsing duplicava el temps de cada fotograma: 48 ms en lloc de 24) */
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3t';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.NoToneMapping;
    /* ordinador sense targeta gràfica: mode ràpid de seguida (en alta qualitat cada fotograma costaria més de 200 ms) */
    try{const g=R.getContext(),e=g.getExtension('WEBGL_debug_renderer_info'),r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'';
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)&&!LOWQ){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    S3=new THREE.Scene();
    hemi=new THREE.HemisphereLight(0xfff8ee,0xb9c39a,1.25);sun=new THREE.DirectionalLight(0xfff0d8,2.3);sun.position.set(-5,9,8);S3.add(hemi,sun);
    gVia=new THREE.Group();gTrain=new THREE.Group();gFum=new THREE.Group();gPas=new THREE.Group();S3.add(gVia,gTrain,gFum,gPas);
    const TL=new THREE.TextureLoader(),tx=(p,flip)=>{const t=TL.load(U(p));t.colorSpace=THREE.SRGBColorSpace;t.flipY=flip!==false;return t};
    for(const k of ['loco','vp','vm','vr','via'])TEX[k]=tx('tren/tex_'+k+'.webp',false);
    for(const k of PASS){PIMG[k]=tx('tren/p_'+k+'.webp');
      VID[k]={};for(const c of CLIPS){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.loop=false;v.src=VSRC('tren/v/'+k+'_'+c+'.webm');
        const t=VTEX(v);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;VID[k][c]={v,t}}}
    MQT.n=tx('tren/maq.webp');MQT.x=tx('tren/maq_x.webp');
    /* andana de davant (tapa la via) i garlandes de la festa */
    occ=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tx(BG.andana)}));occ.rotation.x=-PITCH;S3.add(occ);
    {const gt=tx(GARL.img),gg=new THREE.PlaneGeometry(1,1).translate(0,-.5,0);gGar=new THREE.Group();gGar.visible=false;
      for(const f of [1,-1]){const m=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({map:gt,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));
        m.renderOrder=9;m.userData.f=f;gGar.add(m)}S3.add(gGar)}
    /* ombra suau sota cada vehicle i fum de cotó */
    {const c=document.createElement('canvas');c.width=160;c.height=80;const x=c.getContext('2d');
      for(let i=0;i<14;i++){const m=2+i*1.6,r=Math.max(4,22-i);x.fillStyle='rgba(22,20,38,.085)';x.beginPath();
        x.moveTo(m+r,m);x.arcTo(160-m,m,160-m,80-m,r);x.arcTo(160-m,80-m,m,80-m,r);x.arcTo(m,80-m,m,m,r);x.arcTo(m,m,160-m,m,r);x.closePath();x.fill()}
      shadowMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.85})}
    {const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);
      g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(250,246,238,.8)');g.addColorStop(1,'rgba(250,246,238,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
      fumTex=new THREE.CanvasTexture(c);fumTex.colorSpace=THREE.SRGBColorSpace}
    {const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,1,32,32,31);
      g.addColorStop(0,'rgba(30,26,40,.5)');g.addColorStop(.55,'rgba(30,26,40,.28)');g.addColorStop(1,'rgba(30,26,40,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
      blobTex=new THREE.CanvasTexture(c)}                          /* ombra rodona sota els passatgers de l'andana */
    const L=new GLTFLoader(),ks=['loco','vp','vm','vr','via'];
    for(const k of ks)L.load(U('tren/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;
      g.scene.traverse(o=>{if(o.isMesh){o.userData.atles=true;o.userData.gold=/daurat$/.test(o.material.name)}});
      g.scene.traverse(o=>{if(/_roda_|_biela_/.test(o.name))o.traverse(m=>{m.userData.nohue=true})});   /* rodes i bieles: sempre del seu color */
      if(k==='loco'){let best=-1;g.scene.traverse(o=>{if(o.isMesh&&/cos/.test(o.parent.name+o.name)){const p=o.geometry.attributes.position;
          for(let i=0;i<p.count;i++)if(p.getY(i)>best){best=p.getY(i);chim.set(p.getX(i),p.getY(i),0)}}});
        let sx=0,c=0;g.scene.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>best-.05){sx+=p.getX(i);c++}}});
        if(c)chim.x=sx/c}                                          /* centre de la boca de la xemeneia, per al fum */
      if(++NL===ks.length){ready=true;quality();if(on)layout()}},undefined,e=>console.error(e));
    resize()}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'})}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials: alta = MeshStandard amb reflexos d'entorn; ràpida = Lambert sense rodes ni bieles del costat de darrere ───── */
  function hueify(m){m.onBeforeCompile=sh=>{sh.uniforms.uHue=HUE;sh.fragmentShader='uniform float uHue;\n'+sh.fragmentShader.replace('#include <map_fragment>',
    `#include <map_fragment>
    if(uHue!=0.){vec3 c=diffuseColor.rgb,q=sqrt(max(c,0.));float mx=max(q.r,max(q.g,q.b)),mn=min(q.r,min(q.g,q.b)),k=smoothstep(.45,.65,mx>0.?(mx-mn)/mx:0.);
      const vec3 a=vec3(.57735),Y=vec3(.299,.587,.114);float cs=cos(uHue),sn=sin(uHue);vec3 r=max(q*cs+cross(a,q)*sn+a*dot(a,q)*(1.-cs),0.);
      float l0=dot(q,Y);r*=l0/max(dot(r,Y),1e-3);r=clamp(mix(vec3(l0),r,.82),0.,1.);diffuseColor.rgb=mix(c,r*r,k);}`)};     /* gir en espai gamma, mateixa claror, una mica més suau */
    m.customProgramCacheKey=()=>'tren-hue';return m}
  function quality(){if(!R||!ready)return;lq=LOWQ;
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    S3.environment=LOWQ?null:ENV;hemi.intensity=LOWQ?2.1:.75;sun.intensity=LOWQ?1.9:2.0;
    for(const k in MAT){MAT[k].p.dispose();MAT[k].d.dispose();MAT[k].w.dispose()}
    for(const k of ['loco','vp','vm','vr','via']){const t=TEX[k],an=LOWQ?1:4;if(t.anisotropy!==an){t.anisotropy=an;if(t.image)t.needsUpdate=true}
      MAT[k]=LOWQ?{p:new THREE.MeshLambertMaterial({map:t}),d:new THREE.MeshLambertMaterial({map:t,emissive:0x2a1c05})}
        :{p:new THREE.MeshStandardMaterial({map:t,roughness:.62,metalness:0,envMapIntensity:.55}),d:new THREE.MeshStandardMaterial({map:t,roughness:.32,metalness:.45,envMapIntensity:1.1})};
      MAT[k].w=MAT[k].p.clone();if(k!=='via')hueify(MAT[k].p)}
    MAT.loco.base=MAT.loco.p.emissive.clone();MAT.loco.based=MAT.loco.d.emissive.clone();
    gVia.traverse(o=>paint(o,'via'));if(train)for(const v of train){v.g.traverse(o=>paint(o,v.k));for(const o of v.far)o.visible=!LOWQ}}
  function paint(o,k){if(o.isMesh&&o.userData.atles)o.material=o.userData.gold?MAT[k].d:o.userData.nohue?MAT[k].w:MAT[k].p}

  /* ───── càmera i via ───── */
  const nv=()=>NV[CFG.size]||3,sc=()=>SCALE[nv()];
  function setCam(){const s=sc(),hw=W/2/s,hh=H/2/s;cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,1,400);
    const up=new THREE.Vector3(0,Math.cos(PITCH),-Math.sin(PITCH)),T=up.multiplyScalar((Y0-H/2)/s);
    cam.position.copy(T).add(new THREE.Vector3(0,Math.sin(PITCH),Math.cos(PITCH)).multiplyScalar(120));cam.lookAt(T);cam.updateMatrixWorld();
    /* punt del món amb coordenades de pantalla (sx, sy en px del món) a la profunditat d (cap a la càmera) */
    const UP=new THREE.Vector3(0,Math.cos(PITCH),-Math.sin(PITCH)),FW=new THREE.Vector3(0,Math.sin(PITCH),Math.cos(PITCH));
    const scr=(sx,sy,d)=>new THREE.Vector3((sx-W/2)/s,0,0).addScaledVector(UP,(Y0-sy)/s).addScaledVector(FW,d);
    {const yA=-2+BG.row*(H+4)/BG.ih,aT=(Y0-yA)/s,d=(BG.zEdge+aT*Math.sin(PITCH))/Math.cos(PITCH);
      occ.position.copy(scr(W/2,(yA+H+2)/2,d));occ.scale.set((W+4)/s,(H+2-yA)/s,1)}
    {const gw=GARL.w,gh=gw*GARL.ar;gGar.userData={s,scr,gw,gh};gGar.children.forEach((m,i)=>{m.scale.set(m.userData.f*gw/s,gh/s,1)})}
    gVia.clear();const n=Math.ceil(hw/8)+1;
    for(let k=-n;k<=n;k++){const g=PROTO.via.clone(true);g.position.x=k*8;g.scale.x=8/7.955;g.traverse(o=>paint(o,'via'));gVia.add(g)}}
  /* punt del món (unitats) → píxels del món 1280×720 */
  const toPx=(x,y,z=0)=>[W/2+x*sc(),Y0-(y*Math.cos(PITCH)-z*Math.sin(PITCH))*sc()];

  /* ───── vehicles ───── */
  function mkVehicle(k,pass){const g=PROTO[k].clone(true);g.traverse(o=>paint(o,k));
    const v={k,g,wheels:[],rods:[],far:[],open:0,target:0,len:k==='loco'?10:5.3,cx:k==='loco'?-.27:0,R:k==='loco'?R_LOCO:R_VAG,
      dw:0,hov:0,inside:false,help:0,react:0,ph:Math.random()*TAU,was:false};
    g.traverse(o=>{const n=o.name;if(!/^b_/.test(n))return;
      if(/_roda_/.test(n)){o.rotation.order='YXZ';const d=/_roda_D/.test(n);v.wheels.push({o,d});if(d)v.far.push(o)}
      else if(/_biela_/.test(n)){const d=/_D$/.test(n);v.rods.push({o,d});if(d)v.far.push(o)}
      else if(/portella/.test(n))v.hinge=o;else if(/tapa/.test(n))v.lid=o});
    for(const o of v.far)o.visible=!LOWQ;
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(v.len+1.0,4.7),shadowMat);sh.rotation.x=-Math.PI/2;sh.position.set(v.cx,.012,0);sh.renderOrder=1;g.add(sh);v.sh=sh;
    if(pass){const s=SEAT[k],vh=s.h*(VH-VF-s.cut),ge=new THREE.PlaneGeometry(s.h*VW,vh).translate(0,vh/2,0),uv=ge.attributes.uv,vb=(VF+s.cut)/VH;
      for(let i=0;i<uv.count;i++)uv.setY(i,vb+uv.getY(i)*(1-vb));
      v.pm=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({map:PIMG[pass],transparent:true,alphaTest:.05}));v.pm.renderOrder=2;
      v.p=new THREE.Group();v.p.add(v.pm);v.p.position.set(s.x,s.y0,s.z0);v.p.visible=false;g.add(v.p);v.pass=pass}
    if(k==='loco'){const m=new THREE.Mesh(new THREE.PlaneGeometry(MAQ.h*242/300,MAQ.h).translate(0,MAQ.h/2,0),new THREE.MeshBasicMaterial({map:MQT.n,transparent:true,alphaTest:.05}));
      m.position.set(MAQ.x,MAQ.y,MAQ.z);g.add(m);v.maq=m}
    return v}
  function freeTrain(){if(!train)return;for(const v of train){gTrain.remove(v.g);v.sh.geometry.dispose();
      if(v.pm){v.pm.geometry.dispose();v.pm.material.dispose()}if(v.maq){v.maq.geometry.dispose();v.maq.material.dispose()}}train=null}

  /* ───── passatgers: dins del vagó es veuen per la porta (pla retallat del vagó, imatge fixa); quan salten
     passen a ser un pla sencer de cara a la càmera, a l'andana de davant, amb els seus clips ───── */
  const BLOB=new THREE.PlaneGeometry(1,1),PGEO=new THREE.PlaneGeometry(VW,VH).translate(0,VH/2-VF,0);   // peus a y=0
  const zp=()=>(BG.foot+YP*Math.cos(PITCH))/Math.sin(PITCH);                                             // profunditat de l'andana
  function mkPass(pass,i){const pm=new THREE.Mesh(PGEO,new THREE.MeshBasicMaterial({map:PIMG[pass],transparent:true,alphaTest:.05}));pm.renderOrder=2;
    const g=new THREE.Group();g.add(pm);g.rotation.x=-PITCH;g.visible=false;                                 // de cara a la càmera: cap escorç
    const sh=new THREE.Mesh(BLOB,new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.renderOrder=1;sh.visible=false;
    gPas.add(sh,g);return {pass,i,g,pm,sh,state:'in',x:0,y:0,z:0,h:1,t:0,sq:0,hov:0,dw:0,react:0,inside:false,dly:0,dir:1,lt:-9}}
  function freePass(){for(const P of PL){stopClips(P);gPas.remove(P.g,P.sh);P.pm.material.dispose();P.sh.material.dispose()}PL=[]}
  /* lloc lliure a l'andana, tan a prop com es pugui del vagó i dins de la pantalla */
  function landX(P,x){const hw=W/2/sc(),m=1.5,D=PH[nv()]*.9,others=PL.filter(q=>q!==P&&(q.state==='plat'||q.state==='salt')).map(q=>q.x1);
    const ok=x=>Math.abs(x)<=hw-m&&others.every(o=>Math.abs(o-x)>=D);x=clamp(x,-hw+m,hw-m);
    for(let k=0;k<200;k++){for(const sg of [1,-1]){const c=x+sg*k*.2;if(ok(c))return c}}return x}
  function leap(P){const v=train[P.i],s=SEAT[v.k];P.state='salt';P.t=0;P.lt=now;v.p.visible=false;
    P.x0=v.g.position.x+s.x;P.y0=v.p.position.y-s.cut*s.h;P.z0=v.p.position.z;P.h0=s.h;P.zs=s.door?ZSTEP:null;P.dur=s.door?HOP+.25:HOP;P.arc=s.door?1.2:2.6;   /* per la porta, saltet baix; de la caixa, salt alt */
    P.x1=landX(P,vx(P.i)+v.cx);P.y1=YP;P.z1=zp()+.02*PL.indexOf(P);P.h1=PH[nv()];
    P.x=P.x0;P.y=P.y0;P.z=P.z0;P.h=P.h0;setMap(P.pm.material,PIMG[P.pass]);P.shown=null;P.g.visible=P.sh.visible=true;play('tr_salt',.6)}
  function land(P){P.state='plat';P.sq=1;lastLand=now;play('tr_aterra',.6);P.clip=true;playClip(P,'surt');
    if(fest>=0)P.dance=true;
    if(PL.every(q=>q.state==='plat')){done++;fest=0;garOn=true;play('tr_festa',.8);confStart();dance()}}                    /* han baixat tots: festa */
  function stepPass(a){const hw=W/2/sc();
    for(const P of PL){if(P.state==='in'||P.state==='fora')continue;let sy=1;
      if(P.state==='salt'){P.t+=a/P.dur;const u=Math.min(1,P.t),us=P.zs!=null?.3:0;
        if(u<us){const w=u/us;P.x=P.x0;P.z=lerp(P.z0,P.zs,w);P.y=P.y0+.3*4*w*(1-w);P.h=P.h0}      /* surt per la porta fins al graó */
        else{const w=(u-us)/(1-us),z0=P.zs!=null?P.zs:P.z0;
          P.x=lerp(P.x0,P.x1,w);P.z=lerp(z0,P.z1,w);P.y=lerp(P.y0,P.y1,w)+4*P.arc*w*(1-w);P.h=lerp(P.h0,P.h1,Math.min(1,w*1.6))}
        if(u>=1)land(P)}
      else if(P.state==='plat'){P.y=YP;if(P.sq>0){P.sq=Math.max(0,P.sq-a/.32);sy=1-.11*Math.sin(Math.PI*(1-P.sq))}}
      else if(P.state==='adeu'){if(P.dly>0){P.dly-=a;continue}
        if(!P.hop){P.hop=1;stopClips(P)}P.t+=a/.38;const u=P.t%1;P.x+=P.dir*(1.3/.38)*a;P.y=YP+.55*4*u*(1-u);
        if(Math.abs(P.x)>hw+2.2){P.state='fora';P.g.visible=P.sh.visible=false;continue}}
      const hs=1+.04*P.hov;P.g.position.set(P.x,P.y,P.z);P.g.scale.set(P.h*hs,P.h*hs*sy,P.h);
      const k=1-.4*clamp((P.y-YP)/1.6,0,1);P.sh.visible=P.z>2;P.sh.position.set(P.x,YP+.004,P.z+.05);P.sh.scale.set(P.h*.62*k,P.h*.24*k,1);P.sh.material.opacity=.75*k}}
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  /* tren nou: passatgers de la cua (surten tots abans de repetir), vagons barrejats, un altre color */
  function newTrain(){if(!ready)return;freeTrain();const n=nv();
    if(queue.length<n)queue=queue.concat(shuffle(PASS.filter(k=>!queue.includes(k))));
    const ps=shuffle(queue.splice(0,n));let ts=[];while(ts.length<n){const q=shuffle(['vp','vm','vr']);if(ts.length&&q[0]===ts[ts.length-1])q.push(q.shift());ts=ts.concat(q)}
    train=[mkVehicle('loco')];for(let i=0;i<n;i++)train.push(mkVehicle(ts[i],ps[i]));for(const v of train)gTrain.add(v.g);
    HUE.value=HUES[nT%HUES.length];nT++;
    const s=sc(),hw=W/2/s,L=LOCO_FRONT-V_FIRST+V_STEP*(n-1)+V_REAR;Xb=L/2-LOCO_FRONT;Xa=-hw-LOCO_FRONT-.6;
    freePass();PL=[];train.forEach((v,i)=>{if(v.pass){const P=mkPass(v.pass,i);v.P=P;PL.push(P)}});
    fest=-1;garOn=false;garP=0;idle=0;brake=false;bear=0;glow=0;K=-1;waved=false;enter()}
  /* entrada del tren (també quan torna a passar en marxa: els passatgers que ja són a l'andana s'hi queden) */
  function enter(){X=Xa;st=MODE===0?'arriba':'pas';t0=now;K=-1;chA=Math.floor(X/(TAU*R_LOCO/4));
    for(const v of train){v.open=v.target=0;v.dw=0;v.help=0;v.react=0;v.lw=0;v.rev=false;pose(v)}place()}
  const vx=i=>i===0?X:X+V_FIRST-V_STEP*(i-1);
  function place(){train.forEach((v,i)=>{const x=vx(i);v.g.position.x=x;const a=x/v.R;
    for(const w of v.wheels)w.o.rotation.set(0,w.d?Math.PI:0,w.d?a:-a);
    for(const r of v.rods){const f=-a+(r.d?Math.PI/2:0);r.o.position.x=CRANK*Math.cos(f);r.o.position.y=CRANK*Math.sin(f)}})}
  function pose(v){const e=eOut(v.open);
    if(v.hinge)v.hinge.rotation.y=HINGE*e;if(v.lid)v.lid.rotation.x=-105*Math.PI/180*e;
    if(v.p){const s=SEAT[v.k],u=clamp((v.open-(v.k==='vr'?.45:.2))/(v.k==='vr'?.55:.8),0,1),inn=v.P&&v.P.state==='in';
      v.p.visible=inn&&v.open>.02;const w=u<=0?0:eBack(u);v.p.position.y=lerp(s.y0,s.y1,w);v.p.position.z=lerp(s.z0,s.z1,Math.min(1,w));
      if(inn&&v.target&&u>0&&!v.rev){v.rev=true;play('tr_'+v.pass,.8,1,.25/vrate())}}}
  const lerp=(a,b,t)=>a+(b-a)*t;

  /* ───── clips dels passatgers: «surt» en obrir-se, «repòs» de tant en tant, «balla» a la festa.
     Entre clip i clip queda l'últim fotograma (tots comencen i acaben en la mateixa postura). ───── */
  /* canviar entre imatge i vídeo demana recompilar el material: three.js descodifica l'sRGB dels vídeos a l'ombrejador */
  function setMap(m,t){if(m.map===t)return;const a=!!(m.map&&m.map.isVideoTexture);m.map=t;if(a!==!!(t&&t.isVideoTexture))m.needsUpdate=true}
  function vrate(){const sp=CFG.speed;return clamp(sp>0?Math.max(.4,sp):1,.25,4)*(TS<1?TS:1)}
  function playClip(v,c){const o=VID[v.pass][c];if(v.cur&&v.cur!==o)v.cur.v.pause();v.cur=o;v.cname=c;v.wait=0;
    try{o.v.currentTime=0;o.v.playbackRate=vrate();const p=o.v.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
  function stopClips(v){for(const c of CLIPS)VID[v.pass][c].v.pause();v.cur=null;v.cname=null;v.dance=false;v.clip=false}
  function clips(){for(const v of PL){if(!v.cur)continue;const d=v.cur.v;
    if(v.shown!==v.cur&&d.readyState>=2&&d.currentTime>.02){v.shown=v.cur;setMap(v.pm.material,v.cur.t)}
    if(!v.clip)continue;
    if(!d.paused&&!d.ended){if(Math.abs(d.playbackRate-vrate())>.01)d.playbackRate=vrate();continue}
    if(v.dance){v.dance=false;playClip(v,'balla')}
    else if(!v.wait)v.wait=now+(v.cname==='repos'?1.4+Math.random()*2.6:.4+Math.random()*.6);
    else if(now>=v.wait)playClip(v,'repos')}}
  function dance(){for(const P of PL)if(P.state==='plat'&&P.clip){if(P.cname==='surt'&&P.cur&&!P.cur.v.ended)P.dance=true;else playClip(P,'balla')}}

  /* ───── fum, so de les rodes i confeti ───── */
  const puffs=[];
  function puff(k=1){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:fumTex,transparent:true,depthWrite:false}));
    m.position.set(X+chim.x,chim.y+.15,0);m.userData={t:0,vx:-.5-Math.random()*.4,k};m.renderOrder=3;gFum.add(m);puffs.push(m)}
  function fum(a){for(let i=puffs.length-1;i>=0;i--){const m=puffs[i],d=m.userData;d.t+=a;const u=d.t/1.5;
      if(u>=1){gFum.remove(m);m.material.dispose();puffs.splice(i,1);continue}
      m.position.x+=d.vx*a;m.position.y+=(1.9-1.1*u)*a;const s=(.55+1.25*u)*d.k;m.scale.set(s,s,1);m.material.opacity=.9*(1-u*u)}}
  function clearFum(){for(const m of puffs){gFum.remove(m);m.material.dispose()}puffs.length=0}
  /* quatre «txufs» per volta de roda, com una màquina de vapor; si va molt de pressa se'n salten */
  function chuff(g){const c=Math.floor(X/(TAU*R_LOCO/4));if(c!==chA){chA=c;if(now-lastCh>.15){lastCh=now;play('tr_txuf'+(1+Math.floor(Math.random()*3)),g,.94+Math.random()*.12);puff()}}}
  function mkConf(){const N=90,g=new THREE.BufferGeometry(),p=new Float32Array(N*3),c=new Float32Array(N*3),C=[0xff5a5f,0xffc93c,0x3ec1d3,0x7ac74f,0xb084f5,0xff8fb1];
    for(let i=0;i<N;i++){const k=new THREE.Color(C[i%C.length]);c.set([k.r,k.g,k.b],i*3)}
    g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
    conf=new THREE.Points(g,new THREE.PointsMaterial({size:9,sizeAttenuation:false,vertexColors:true,transparent:true}));conf.renderOrder=4;conf.frustumCulled=false;conf.visible=false;
    conf.userData.v=new Float32Array(N*3);S3.add(conf)}
  function confStart(){if(!conf)mkConf();const s=sc(),hw=W/2/s,p=conf.geometry.attributes.position.array,v=conf.userData.v;
    for(let i=0;i<p.length/3;i++){p[i*3]=(Math.random()*2-1)*hw*.95;p[i*3+1]=9+Math.random()*6;p[i*3+2]=zp()+1+Math.random()*2;v[i*3]=(Math.random()-.5)*1.2;v[i*3+1]=-(2.2+Math.random()*1.6);v[i*3+2]=Math.random()*TAU}
    conf.geometry.attributes.position.needsUpdate=true;conf.visible=true;conf.material.opacity=1}
  function confStep(a){if(!conf||!conf.visible)return;const p=conf.geometry.attributes.position.array,v=conf.userData.v;
    for(let i=0;i<p.length/3;i++){v[i*3+2]+=a*3;p[i*3]+=(v[i*3]+Math.sin(v[i*3+2])*.8)*a;p[i*3+1]+=v[i*3+1]*a}
    conf.geometry.attributes.position.needsUpdate=true;if(fest>FEST-1)conf.material.opacity=Math.max(0,FEST-fest);if(fest<0||fest>=FEST)conf.visible=false}

  /* ───── joc ───── */
  const allClosed=()=>train.every(v=>v.open<.01),inside=()=>PL.some(P=>P.state==='in');
  function onScreen(i){const x=(vx(i)+train[i].cx)*sc();return Math.abs(x)<W/2-train[i].len*sc()*.25}
  /* dianes: 0 = locomotora, 1..n = vagons, 100+j = passatgers de l'andana */
  function isReady(id){
    if(id>=100){const P=PL[id-100];return !!P&&P.state==='plat'&&fest<0&&P.react<=0&&!(P.cname==='surt'&&P.cur&&!P.cur.v.ended)}
    const v=train[id];if(v.react>0)return false;
    if(id===0)return MODE===0?(st==='parat'||st==='llest'):st==='pas';
    if(!onScreen(id)||fest>=0||v.target||!v.P||v.P.state!=='in')return false;
    return MODE===0?st==='parat':st==='pas'}
  const tgt=id=>id>=100?PL[id-100]:train[id];
  function hit(wx,wy){if(!train)return null;const s=sc();let best=null;
    PL.forEach((P,j)=>{if(P.state!=='plat')return;const [cx,fy]=toPx(P.x,P.y,P.z),hh=P.h*s;
      if(Math.abs(wx-cx)<.34*hh&&wy>fy-.97*hh&&wy<fy+.1*hh)best=100+j});              /* els passatgers són davant del tren */
    if(best!=null)return best;
    for(let i=0;i<train.length;i++){const v=train[i],[cx]=toPx(vx(i)+v.cx,0),top=i===0?5.5:v.target?(v.k==='vr'?5.4:4.7):3.9;
      if(Math.abs(wx-cx)<v.len/2*s&&wy>Y0-top*s&&wy<Y0+.7*s)best=i}
    return best}
  function activate(id){if(!train||!isReady(id))return;STATS.n++;$('#oN').textContent=STATS.n;idle=0;
    if(id>=100){const P=PL[id-100];P.react=1.2;playClip(P,'surt');play('tr_'+P.pass,.8,1,.25/vrate());return}
    const v=train[id];
    if(id===0){if(st==='llest')whistle();else{v.react=1;bear=.7;puff(1.2);const s=play('tr_xiulet',.55);if(s)try{s.stop(AC.currentTime+.42)}catch(_){}}return}
    if(MODE===0){v.target=1;v.react=OPEN;play(OPS[v.k],.75)}
    else{K=id;v.react=9;st='frena';t0=now;play('tr_fre',.5)}}                  /* en marxa: primer frena, després s'obre */
  function whistle(){const v=train[0];v.react=2.2;bear=1.5;play('tr_xiulet',.8);puff(1.5);puff(1.1);
    if(MODE===0){st='xiulet';t0=now}}
  function goodbye(){garOn=false;PL.forEach((P,j)=>{if(P.state!=='plat')return;P.state='adeu';P.t=0;P.hop=0;P.dir=P.x<0?-1:1;P.dly=.12*j+Math.random()*.2});st='adeu';t0=now}
  function step(dt){if(!R||!ready||!train)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,a=dt*(sp>0?Math.max(.4,sp):1),free=!optsOpen&&view==='scene',s=sc(),vB=MOVE/s;now+=a;
    /* mirada, permanència o pas del cursor */
    const [wx,wy]=toWorld(cmx,cmy),hv=free?hit(wx,wy):null;ringP=0;
    const ids=train.map((_,i)=>i).concat(PL.map((_,j)=>100+j));
    for(const id of ids){const v=tgt(id),onV=hv===id,rd=isReady(id);
      if(CFG.mode===0){if(onV&&!v.inside&&rd)activate(id)}
      else if(CFG.mode===1){if(onV&&rd){v.dw+=dt;ringP=clamp(v.dw/CFG.dwell,0,1);if(v.dw>=CFG.dwell){v.dw=0;activate(id)}}else v.dw=0}
      v.inside=onV;v.hov+=((onV&&rd?1:0)-v.hov)*Math.min(1,dt*8);if(v.react>0)v.react=Math.max(0,v.react-a);if(v.help>0)v.help=Math.max(0,v.help-a)}
    if(fest>=0){fest+=a;if(fest>=FEST)fest=-1}
    if(bear>0)bear=Math.max(0,bear-a);
    /* el passatger salta a l'andana una mica després que s'obri la porta */
    train.forEach(v=>{if(v.P&&v.P.state==='in'&&v.target&&v.open>=1){v.lw=(v.lw||0)+a;if(v.lw>LEAPD)leap(v.P)}});
    const out=()=>vx(train.length-1)-V_REAR>W/2/s+.5;
    /* màquina d'estats del tren */
    if(st==='arriba'){const u=clamp((now-t0)/ARR,0,1);X=lerp(Xa,Xb,eOut(u));chuff(.42*(1-.5*u));
      if(u>.5&&!brake){brake=true;play('tr_fre',.55)}if(u>=1){st='parat';t0=now;play('tr_campana',.55)}}
    else if(st==='parat'){if(train.some((v,i)=>i&&!v.target&&v.P&&v.P.state==='in')){idle+=a;if(idle>HELP){idle=HELP-7;help()}}
      else if(fest<0&&PL.every(P=>P.state==='plat')&&now-lastLand>.6){st='llest';t0=now}}
    else if(st==='llest'){if(now-t0>WAIT)whistle()}
    else if(st==='xiulet'){if(now-t0>1.1){for(const v of train)v.target=0;st='tanca';t0=now;play('tr_tanca',.4)}}
    else if(st==='tanca'){if(allClosed()&&now-t0>.4){st='marxa';t0=now}}
    else if(st==='marxa'){const t=now-t0;X=Xb+1.6*t*t;chuff(.42);
      if(!waved&&t>.3){waved=true;for(const P of PL)if(P.state==='plat'){P.react=2;playClip(P,'surt')}}         /* adéu, tren! */
      if(out()){st='buit';t0=now}}
    else if(st==='pas'){X+=vB*a;chuff(.3);
      if(train.some((v,i)=>i&&!v.target&&v.P&&v.P.state==='in'&&onScreen(i))){idle+=a;if(idle>HELP){idle=HELP-7;help()}}
      if(out()){if(inside())enter();else{st='buit';t0=now}}}                /* queden passatgers a dins: el tren torna a passar */
    else if(st==='frena'){const u=(now-t0)/BRK;X+=vB*Math.max(0,1-u)*a;chuff(.3*(1-u));
      if(u>=1){const v=train[K];v.target=1;v.react=9;st='obre';t0=now;play(OPS[v.k],.75)}}
    else if(st==='obre'){const v=train[K];
      if(v.target&&v.P.state!=='in'&&now-v.P.lt>.55){v.target=0;play('tr_tanca',.35)}
      if(!v.target&&v.open<.01){v.react=0;st='arrenca';t0=now;if(!inside()){bear=1.5;play('tr_xiulet',.7);puff(1.4)}}}
    else if(st==='arrenca'){const u=(now-t0)/ACC;X+=vB*Math.min(1,u)*a;chuff(.3);if(u>=1)st='pas';if(out()){st='buit';t0=now}}
    else if(st==='buit'){if(now-t0>.5&&fest<0)goodbye()}
    else if(st==='adeu'){if(PL.every(P=>P.state==='fora'||P.state==='in')&&now-t0>.3)newTrain()}
    if(st!=='buit'&&st!=='adeu')place();
    /* el tren de l'estació es va obrint; la locomotora brilla quan ja es pot fer marxar */
    glow+=((st==='llest'?1:0)-glow)*Math.min(1,a*3);
    const gl=glow*(.55+.45*Math.sin(now*4.2)),L=MAT.loco;L.p.emissive.copy(L.base).lerp(GC1,gl);L.d.emissive.copy(L.based).lerp(GC2,gl);
    train.forEach((v,i)=>{if(v.open!==v.target){const d=a/OPEN;v.open=v.open<v.target?Math.min(v.target,v.open+d):Math.max(v.target,v.open-d);pose(v)}
      /* vagons tancats a l'estació: es gronxen una mica; l'ajuda els fa trontollar més */
      let rz=0,sy=1;if(i>0&&!v.target&&st==='parat'&&v.P&&v.P.state==='in')rz=.018*Math.sin(now*2.4+v.ph);
      if(v.help>0){const u=1-v.help/1.4;rz+=.07*Math.sin(u*TAU*5)*(1-u)}
      if(i===0&&st==='xiulet'){const u=clamp((now-t0)/.9,0,1),b=Math.sin(u*Math.PI*3)*(1-u)*.035;sy=1+b}
      const hs=1+.03*v.hov+(i===0?.025*glow*Math.sin(now*4.2):0);v.g.rotation.z=rz;v.g.scale.set(hs,hs*sy,hs);
      if(v.maq){v.maq.material.map=bear>0?MQT.x:MQT.n;v.maq.position.y=MAQ.y+.025*Math.sin(now*2.1);v.maq.rotation.z=.04*Math.sin(now*.9)}});
    stepPass(a);clips();fum(a);confStep(a);garland(a)}
  /* garlanda: baixa quan comença la festa i puja quan els passatgers se'n van */
  function garland(a){garP=garOn?Math.min(1,garP+a/.9):Math.max(0,garP-a/.6);gGar.visible=garP>0;if(!garP)return;
    const {scr,gw,gh}=gGar.userData,e=garOn?eBack(garP):garP,top=GARL.top-(1-e)*(gh+30);
    gGar.children.forEach((m,i)=>{const cx=i?W-gw/2+30:gw/2-30;m.position.copy(scr(cx,top,30));m.rotation.set(-PITCH,0,.02*Math.sin(now*1.6+i*1.9))})}
  /* ajuda: el vagó tancat més a prop del centre trontolla i fa toc-toc */
  function help(){let b=-1,bd=1e9;train.forEach((v,i)=>{if(!i||v.target||!onScreen(i)||!v.P||v.P.state!=='in')return;const d=Math.abs(vx(i)+v.cx);if(d<bd){bd=d;b=i}});
    if(b>0){train[b].help=1.4;play('tr_toc',.75)}}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    if(!R||!ready||!train)return;occ.visible=!CFG.simple;R.render(S3,cam)}
  function click(cx,cy){const [wx,wy]=toWorld(cx,cy),i=hit(wx,wy);if(i!=null)activate(i)}
  function layout(){if(!ready)return;setCam();newTrain()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newTrain()}
  function tray(){const t=$('#tray');t.innerHTML='';['tren.st','tren.mv'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;for(const P of PL)stopClips(P);clearFum();if(conf)conf.visible=false;fest=-1;garOn=false;garP=0;if(cvs)cvs.style.display='none'}
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,slow(){},preload(){},
    get ready(){return ready},get st(){return st},get train(){return train},get pas(){return PL},get mode(){return MODE},get fest(){return fest},get done(){return done},get nT(){return nT},
    get X(){return X},hit,activate,toPx:(x,y,z)=>toPx(x,y,z),vx,get VID(){return VID},get R(){return R},get hue(){return HUE.value},set hue(v){HUE.value=v}};
})();
