/* =========================================================
   MIRA I JUGA 2 — instal·lació com a aplicació (PWA) i versió
   El botó «Instal·lar» de la portada obre una finestra que primer diu quant d'espai ocupa l'app instal·lada
   (el total real de pwa-fitxers.json, que tools/pwa-build.mjs escriu a cada publicació), després demana al
   navegador que la instal·li (beforeinstallprompt: Chrome i Edge) i descarrega tots els fitxers a la Cache
   Storage perquè funcioni sense connexió; sw.js els serveix. La descàrrega es fa a la pàgina (un service worker
   es pot aturar al cap d'uns minuts), es pot aturar i reprendre, i les versions noves només baixen el que ha
   canviat. Visitar la web sense instal·lar no descarrega res de més. A file:// (HTML únic) tot queda apagat.
   Mateix funcionament i textos que la finestra d'instal·lació de Pim Pam.
   ========================================================= */
const APP_VERSION='__VERSION__';
const PWA_TX={
ca:{'pwa.ios':'A l’iPad i l’iPhone, primer cal afegir {N} a la pantalla d’inici: toqueu Comparteix (el quadre amb la fletxa) › Afegeix a la pantalla d’inici. Després obriu-lo des de la icona nova i toqueu «Instal·lar» per descarregar-ho tot perquè funcioni sense connexió.','pwa.h':'Instal·la {N}','pwa.intro':'{N} s’instal·larà en aquest dispositiu com una aplicació, i s’hi descarregaran totes les activitats, els sons i els vídeos perquè funcioni sense connexió.','pwa.total':'Espai total que ocuparà instal·lat','pwa.video':'Vídeos','pwa.so':'Sons, veus i música','pwa.img':'Imatges','pwa.m3d':'Models 3D','pwa.codi':'Programa i textos','pwa.free':'Espai que aquest navegador pot fer servir en aquest dispositiu: {M}.','pwa.nospace':'No hi ha prou espai lliure per instal·lar {N} en aquest dispositiu.','pwa.slow':'La descàrrega pot trigar uns quants minuts. Les versions noves s’actualitzaran soles i només baixaran el que hagi canviat.','pwa.partial':'Una part ja és descarregada i no es tornarà a baixar.','pwa.cancel':'Cancel·la','pwa.go':'Instal·la ({M})','pwa.calc':'Calculant l’espai que ocupa…','pwa.dl':'S’estan descarregant les activitats, els sons i els vídeos. Deixeu aquesta finestra oberta fins que acabi.','pwa.of':'{A} de {B}','pwa.resume':'Si s’atura, la propera vegada continuarà on s’ha quedat.','pwa.stop':'Atura','pwa.ok1':'{N} està instal·lat en aquest dispositiu i funciona sense connexió.','pwa.ok2':'Totes les activitats ja són en aquest dispositiu i funcionen sense connexió.','pwa.hintApp':'Si el navegador no ha mostrat cap avís d’instal·lació: a Chrome i Edge, feu servir la icona d’instal·lar de la barra d’adreces; a l’iPad i l’iPhone, Safari › Comparteix › Afegeix a la pantalla d’inici.','pwa.used':'Espai que ocupa','pwa.del':'Esborra les activitats d’aquest dispositiu','pwa.app':'Instal·la l’aplicació','pwa.ok':'D’acord','pwa.close':'Tanca','pwa.retry':'Torna-ho a provar','pwa.eList':'No s’ha pogut saber què cal descarregar. Torneu-ho a provar d’aquí a una estona.','pwa.eOff':'Cal connexió a internet per instal·lar {N}.','pwa.eVer':'Mentre es descarregava s’ha publicat una versió nova de {N}. Torneu-ho a provar: continuarà on s’havia quedat.','pwa.eQuota':'No hi ha prou espai lliure en aquest dispositiu per acabar la instal·lació.','pwa.eNet':'No s’ha pogut descarregar tot. Torneu-ho a provar: continuarà on s’havia quedat.','pwa.eLost':'S’ha perdut la connexió. Torneu-ho a provar quan torni a haver-n’hi: continuarà on s’havia quedat.','pwa.installed':'Instal·lada','pwa.downloading':'Descarregant…','version':'Versió','pwa.upd':'S’ha descarregat la versió {V}: es veurà la propera vegada que obriu l’aplicació.'},
es:{'pwa.ios':'En el iPad y el iPhone, primero hay que añadir {N} a la pantalla de inicio: tocad Compartir (el cuadro con la flecha) › Añadir a pantalla de inicio. Después abridla desde el icono nuevo y tocad «Instalar» para descargarlo todo y que funcione sin conexión.','pwa.h':'Instala {N}','pwa.intro':'{N} se instalará en este dispositivo como una aplicación, y se descargarán todas las actividades, los sonidos y los vídeos para que funcione sin conexión.','pwa.total':'Espacio total que ocupará instalada','pwa.video':'Vídeos','pwa.so':'Sonidos, voces y música','pwa.img':'Imágenes','pwa.m3d':'Modelos 3D','pwa.codi':'Programa y textos','pwa.free':'Espacio que este navegador puede usar en este dispositivo: {M}.','pwa.nospace':'No hay suficiente espacio libre para instalar {N} en este dispositivo.','pwa.slow':'La descarga puede tardar unos minutos. Las versiones nuevas se actualizarán solas y solo bajarán lo que haya cambiado.','pwa.partial':'Una parte ya está descargada y no se volverá a bajar.','pwa.cancel':'Cancelar','pwa.go':'Instalar ({M})','pwa.calc':'Calculando el espacio que ocupa…','pwa.dl':'Se están descargando las actividades, los sonidos y los vídeos. Dejad esta ventana abierta hasta que termine.','pwa.of':'{A} de {B}','pwa.resume':'Si se detiene, la próxima vez continuará donde se quedó.','pwa.stop':'Detener','pwa.ok1':'{N} está instalada en este dispositivo y funciona sin conexión.','pwa.ok2':'Todas las actividades ya están en este dispositivo y funcionan sin conexión.','pwa.hintApp':'Si el navegador no ha mostrado ningún aviso de instalación: en Chrome y Edge, usad el icono de instalar de la barra de direcciones; en el iPad y el iPhone, Safari › Compartir › Añadir a pantalla de inicio.','pwa.used':'Espacio que ocupa','pwa.del':'Borrar las actividades de este dispositivo','pwa.app':'Instalar la aplicación','pwa.ok':'De acuerdo','pwa.close':'Cerrar','pwa.retry':'Volver a intentarlo','pwa.eList':'No se ha podido saber qué hay que descargar. Volved a intentarlo dentro de un rato.','pwa.eOff':'Hace falta conexión a internet para instalar {N}.','pwa.eVer':'Mientras se descargaba se ha publicado una versión nueva de {N}. Volved a intentarlo: continuará donde se quedó.','pwa.eQuota':'No hay suficiente espacio libre en este dispositivo para terminar la instalación.','pwa.eNet':'No se ha podido descargar todo. Volved a intentarlo: continuará donde se quedó.','pwa.eLost':'Se ha perdido la conexión. Volved a intentarlo cuando vuelva a haberla: continuará donde se quedó.','pwa.installed':'Instalada','pwa.downloading':'Descargando…','version':'Versión','pwa.upd':'Se ha descargado la versión {V}: se verá la próxima vez que abráis la aplicación.'},
eu:{'pwa.ios':'iPad eta iPhone-n, lehenik {N} hasierako pantailan gehitu behar da: sakatu Partekatu (gezia duen laukia) › Gehitu hasierako pantailan. Gero, ireki ikono berritik eta sakatu «Instalatu» dena deskargatzeko, konexiorik gabe ibil dadin.','pwa.h':'Instalatu {N}','pwa.intro':'{N} aplikazio gisa instalatuko da gailu honetan, eta jarduera, soinu eta bideo guztiak deskargatuko dira konexiorik gabe ibil dadin.','pwa.total':'Instalatuta beteko duen leku osoa','pwa.video':'Bideoak','pwa.so':'Soinuak, ahotsak eta musika','pwa.img':'Irudiak','pwa.m3d':'3D ereduak','pwa.codi':'Programa eta testuak','pwa.free':'Nabigatzaile honek gailu honetan erabil dezakeen lekua: {M}.','pwa.nospace':'Ez dago leku libre nahikorik {N} gailu honetan instalatzeko.','pwa.slow':'Deskargak minutu batzuk iraun ditzake. Bertsio berriak beren kabuz eguneratuko dira, eta aldatu dena bakarrik deskargatuko dute.','pwa.partial':'Zati bat deskargatuta dago jada, eta ez da berriro deskargatuko.','pwa.cancel':'Utzi','pwa.go':'Instalatu ({M})','pwa.calc':'Betetzen duen lekua kalkulatzen…','pwa.dl':'Jarduerak, soinuak eta bideoak deskargatzen ari dira. Utzi leiho hau irekita amaitu arte.','pwa.of':'{A} / {B}','pwa.resume':'Gelditzen bada, hurrengoan utzitako lekutik jarraituko du.','pwa.stop':'Gelditu','pwa.ok1':'{N} gailu honetan instalatuta dago eta konexiorik gabe dabil.','pwa.ok2':'Jarduera guztiak gailu honetan daude jada eta konexiorik gabe dabiltza.','pwa.hintApp':'Nabigatzaileak instalatzeko abisurik erakutsi ez badu: Chrome eta Edge-n, erabili helbide-barrako instalatzeko ikonoa; iPad eta iPhone-n, Safari › Partekatu › Gehitu hasierako pantailan.','pwa.used':'Betetzen duen lekua','pwa.del':'Ezabatu gailu honetako jarduerak','pwa.app':'Instalatu aplikazioa','pwa.ok':'Ados','pwa.close':'Itxi','pwa.retry':'Saiatu berriro','pwa.eList':'Ezin izan da jakin zer deskargatu behar den. Saiatu berriro geroxeago.','pwa.eOff':'Interneteko konexioa behar da {N} instalatzeko.','pwa.eVer':'Deskargatzen ari zen bitartean {N}-(r)en bertsio berri bat argitaratu da. Saiatu berriro: utzitako lekutik jarraituko du.','pwa.eQuota':'Ez dago leku libre nahikorik gailu honetan instalazioa amaitzeko.','pwa.eNet':'Ezin izan da dena deskargatu. Saiatu berriro: utzitako lekutik jarraituko du.','pwa.eLost':'Konexioa galdu da. Saiatu berriro konexioa dagoenean: utzitako lekutik jarraituko du.','pwa.installed':'Instalatuta','pwa.downloading':'Deskargatzen…','version':'Bertsioa','pwa.upd':'{V} bertsioa deskargatu da: aplikazioa hurrengoan irekitzean ikusiko da.'},
gl:{'pwa.ios':'No iPad e no iPhone, primeiro cómpre engadir {N} á pantalla de inicio: tocade Compartir (o cadro coa frecha) › Engadir á pantalla de inicio. Despois abrídea dende a icona nova e tocade «Instalar» para descargalo todo e que funcione sen conexión.','pwa.h':'Instala {N}','pwa.intro':'{N} instalarase neste dispositivo como unha aplicación, e descargaranse todas as actividades, os sons e os vídeos para que funcione sen conexión.','pwa.total':'Espazo total que ocupará instalada','pwa.video':'Vídeos','pwa.so':'Sons, voces e música','pwa.img':'Imaxes','pwa.m3d':'Modelos 3D','pwa.codi':'Programa e textos','pwa.free':'Espazo que este navegador pode usar neste dispositivo: {M}.','pwa.nospace':'Non hai espazo libre abondo para instalar {N} neste dispositivo.','pwa.slow':'A descarga pode tardar uns minutos. As versións novas actualizaranse soas e só baixarán o que cambiase.','pwa.partial':'Unha parte xa está descargada e non se volverá baixar.','pwa.cancel':'Cancelar','pwa.go':'Instalar ({M})','pwa.calc':'Calculando o espazo que ocupa…','pwa.dl':'Estanse descargando as actividades, os sons e os vídeos. Deixade esta xanela aberta ata que remate.','pwa.of':'{A} de {B}','pwa.resume':'Se se detén, a próxima vez continuará onde quedou.','pwa.stop':'Deter','pwa.ok1':'{N} está instalada neste dispositivo e funciona sen conexión.','pwa.ok2':'Todas as actividades xa están neste dispositivo e funcionan sen conexión.','pwa.hintApp':'Se o navegador non amosou ningún aviso de instalación: en Chrome e Edge, usade a icona de instalar da barra de enderezos; no iPad e no iPhone, Safari › Compartir › Engadir á pantalla de inicio.','pwa.used':'Espazo que ocupa','pwa.del':'Borrar as actividades deste dispositivo','pwa.app':'Instalar a aplicación','pwa.ok':'De acordo','pwa.close':'Pechar','pwa.retry':'Tentalo de novo','pwa.eList':'Non se puido saber que hai que descargar. Tentádeo de novo dentro dun anaco.','pwa.eOff':'Cómpre conexión a internet para instalar {N}.','pwa.eVer':'Mentres se descargaba publicouse unha versión nova de {N}. Tentádeo de novo: continuará onde quedou.','pwa.eQuota':'Non hai espazo libre abondo neste dispositivo para rematar a instalación.','pwa.eNet':'Non se puido descargar todo. Tentádeo de novo: continuará onde quedou.','pwa.eLost':'Perdeuse a conexión. Tentádeo de novo cando volva habela: continuará onde quedou.','pwa.installed':'Instalada','pwa.downloading':'Descargando…','version':'Versión','pwa.upd':'Descargouse a versión {V}: verase a próxima vez que abrades a aplicación.'},
en:{'pwa.ios':'On iPad and iPhone, first add {N} to the Home Screen: tap Share (the square with the arrow) › Add to Home Screen. Then open it from the new icon and tap “Install” to download everything so that it works offline.','pwa.h':'Install {N}','pwa.intro':'{N} will be installed on this device as an app, and all the activities, sounds and videos will be downloaded so that it works offline.','pwa.total':'Total space it will take once installed','pwa.video':'Videos','pwa.so':'Sounds, voices and music','pwa.img':'Images','pwa.m3d':'3D models','pwa.codi':'Software and texts','pwa.free':'Space this browser can use on this device: {M}.','pwa.nospace':'There is not enough free space to install {N} on this device.','pwa.slow':'The download may take a few minutes. New versions will update by themselves and only download what has changed.','pwa.partial':'Part of it is already downloaded and will not be downloaded again.','pwa.cancel':'Cancel','pwa.go':'Install ({M})','pwa.calc':'Working out how much space it takes…','pwa.dl':'Downloading the activities, sounds and videos. Keep this window open until it finishes.','pwa.of':'{A} of {B}','pwa.resume':'If it stops, next time it will carry on where it left off.','pwa.stop':'Stop','pwa.ok1':'{N} is installed on this device and works offline.','pwa.ok2':'All the activities are now on this device and work offline.','pwa.hintApp':'If the browser has not shown an install prompt: in Chrome and Edge, use the install icon in the address bar; on iPad and iPhone, Safari › Share › Add to Home Screen.','pwa.used':'Space it takes','pwa.del':'Delete the activities from this device','pwa.app':'Install the app','pwa.ok':'OK','pwa.close':'Close','pwa.retry':'Try again','pwa.eList':'Could not find out what needs downloading. Try again in a while.','pwa.eOff':'An internet connection is needed to install {N}.','pwa.eVer':'A new version of {N} was published while downloading. Try again: it will carry on where it left off.','pwa.eQuota':'There is not enough free space on this device to finish the installation.','pwa.eNet':'Not everything could be downloaded. Try again: it will carry on where it left off.','pwa.eLost':'The connection was lost. Try again when it is back: it will carry on where it left off.','pwa.installed':'Installed','pwa.downloading':'Downloading…','version':'Version','pwa.upd':'Version {V} has been downloaded: you will see it the next time you open the app.'},
fr:{'pwa.ios':'Sur iPad et iPhone, ajoutez d’abord {N} à l’écran d’accueil : touchez Partager (le carré avec la flèche) › Sur l’écran d’accueil. Ouvrez-la ensuite depuis la nouvelle icône et touchez « Installer » pour tout télécharger afin qu’elle fonctionne sans connexion.','pwa.h':'Installer {N}','pwa.intro':'{N} sera installée sur cet appareil comme une application, et toutes les activités, les sons et les vidéos seront téléchargés pour qu’elle fonctionne sans connexion.','pwa.total':'Espace total occupé une fois installée','pwa.video':'Vidéos','pwa.so':'Sons, voix et musique','pwa.img':'Images','pwa.m3d':'Modèles 3D','pwa.codi':'Programme et textes','pwa.free':'Espace que ce navigateur peut utiliser sur cet appareil : {M}.','pwa.nospace':'Il n’y a pas assez d’espace libre pour installer {N} sur cet appareil.','pwa.slow':'Le téléchargement peut prendre quelques minutes. Les nouvelles versions se mettront à jour toutes seules et ne téléchargeront que ce qui a changé.','pwa.partial':'Une partie est déjà téléchargée et ne sera pas téléchargée à nouveau.','pwa.cancel':'Annuler','pwa.go':'Installer ({M})','pwa.calc':'Calcul de l’espace occupé…','pwa.dl':'Téléchargement des activités, des sons et des vidéos. Laissez cette fenêtre ouverte jusqu’à la fin.','pwa.of':'{A} sur {B}','pwa.resume':'S’il s’arrête, la prochaine fois il reprendra là où il s’était arrêté.','pwa.stop':'Arrêter','pwa.ok1':'{N} est installée sur cet appareil et fonctionne sans connexion.','pwa.ok2':'Toutes les activités sont déjà sur cet appareil et fonctionnent sans connexion.','pwa.hintApp':'Si le navigateur n’a affiché aucune invite d’installation : dans Chrome et Edge, utilisez l’icône d’installation de la barre d’adresse ; sur iPad et iPhone, Safari › Partager › Sur l’écran d’accueil.','pwa.used':'Espace occupé','pwa.del':'Supprimer les activités de cet appareil','pwa.app':'Installer l’application','pwa.ok':'D’accord','pwa.close':'Fermer','pwa.retry':'Réessayer','pwa.eList':'Impossible de savoir ce qu’il faut télécharger. Réessayez dans un moment.','pwa.eOff':'Une connexion internet est nécessaire pour installer {N}.','pwa.eVer':'Une nouvelle version de {N} a été publiée pendant le téléchargement. Réessayez : il reprendra là où il s’était arrêté.','pwa.eQuota':'Il n’y a pas assez d’espace libre sur cet appareil pour terminer l’installation.','pwa.eNet':'Tout n’a pas pu être téléchargé. Réessayez : il reprendra là où il s’était arrêté.','pwa.eLost':'La connexion a été perdue. Réessayez quand elle sera revenue : il reprendra là où il s’était arrêté.','pwa.installed':'Installée','pwa.downloading':'Téléchargement…','version':'Version','pwa.upd':'La version {V} a été téléchargée : vous la verrez la prochaine fois que vous ouvrirez l’application.'}};
for(const l in PWA_TX)if(I18N[l])Object.assign(I18N[l],PWA_TX[l]);
const PWA=(()=>{
 const DATA='miraijuga2-fitxers',META='miraijuga2-meta';
 const base=()=>new URL('./',document.baseURI).href;
 const clau=(p,h)=>base()+p+'?pwa='+h;
 const ruta=p=>base()+p.split('/').map(encodeURIComponent).join('/');
 const st={on:false,prompt:null,actiu:null,llista:null,feina:null,progres:null,error:'',obert:false,fase:'info',quota:null,fiSensePrompt:false};
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: minimal-ui)').matches||navigator.standalone===true;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const N=()=>T('title');
 const ios=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const tx=(k,o={})=>T(k).replace(/\{(\w)\}/g,(m,x)=>x==='N'?N():(o[x]!=null?o[x]:m));
 // Mides com les mostra Windows (1 MB = 1024 × 1024 bytes); només els GB porten un decimal.
 function mida(b){const mb=b/1048576,c=LANG==='en'?'.':',';
  if(mb>=1024)return (Math.round(mb/1024*10)/10).toString().replace('.',c)+' GB';
  return (mb<10?Math.max(0.1,Math.round(mb*10)/10):Math.round(mb)).toString().replace('.',c)+' MB'}
 function parts(l){const p={video:0,so:0,img:0,m3d:0,codi:0};
  for(const [path,size] of l.files){const e=path.slice(path.lastIndexOf('.')+1).toLowerCase();
   p[['mp4','webm'].includes(e)?'video':['mp3','ogg','wav','m4a'].includes(e)?'so':['png','webp','jpg','jpeg','svg','gif','avif'].includes(e)?'img':e==='glb'||path.endsWith('.gltf.json')?'m3d':'codi']+=size}
  return p}
 const llegeixActiu=()=>caches.open(META).then(c=>c.match('actiu')).then(r=>r?r.json():null).catch(()=>null);
 // Cada dispositiu només baixa els vídeos que fa servir: WebM amb alfa, o a Safari (iPhone, iPad, Mac) les còpies .sa.mp4.
 function filtra(l){const fora=SAV?/\.webm$/:/\.sa\.mp4$/,files=l.files.filter(f=>!fora.test(f[0]));return {...l,hash:l.hash+(SAV?'s':'w'),files,total:files.reduce((t,f)=>t+f[1],0)}}
 const demanaLlista=()=>fetch(base()+'pwa-fitxers.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('llista '+r.status);return r.json()}).then(filtra);
 function avisaSW(){const m={type:'miraijuga2-actiu'};navigator.serviceWorker.controller?.postMessage(m);navigator.serviceWorker.getRegistration().then(r=>r?.active?.postMessage(m)).catch(()=>{})}
 const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
 function descarrega(l,onPas,senyal){
  return caches.open(DATA).then(c=>c.keys().then(keys=>{
   const tinc=new Set(keys.map(r=>r.url));
   const falten=l.files.filter(([p,,h])=>!tinc.has(new URL(clau(p,h)).href));
   let fet=l.total-falten.reduce((s,f)=>s+f[1],0);onPas(fet,l.total);
   const cua=falten.slice();
   const un=([p,size,h],intent=0)=>fetch(ruta(p)+'?pwa-baixa=1',{cache:'no-cache',signal:senyal}).then(r=>{
     if(!r.ok)throw new Error(p+' '+r.status);
     return r.arrayBuffer().then(buf=>crypto.subtle.digest('SHA-256',buf).then(d=>{
      if(hex(d).slice(0,16)!==h){const e=new Error('versio');e.versio=true;throw e}
      return c.put(clau(p,h),new Response(buf,{headers:{'Content-Type':r.headers.get('content-type')||'application/octet-stream','Content-Length':String(size)}}))}))
    }).catch(e=>{
     if(senyal.aborted||e.versio||e.name==='QuotaExceededError'||intent>=3)throw e;
     return new Promise(ok=>setTimeout(ok,1200*(intent+1))).then(()=>un([p,size,h],intent+1))
    }).then(()=>{fet+=size;onPas(fet,l.total)});
   const fil=()=>cua.length&&!senyal.aborted?un(cua.shift()).then(fil):Promise.resolve();
   return Promise.all(Array.from({length:6},fil));
  })).then(()=>{if(senyal.aborted)throw new DOMException('Aturat','AbortError')})}
 function activa(l){
  const files={};for(const [p,,h] of l.files)files[p]=h;
  const actiu={version:l.version,hash:l.hash,total:l.total,files};
  return caches.open(META).then(c=>c.put('actiu',new Response(JSON.stringify(actiu),{headers:{'Content-Type':'application/json'}}))).then(()=>{
   st.actiu=actiu;avisaSW();estat();
   const vull=new Set(l.files.map(([p,,h])=>new URL(clau(p,h)).href));
   return caches.open(DATA).then(c=>c.keys().then(keys=>Promise.all(keys.filter(r=>!vull.has(r.url)).map(r=>c.delete(r)))))})}
 function sincronitza(l){
  const ctrl=new AbortController();
  st.feina={ctrl,l};st.progres=[0,l.total];st.error='';
  const p=descarrega(l,(f,t)=>{st.progres=[f,t];if(st.obert)pinta()},ctrl.signal).then(()=>activa(l)).finally(()=>{st.feina=null;estat()});
  estat();return p}
 // Estat del botó: amagat si el navegador no pot instal·lar (file://) i dins l'app instal·lada quan ja és completa.
 function estat(){
  const R=document.documentElement;
  const complet=!!(st.actiu&&(!st.llista||st.actiu.hash===st.llista.hash));
  R.classList.toggle('pwa-on',st.on);R.classList.toggle('pwa-app',standalone());R.classList.toggle('pwa-complet',complet&&!st.feina);
  const s=$('#instBtn span');if(s)s.textContent=st.feina?T('pwa.downloading'):st.actiu&&!standalone()&&!st.prompt?T('pwa.installed'):T('install');
  if(st.obert)pinta()}
 function cos(){
  const l=st.llista;
  if(st.error)return `<p class="ierr">${esc(st.error)}</p><div class="iact"><button class="ib" data-a="tanca">${T('pwa.close')}</button><button class="ib p" data-a="va">${T('pwa.retry')}</button></div>`;
  if(!l)return `<p>${T('pwa.calc')}</p>`;
  if(st.feina||st.fase==='baixa'){
   const [f,t]=st.progres||[0,l.total];const pc=t?Math.floor(f/t*100):0;
   return `<p>${T('pwa.dl')}</p><div class="ibar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><span style="width:${pc}%"></span></div>
<p class="ixif"><span>${tx('pwa.of',{A:mida(f),B:mida(t)})}</span><span>${pc} %</span></p>
<div class="iact"><span class="ih">${T('pwa.resume')}</span><button class="ib" data-a="atura">${T('pwa.stop')}</button></div>`}
  const complet=st.actiu&&st.actiu.hash===l.hash;
  if(complet||st.fase==='fet'){
   return `<p class="iok">${standalone()||!st.fiSensePrompt?tx('pwa.ok1'):T('pwa.ok2')}</p>
${st.fiSensePrompt&&!standalone()?`<p class="ih">${T('pwa.hintApp')}</p>`:''}
<div class="itot"><span>${T('pwa.used')}</span><strong>${mida(l.total)}</strong></div>
<div class="iact"><button class="ib" data-a="esborra">${T('pwa.del')}</button>${st.prompt?`<button class="ib" data-a="app">${T('pwa.app')}</button>`:''}<button class="ib p" data-a="tanca">${T('pwa.ok')}</button></div>`}
  const kept=st.actiu?Object.keys(st.actiu.files).length:0;
  const lliure=st.quota?st.quota.quota-st.quota.usage:null;
  const p=parts(l);
  const li=[['pwa.video',p.video],['pwa.so',p.so],['pwa.img',p.img],['pwa.m3d',p.m3d],['pwa.codi',p.codi]].filter(x=>x[1]>0).map(([k,b])=>`<li><span>${T(k)}</span><strong>${mida(b)}</strong></li>`).join('');
  if(ios()&&!standalone())return `<p>${tx('pwa.intro')}</p>
<div class="itot"><span>${T('pwa.total')}</span><strong>${mida(l.total)}</strong></div>
<ul class="iparts">${li}</ul>
<p class="iok">${tx('pwa.ios')}</p>
<div class="iact"><button class="ib p" data-a="tanca">${T('pwa.ok')}</button></div>`;
  return `<p>${tx('pwa.intro')}</p>
<div class="itot"><span>${T('pwa.total')}</span><strong>${mida(l.total)}</strong></div>
<ul class="iparts">${li}</ul>
${lliure!==null?`<p class="ih">${tx('pwa.free',{M:mida(lliure)})}</p>`:''}
${lliure!==null&&lliure<l.total?`<p class="ierr">${tx('pwa.nospace')}</p>`:''}
<p class="ih">${T('pwa.slow')}</p>${kept?`<p class="ih">${T('pwa.partial')}</p>`:''}
<div class="iact"><button class="ib" data-a="tanca">${T('pwa.cancel')}</button><button class="ib p" data-a="va"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${tx('pwa.go',{M:mida(l.total)})}</button></div>`}
 function pinta(){const m=$('#instM');if(!m)return;m.querySelector('h2').textContent=tx('pwa.h');m.querySelector('.ibody').innerHTML=cos()}
 function va(){
  st.error='';const l=st.llista;
  if(!l){pinta();demanaLlista().then(x=>{st.llista=x;estat()}).catch(()=>{st.error=T('pwa.eList');pinta()});return}
  const baixa=()=>{st.fase='baixa';pinta();navigator.storage?.persist?.().catch(()=>{});
   sincronitza(l).then(()=>{st.fase='fet';pinta()}).catch(e=>{st.fase='info';
    if(e.name==='AbortError'){pinta();return}
    st.error=e.versio?tx('pwa.eVer'):e.name==='QuotaExceededError'?T('pwa.eQuota'):navigator.onLine?T('pwa.eNet'):T('pwa.eLost');pinta()})};
  if(st.prompt&&!standalone()){const p=st.prompt;st.prompt=null;p.prompt();
   p.userChoice.then(c=>{if(c.outcome==='accepted')baixa();else{st.fase='info';pinta()}}).catch(baixa)}
  else{st.fiSensePrompt=!standalone();baixa()}}
 function tanca(){st.obert=false;$('#instM').classList.remove('on')}
 function obre(){
  if(!st.on||st.obert)return;st.obert=true;st.fase=st.feina?'baixa':'info';
  $('#instM').classList.add('on');pinta();
  const q=navigator.storage?.estimate?navigator.storage.estimate().then(e=>{st.quota=e}).catch(()=>{}):Promise.resolve();
  Promise.all([demanaLlista(),q]).then(([l])=>{st.llista=l;estat()})
   .catch(()=>{if(!st.llista)st.error=navigator.onLine?T('pwa.eList'):tx('pwa.eOff');estat()})}
 function init(){
  st.on='serviceWorker' in navigator&&'caches' in self&&/^https?:$/.test(location.protocol)&&isSecureContext;
  const m=$('#instM');
  m.addEventListener('click',e=>{if(e.target===m){tanca();return}const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
   if(a==='tanca')tanca();else if(a==='va')va();else if(a==='atura')st.feina?.ctrl.abort();
   else if(a==='app'){const p=st.prompt;st.prompt=null;p?.prompt();p?.userChoice.finally(estat)}
   else if(a==='esborra')Promise.all([caches.delete(DATA),caches.delete(META)]).then(()=>{st.actiu=null;st.fase='info';avisaSW();estat()})});
  $('#instBtn').onclick=e=>{e.stopPropagation();obre()};
  estat();
  if(!st.on)return;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();st.prompt=e;estat()});
  addEventListener('appinstalled',()=>{st.prompt=null;estat()});
  matchMedia('(display-mode: standalone)').addEventListener?.('change',estat);
  navigator.serviceWorker.register('sw.js').catch(()=>{});
  llegeixActiu().then(a=>{st.actiu=a;estat();if(!a)return;
   // Instal·lada: es manté al dia amb la versió publicada, en silenci i només amb els fitxers que han canviat.
   setTimeout(()=>{if(!navigator.onLine||st.feina)return;demanaLlista().then(l=>{st.llista=l;estat();
    if(l.hash!==a.hash)return sincronitza(l).then(()=>{if(l.version&&l.version!==APP_VERSION)toast(tx('pwa.upd',{V:l.version}))})}).catch(()=>{})},6000)})}
 return {init,estat,obre,mida};
})();
