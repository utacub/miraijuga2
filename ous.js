/* =========================================================
   ESCENARI: OUS DE DINOSAURE (ous 3D three.js fets amb Blender + cries 2D)
   Cada ou s'obre amb 2 o 3 activacions; la closca esclata, la base es parteix
   i la cria queda al seu niu. Els ous nous no surten fins que tots s'han obert.
   ========================================================= */
const OUS=(()=>{
  /* mode 2 «Segueix l'ou!» (19-11-2026): joc dels trilers. Ous iguals en fila; la cria crida des d'un ou que es belluga,
     els ous es barregen (2/3/5 intercanvis) i, quan són quiets, l'infant mira l'ou de la cria. Error: l'ou diu que no i
     la cria crida des del bo (sense so d'error). Ajuda: 6 s el bo es belluga, 12 s crida i «Mira aquí!». Tecla P: canvia de mode. */
  const MTX={"ca": ["Obre els ous", "Segueix l'ou!"], "es": ["Abre los huevos", "¡Sigue el huevo!"], "eu": ["Ireki arrautzak", "Jarraitu arrautzari!"], "gl": ["Abre os ovos", "Segue o ovo!"], "en": ["Open the eggs", "Follow the egg!"], "fr": ["Ouvre les œufs", "Suis l'œuf !"]};
  for(const l in MTX)if(I18N[l]){I18N[l]['ous.m1']=MTX[l][0];I18N[l]['ous.m2']=MTX[l][1]}
  const N2=[2,3,4],SW2=[2,3,5],HB2=[205,185,165],GAP2=[360,290,225],Y2=598,SWD=[1.35,1.1,.9],SWDY=62;
  let MODE=0,G=null;
  const KINDS=['triceratops','diplodocus','estegosaure','tiranosaure','pterodactil','anquilosaure'];
  const CAR={triceratops:.8452,diplodocus:.6738,estegosaure:.8667,tiranosaure:.681,pterodactil:.6714,anquilosaure:.931};
  /* disposició (món 1280×720): els ous es reparteixen a l'atzar pel prat. Com més amunt (més lluny), més petits;
     el que és més avall queda per davant. HB = alçada de l'ou a primer pla segons la mida triada.
     La cria fa CU = 0,7 de l'ou (0,78 un cop al niu): amb HB ≤ 220 no supera mai els ~260 px del vídeo en una pantalla Full HD. */
  const HB=[220,185,152],YF=[405,650],PERS=.66;
  const NUM=[2,4,6],NEED=[2,3,3];
  const WOB=.5,BURST=.8,SPLIT=2.4,FALL=.9,FEST=8,OUT=.6,CU=.7,CLIPS=['surt','juga','balla'],CDUR=4;
  /* segon de cada clip en què la cria obre la boca (mesurat fotograma a fotograma): la veu sona just llavors */
  const MOUTH={triceratops:{surt:1.08,juga:3.08},diplodocus:{surt:.83,juga:3.25},estegosaure:{surt:.75,juga:3.0},tiranosaure:{surt:.71,juga:1.17},pterodactil:{surt:.92,juga:2.25},anquilosaure:{surt:.33,juga:2.83}};
  let R=null,S3,cam,cvs=null,on=false,NL=0,ready3=false,PROTO={},CRIA={},VID={},VGEO=null,NIU=null,FG=null,g3=null,gN=null;
  let eggs=[],queue=[],fest=-1,out=-1,rounds=0,MASK=null;
  const fons=img('ous/fons.webp');
  /* màscara de les falgueres (160×90) per no posar cap ou gaire tapat */
  {const im=img('ous/davant.webp');im.onload=()=>{try{const c=document.createElement('canvas');c.width=160;c.height=90;const x=c.getContext('2d');x.drawImage(im,0,0,160,90);MASK=x.getImageData(0,0,160,90).data}catch(e){MASK=null}}}
  function covered(x0,y0,x1,y1){let n=0,t=0;for(let y=y0;y<=y1;y+=8)for(let x=x0;x<=x1;x+=8){t++;
      if(x<0||x>=W||y<0||y>=H){n++;continue}
      if(MASK){if(MASK[(Math.floor(y/8)*160+Math.floor(x/8))*4+3]>90)n++}else if(y>420&&(x<215||x>1050))n++}
    return n/t}
  const Cc=new THREE.Vector3(0,.5,0),V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  function init(){if(R)return;
    cvs=document.createElement('canvas');cvs.id='c3o';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);R.outputColorSpace=THREE.SRGBColorSpace;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(0,W,H,0,-3000,3000);cam.position.z=1000;
    S3.add(new THREE.AmbientLight(0xffffff,2.2));const d=new THREE.DirectionalLight(0xffffff,1.6);d.position.set(-.5,.8,.6);S3.add(d);
    const TL=new THREE.TextureLoader(),tx=(p,flip)=>{const t=TL.load(U(p));t.colorSpace=THREE.SRGBColorSpace;if(flip===false)t.flipY=false;return t};
    /* niu petit: la imatge del niu en dos plans (fons i vora del davant), l'ou queda entremig */
    const nm=new THREE.MeshBasicMaterial({map:tx('ous/niu.webp'),transparent:true,alphaTest:.05});
    const gb=new THREE.PlaneGeometry(1.55,.62).translate(0,.074,-.45),gf=new THREE.PlaneGeometry(1.55,.285).translate(0,-.0935,.45);
    const uvf=gf.attributes.uv;for(let i=0;i<uvf.count;i++)uvf.setY(i,uvf.getY(i)*.46);
    VGEO=new THREE.PlaneGeometry(1.7*CU,1.5*CU).translate(0,(.75-.05)*CU,0);
    NIU=new THREE.Group();NIU.add(new THREE.Mesh(gb,nm),new THREE.Mesh(gf,nm));
    /* falgueres dels laterals: sempre per davant dels nius i els ous */
    FG=new THREE.Mesh(new THREE.PlaneGeometry(W,H).translate(W/2,H/2,0),new THREE.MeshBasicMaterial({map:tx('ous/davant.webp'),transparent:true,depthTest:false}));FG.position.z=900;FG.renderOrder=10;S3.add(FG);
    gN=new THREE.Group();g3=new THREE.Group();S3.add(gN,g3);
    const ins=new THREE.MeshLambertMaterial({color:0xf5e6c2}),core=new THREE.MeshBasicMaterial({color:0x1a0e0a}),L=new GLTFLoader();
    for(const k of KINDS){
      /* clips de la cria (webm amb alfa): finestra d'1,7 × 1,5 alçades de cria, peus a 0,05 de la vora de baix */
      VID[k]={};for(const c of CLIPS){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.loop=c==='balla';v.src=VSRC('ous/v/'+k+'_'+c+'.webm');
        const t=VTEX(v);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;
        VID[k][c]={v,m:new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.05})}}
      CRIA[k]=new THREE.Mesh(new THREE.PlaneGeometry(CU*CAR[k],CU).translate(0,CU/2,0),new THREE.MeshBasicMaterial({map:tx('ous/cria_'+k+'.webp'),transparent:true,alphaTest:.05}));
      const t=tx('ous/tex_'+k+'.webp',false);t.anisotropy=4;
      const o=new THREE.MeshBasicMaterial({map:t}),rim=new THREE.MeshBasicMaterial({map:t,color:0x808080});
      L.load(U('ous/m/'+k+'.gltf.json'),g=>{PROTO[k]=g.scene;g.scene.traverse(m=>{if(m.isMesh){const n=m.material.name;m.material=n.startsWith('ou_vora')?rim:n==='ou_dins'?ins:n==='ou_fosc'?core:o}});
        if(++NL===KINDS.length){ready3=true;if(on)layout()}},undefined,e=>console.error(e))}
    resize()}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.round(W*SC*pr),Math.round(H*SC*pr),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'})}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const persp=y=>PERS+(1-PERS)*clamp((y-YF[0])/(YF[1]-YF[0]),0,1);
  /* llocs de la ronda: es proven moltes distribucions a l'atzar i es tria la que deixa els ous més separats */
  function slots(){const n=NUM[CFG.size],hb=HB[CFG.size];let best=null,bs=-1;
    for(let tr=0;tr<260;tr++){const o=[];let ok=true,score=9;
      for(let i=0;i<n&&ok;i++){let p=null;
        for(let k=0;k<40&&!p;k++){const y=YF[0]+Math.random()*(YF[1]-YF[0]),h=hb*persp(y),x=120+Math.random()*(W-240);
          if(covered(x-h*.45,y-h*1.05,x+h*.45,y)>.07||covered(x-h*.78,y-h*.25,x+h*.78,y+h*.2)>.22)continue;      /* ou gairebé sencer visible; niu no gaire tapat */
          let good=true;for(const q of o){const hm=Math.max(h,q.H),dx=Math.abs(x-q.x)/(hm*1.42),dy=Math.abs(y-q.y)/(hm*1.02),d=Math.max(dx,dy);if(d<1){good=false;break}score=Math.min(score,d)}
          if(good)p={x,y,z:y,H:h}}
        if(p)o.push(p);else ok=false}
      if(ok&&score>bs){bs=score;best=o}}
    if(!best){best=[];const gap=[460,245,170][CFG.size];for(let i=0;i<n;i++){const y=n>2&&i%2===0?470:622;best.push({x:W/2+(i-(n-1)/2)*gap,y,z:y,H:hb*persp(y)})}}   /* reserva: dues files alternades */
    return best}
  function vrate(){const sp=CFG.speed;return clamp(sp>0?Math.max(.4,sp):1,.25,4)}
  /* posa un clip a la cria; si el vídeo no es pot reproduir, la cria es mou per codi com abans */
  function setClip(e,c){const o=VID[e.k][c],v=o.v;if(v.error||v.readyState<1){e.clip=null;return false}
    for(const x of CLIPS)if(x!==c)VID[e.k][x].v.pause();
    e.clip=c;e.vm.material=o.m;e.vd=30;try{v.currentTime=0;v.playbackRate=vrate();const p=v.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}
    hush(e);if(MOUTH[e.k][c]!=null)e.voice=play(c==='surt'?'o_b_'+e.k:'o_'+e.k,.8,1,MOUTH[e.k][c]/vrate())||null;return true}   /* badall en néixer, crit d'alegria en jugar */
  function hush(e){if(e.voice){try{e.voice.stop()}catch(_){}e.voice=null}}
  function stopClips(){for(const e of eggs)hush(e);for(const k in VID)for(const c of CLIPS)VID[k][c].v.pause()}
  function clearEggs(){stopClips();for(const e of eggs){g3.remove(e.root);gN.remove(e.niu);for(const m of e.bm)m.dispose()}eggs=[]}
  /* ronda nova: cada cria surt en un lloc diferent cada vegada; la cua fa que surtin totes abans de repetir */
  function newRound(){if(!ready3)return;clearEggs();const sl=slots(),n=sl.length;
    if(queue.length<n)queue=queue.concat(shuffle(KINDS.filter(k=>!queue.includes(k))));
    const ks=shuffle(queue.splice(0,n));fest=-1;out=-1;rounds++;
    sl.forEach((s,i)=>{const k=ks[i],r=PROTO[k].clone(true),e=Object.assign({k,root:r,ps:[],bm:[],st:'egg',n:0,t:0,wob:0,hint:0,idle:0,pop:-.15*i,dw:0,inside:false,hov:0,react:0,kin:null,seed:1+Math.floor(Math.random()*1e6),ph:Math.random()*TAU},s);
      for(const ch of r.children){const g=ch.name.replace(k+'_','').replace(/[._]\d+$/,'');e.ps.push({o:ch,g,rest:ch.position.clone()});
        if(g==='bolD'||g==='bolE')ch.traverse(m=>{if(m.isMesh){m.material=m.material.clone();e.bm.push(m.material)}})}
      e.img=CRIA[k].clone();e.vm=new THREE.Mesh(VGEO,VID[k].surt.m);e.vm.visible=false;e.clip=null;e.cria=new THREE.Group();e.cria.add(e.img,e.vm);r.add(e.cria);g3.add(r);e.niu=NIU.clone();e.niu.position.set(e.x,H-e.y,e.z);gN.add(e.niu);eggs.push(e);pose(e)})}
  function layout(){if(!ready3)return;if(MODE===1)newRound2();else newRound()}
  const rn=e=>{e.seed=(e.seed*16807)%2147483647;return e.seed/2147483647};
  const isReady=e=>MODE===1?!!G&&G.ph==='pick'&&e.st==='egg'&&e.pop>=1&&!(e.no>0):e.pop>=1&&out<0&&(e.st==='egg'?e.wob<=0:e.st==='baby'&&e.react<=0&&fest<0);
  function activate(e){if(!isReady(e))return;STATS.n++;$('#oN').textContent=STATS.n;
    if(MODE===1){pick2(e);return}
    if(e.st==='baby'){if(setClip(e,'juga')){e.react=CDUR;play('o_pop',.45,1.15)}else{e.react=.8;play('o_'+e.k,.8)||play('ding',.5,1.1)}return}
    const need=NEED[CFG.size];e.n++;e.wob=WOB;e.idle=0;
    if(e.n>=need){e.st='burst';e.t=0;e.kin=null;play('o_trenca',.9)||play('fusta',.7,1.3);e.vfb=true}
    else if(e.n===1&&need>2)play('o_cop',.8)||play('fusta',.6,.8);
    else play('o_esq',.85)||play('fusta',.6,1.1)}
  function step(dt){if(!R||!ready3)return;const sp=CFG.speed,a=dt*(sp>0?Math.max(.4,sp):1),free=!optsOpen&&view==='scene';
    const [wx,wy]=toWorld(cmx,cmy);let hv=null;
    if(free)for(const e of eggs){const top=e.st==='egg'||e.st==='burst'?1.06:1.3;if(Math.abs(wx-e.x)<e.H*.46&&wy>e.y-e.H*top&&wy<e.y+e.H*.1&&(!hv||e.z>hv.z))hv=e}
    ringP=0;let babies=0;
    for(const e of eggs){const onE=e===hv,rd=isReady(e);
      if(CFG.mode===0){if(onE&&!e.inside&&rd)activate(e)}
      else if(CFG.mode===1){if(onE&&rd){e.dw+=dt;ringP=clamp(e.dw/CFG.dwell,0,1);if(e.dw>=CFG.dwell){e.dw=0;activate(e)}}else e.dw=0}
      e.inside=onE;e.hov+=((onE&&rd?1:0)-e.hov)*Math.min(1,dt*8);
      if(e.pop<1){const was=e.pop;e.pop=Math.min(1,e.pop+a*2.4);if(was<0&&e.pop>=0)play('o_pop',.5,.9+Math.random()*.3)}
      if(e.wob>0)e.wob=Math.max(0,e.wob-a);if(e.react>0)e.react=Math.max(0,e.react-a);if(e.hint>0)e.hint=Math.max(0,e.hint-a);if(e.no>0)e.no=Math.max(0,e.no-a);
      if(e.st==='egg'&&e.n>0&&e.wob<=0){e.idle+=a;if(e.idle>3.2){e.idle=0;e.hint=.6}}     /* ajuda: l'ou començat es belluga sol */
      if(e.st==='burst'){e.t+=a;if(e.t>=BURST){e.st='open';e.t=0;if(setClip(e,'surt'))e.react=CDUR;else play('o_b_'+e.k,.8)}}
      else if(e.st==='open'){e.t+=a;if(e.t>=SPLIT){e.st='split';e.t=0;play('o_cau',.6)}}
      else if(e.st==='split'){e.t+=a;if(e.t>=FALL){e.st='baby';e.t=0}}
      if(e.st==='baby')babies++}
    if(MODE===1){step2(a);return}
    if(eggs.length&&babies===eggs.length){
      if(fest<0){fest=0;play('o_festa',.8)||play('festa',.7);for(const e of eggs){e.react=0;setClip(e,'balla')}}
      else if(out<0){fest+=a;if(fest>=FEST)out=0}
      else{out+=a;if(out>=OUT)newRound()}}}
  function pose(e){const st=e.st,si=st==='egg'?(NEED[CFG.size]===2?[0,2,2]:[0,1,2])[Math.min(2,e.n)]:st==='burst'?3:4;
    if(si===3&&!e.kin){e.kin={};for(const p of e.ps){if(p.g==='bolD'||p.g==='bolE'||p.g==='nucli'||p.g==='sencer')continue;
      const d=p.rest.clone().sub(Cc),h=V3(d.x,0,d.z);if(h.length()<1e-3)h.set(rn(e)-.5,0,.2);h.normalize();
      const v=p.g==='barret'?V3((rn(e)<.5?-1:1)*.55,3.3,.3):h.multiplyScalar(1.5+rn(e)*.8).add(V3(0,1.4+rn(e)*1.1,0));
      e.kin[p.o.uuid]={v,w:V3((rn(e)-.5)*22,(rn(e)-.5)*22,(rn(e)-.5)*22)}}}
    const us=st==='split'?clamp(e.t/FALL,0,1):st==='baby'?1:0,ue=us*us*(3-2*us);
    for(const p of e.ps){const o=p.o,bol=p.g==='bolD'||p.g==='bolE';o.position.copy(p.rest);o.rotation.set(0,0,0);o.scale.setScalar(1);o.visible=true;
      if(p.g==='sencer'){o.visible=si===0;continue}
      if(si===0){o.visible=false;continue}
      if(p.g==='nucli'){o.visible=si<3;continue}
      if(bol){const sg=p.g==='bolD'?1:-1;
        if(si===2)o.position.y-=.004;
        if(si===3){const k=e.t*30;o.position.y-=.012*Math.exp(-k/4)*Math.sin(k*1.3)}
        if(us<=0)o.position.x-=sg*.003;                         /* les dues meitats se solapen una mica: no es veu la costura */
        else if(us>=1)o.visible=false;
        else{const q=us*us,an=-sg*1.45*q,c=Math.cos(an),sn=Math.sin(an),x=p.rest.x,y=p.rest.y;
          o.position.set(x*c-y*sn+sg*.22*us,x*sn+y*c+.10*Math.sin(us*Math.PI),p.rest.z);o.rotation.z=an}
        continue}
      if(si>=4){o.visible=false;continue}
      if(si===1)o.position.add(V3(.004,.013,0));
      else{if(p.g==='barret'){o.position.add(V3(.004,.03,0));o.rotation.z=-.044}else o.position.add(p.rest.clone().sub(Cc).normalize().multiplyScalar(.016)).add(V3(0,.013,0))}
      if(si===3){const k=e.kin[o.uuid],t=e.t;o.position.addScaledVector(k.v,t);o.position.y-=.5*7.5*t*t;o.rotation.set(k.w.x*t,k.w.y*t,k.w.z*t);o.scale.setScalar(Math.min(1,(BURST-t)/.15))}}
    for(const m of e.bm){m.transparent=us>0&&us<1;m.opacity=1-Math.max(0,(us-.35)/.65)}
    /* cria: puja dins de la closca, baixa al niu quan la base es parteix, salta si la miren i balla a la festa */
    const c=e.cria,ur=st==='burst'?clamp((e.t-.12)/.5,0,1):1,rise=.3+.7*(1-(1-ur)*(1-ur));
    c.visible=(st==='burst'&&e.t>.12)||si===4;let cy=.30-.25*ue,cs=rise*(1+.12*ue),cr=0,sq=1;
    const vo=e.clip?VID[e.k][e.clip]:null,vok=!!vo&&vo.v.readyState>=2&&si===4;
    e.vm.visible=vok;e.img.visible=!vok;
    if(vok){const v=vo.v;if(!v.paused||e.vd>0){vo.m.map.needsUpdate=true;e.vd--}if(!v.paused&&Math.abs(v.playbackRate-vrate())>.01)v.playbackRate=vrate()}
    else{if(e.react>0&&st==='baby'){const u=1-e.react/.8;if(u>=0){cy+=.16*Math.sin(u*Math.PI);sq=1+.08*Math.sin(u*TAU)}}
      if(fest>=0&&st==='baby'){const f=fest*5.2+e.ph;cy+=.12*Math.abs(Math.sin(f));cr=.13*Math.sin(f)}}
    c.position.set(0,cy,0);c.scale.set(cs/sq,cs*sq,cs);c.rotation.z=cr;
    let wa=0;if(st==='egg'&&e.no>0){const u=1-e.no/.8;wa=.2*Math.sin(u*Math.PI*4)*(1-u)}else if(st==='egg'){if(e.wob>0){const u=1-e.wob/WOB;wa=(6+3*e.n)*Math.PI/180*Math.sin(u*Math.PI*4)*(1-u)}else if(e.hint>0){const u=1-e.hint/.6;wa=.07*Math.sin(u*Math.PI*4)*(1-u)}}
    const pp=clamp(e.pop,0,1),r=e.root,gone=out>=0?Math.max(0,1-out/OUT):e.fade!=null?e.fade:1,s=e.H*eBack(pp)*(1+.04*e.hov)*gone;e.niu.position.set(e.x,H-e.y,e.z);
    r.visible=e.pop>0;e.niu.visible=e.pop>0&&!e.noNest;e.niu.scale.setScalar(Math.max(.0001,e.H*eBack(pp)*gone));r.position.set(e.x,H-e.y,e.z);r.scale.setScalar(Math.max(.0001,s));r.rotation.z=-wa}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    if(!CFG.simple&&fons.complete)c.drawImage(fons,-2,-2,W+4,H+4);
    if(!R||!ready3)return;FG.visible=!CFG.simple;
    if(MODE===1&&!CFG.simple)for(const e of eggs){if(!e.noNest||e.pop<=0)continue;const k=clamp(e.pop,0,1)*(out>=0?Math.max(0,1-out/OUT):e.fade!=null?e.fade:1),lift=e.y-Y2;
      if(k<=.01)continue;const rx=e.H*.36*k*(1-Math.max(0,-lift)/400),g=c.createRadialGradient(e.x,e.y,0,e.x,e.y,rx);g.addColorStop(0,'rgba(40,60,20,.34)');g.addColorStop(1,'rgba(40,60,20,0)');
      c.save();c.translate(e.x,e.y);c.scale(1,.24);c.translate(-e.x,-e.y);c.fillStyle=g;c.beginPath();c.arc(e.x,e.y,rx,0,TAU);c.fill();c.restore()}for(const e of eggs)pose(e);R.render(S3,cam)}
  function click(cx,cy){const [wx,wy]=toWorld(cx,cy);let hv=null;for(const e of eggs)if(Math.abs(wx-e.x)<e.H*.46&&wy>e.y-e.H*1.3&&wy<e.y+e.H*.1&&(!hv||e.z>hv.z))hv=e;if(hv)activate(hv)}
  function start(){init();on=true;cvs.style.display='block';tray();if(ready3)layout()}
  function stop(){on=false;stopClips();vHush();G=null;if(cvs)cvs.style.display='none'}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));vHush();if(on&&ready3)layout();if(on)updLoops()}
  function tray(){const t=$('#tray');t.innerHTML='';['ous.m1','ous.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=ev=>{ev.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  /* ───── mode 2: «Segueix l'ou!» ───── */
  const say=k=>vSay('ous/veu',Array.isArray(k)?k:[k]);
  function mkEgg(k,s,i){const r=PROTO[k].clone(true),e=Object.assign({k,root:r,ps:[],bm:[],st:'egg',n:0,t:0,wob:0,hint:0,no:0,idle:0,pop:-.15*i,dw:0,inside:false,hov:0,react:0,kin:null,seed:1+Math.floor(Math.random()*1e6),ph:Math.random()*TAU},s);
    for(const ch of r.children){const g=ch.name.replace(k+'_','').replace(/[._]\d+$/,'');e.ps.push({o:ch,g,rest:ch.position.clone()});
      if(g==='bolD'||g==='bolE')ch.traverse(m=>{if(m.isMesh){m.material=m.material.clone();e.bm.push(m.material)}})}
    e.img=CRIA[k].clone();e.vm=new THREE.Mesh(VGEO,VID[k].surt.m);e.vm.visible=false;e.clip=null;e.cria=new THREE.Group();e.cria.add(e.img,e.vm);r.add(e.cria);g3.add(r);e.niu=NIU.clone();e.niu.visible=false;e.noNest=true;e.niu.position.set(e.x,H-e.y,e.z);gN.add(e.niu);eggs.push(e);pose(e);return e}
  function newRound2(){if(!ready3)return;clearEggs();vHush();const n=N2[CFG.size],h=HB2[CFG.size],gap=GAP2[CFG.size];
    if(!queue.length)queue=shuffle(KINDS.slice());const k=queue.shift();fest=-1;out=-1;rounds++;
    const xs=[];for(let i=0;i<n;i++)xs.push(W/2+(i-(n-1)/2)*gap);
    for(let i=0;i<n;i++)mkEgg(k,{x:xs[i],y:Y2,z:Y2,H:h},i);
    G={ph:'intro',t:0,k,xs,tgt:eggs[Math.floor(Math.random()*n)],left:SW2[CFG.size],sw:null,help:0,ok:0,said:0}}
  const swDur=()=>SWD[CFG.size]/clamp(CFG.speed>0?CFG.speed:1,.5,2);
  function call2(){const e=G.tgt;e.wob=WOB;play('o_'+e.k,.8)}
  function nextSwap(){const n=eggs.length;let i=Math.floor(Math.random()*n),j=Math.floor(Math.random()*(n-1));if(j>=i)j++;
    if(n>2&&Math.random()<.55&&G.tgt){i=eggs.indexOf(G.tgt)}             /* sovint hi entra l'ou de la cria: cal seguir-lo */
    if(j===i)j=(i+1)%n;const a=eggs[i],b=eggs[j];G.sw={a,b,ax:a.x,bx:b.x,t:0,d:swDur(),fr:Math.random()<.5};G.left--;play('o_llisca',.7,rnd(.92,1.08))}
  function step2(a){const g=G;if(!g)return;g.t+=a;
    if(g.ph==='intro'){if(g.t>1.1){g.ph='call';g.t=0;say('escolta')}}
    else if(g.ph==='call'){if(!g.c1&&g.t>1.9){g.c1=1;call2()}if(!g.c2&&g.t>3.1){g.c2=1;call2()}if(g.t>4.4){g.ph='shuf';g.t=0;say('barreja')}}
    else if(g.ph==='shuf'){if(!g.sw){if(g.t>(g.left===SW2[CFG.size]?1.3:.18)){if(g.left>0)nextSwap();else{g.ph='pick';g.t=0;g.help=0;say('on')}}}
      else{const w=g.sw;w.t+=a;const u=clamp(w.t/w.d,0,1),e=u*u*(3-2*u),sn=Math.sin(u*Math.PI),dy=SWDY*(CFG.size===0?1:.85);
        w.a.x=w.ax+(w.bx-w.ax)*e;w.b.x=w.bx+(w.ax-w.bx)*e;w.a.y=Y2+(w.fr?dy:-dy)*sn;w.b.y=Y2+(w.fr?-dy:dy)*sn;w.a.z=w.a.y;w.b.z=w.b.y;
        if(u>=1){w.a.x=w.bx;w.b.x=w.ax;w.a.y=w.b.y=w.a.z=w.b.z=Y2;g.sw=null;g.t=0}}}
    else if(g.ph==='pick'){g.help+=a;const e=g.tgt;
      if(g.help>6&&!g.h1){g.h1=1;e.hint=.6}
      if(g.help>12){g.help=6.01;g.h1=1;e.wob=WOB;play('o_'+e.k,.8);say('mira')}}
    else if(g.ph==='hatch'){const e=g.tgt;
      for(const o of eggs)if(o!==e)o.fade=Math.max(0,(o.fade==null?1:o.fade)-a/.7);
      if(!g.said&&e.st==='open'&&e.t>.9){g.said=1;say('trobada')}
      if(e.st==='baby'&&e.react<=0&&!g.dance){g.dance=1;g.t=0;setClip(e,'balla');play('o_festa',.7)}
      if(g.dance&&g.t>3.6){g.ph='out';g.t=0;out=0}}
    else if(g.ph==='out'){out+=a;if(out>=OUT)newRound2()}}
  function pick2(e){const g=G;if(e===g.tgt){g.ph='hatch';g.t=0;e.st='burst';e.t=0;e.kin=null;e.n=NEED[CFG.size];play('o_trenca',.9);play('o_cop',.5);return}
    e.no=.8;play('o_no',.8);say('no');g.help=Math.max(g.help,4);setTimeout(()=>{if(G===g&&g.ph==='pick'){g.tgt.wob=WOB;play('o_'+g.tgt.k,.8)}},1100)}
  function mus(){return MODE===1?'m_ous2':'m_ous'}
  return {start,stop,step,render,layout,click,activate,tray,setMode,mus,toggle(){setMode(1-MODE)},get mode(){return MODE},get G(){return G},slow(){},preload(){},get eggs(){return eggs},get fest(){return fest},get out(){return out},get rounds(){return rounds},get ready(){return ready3},get vid(){return VID}};
})();
