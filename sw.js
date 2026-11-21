// Mira i Juga 2 · service worker. Només serveix fitxers un cop s'ha instal·lat l'app des del botó «Instal·lar»:
// pwa.js (a la pàgina) descarrega tots els fitxers de pwa-fitxers.json a la memòria cau «miraijuga2-fitxers», amb clau
// camí + hash del contingut, i després desa la llista completada a «miraijuga2-meta/actiu». Fins que aquesta llista
// existeix, el worker deixa anar totes les peticions a la xarxa: visitar la web no descarrega res de més.
// Les descàrregues de pwa.js porten ?pwa-baixa=1 i sempre van a la xarxa. Les peticions de vídeo i àudio amb capçalera
// Range reben el tros demanat (206), o <video>/<audio> no es reproduirien. (Mateix funcionament que Pim Pam.)
const DATA='miraijuga2-fitxers',META='miraijuga2-meta';
let actiu; // undefined = encara no llegit, null = no instal·lada, {version,files:{camí:hash}}
const scope=()=>self.registration.scope;
const clau=(p,h)=>scope()+p+'?pwa='+h;
async function llegeixActiu(){
 if(actiu!==undefined)return actiu;
 try{const r=await (await caches.open(META)).match('actiu');actiu=r?await r.json():null;}catch{actiu=null;}
 return actiu;
}
self.addEventListener('install',()=>self.skipWaiting());
// Esborra les memòries cau de la versió antiga del service worker (miraijuga2-v1).
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('miraijuga2-v')).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='miraijuga2-actiu'){actiu=undefined;e.waitUntil(llegeixActiu());}});
function camiDe(url){
 const s=scope();if(!url.startsWith(s))return null;
 let p=decodeURIComponent(url.slice(s.length).split('#')[0].split('?')[0]);
 if(p===''||p.endsWith('/'))p+='index.html';
 return p;
}
async function talla(req,r){
 const range=req.headers.get('range');if(!range)return r;
 const m=/bytes=(\d*)-(\d*)/.exec(range);if(!m)return r;
 const blob=await r.blob();const len=blob.size;
 let a,b;if(m[1]===''){a=Math.max(0,len-Number(m[2]));b=len-1;}else{a=Number(m[1]);b=m[2]===''?len-1:Math.min(len-1,Number(m[2]));}
 if(a>=len||a>b)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${len}`}});
 return new Response(blob.slice(a,b+1),{status:206,statusText:'Partial Content',headers:{
  'Content-Type':r.headers.get('content-type')||'application/octet-stream','Content-Range':`bytes ${a}-${b}/${len}`,
  'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}});
}
async function respon(req,path){
 const a=await llegeixActiu();
 const hash=a&&a.files[path];
 if(hash){
  const r=await (await caches.open(DATA)).match(clau(path,hash));
  if(r)return talla(req,r);
 }
 return fetch(req);
}
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||actiu===null)return;
 const path=camiDe(req.url);
 if(!path||path==='sw.js'||path==='pwa-fitxers.json'||req.url.includes('pwa-baixa='))return;
 e.respondWith(respon(req,path));
});
