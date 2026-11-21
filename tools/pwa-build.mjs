// Escriu pwa-fitxers.json: la llista de tots els fitxers que l'app instal·lada (PWA) guarda per funcionar sense
// connexió, amb la mida i un hash del contingut. pwa.js mostra el total abans d'instal·lar i descarrega exactament
// aquesta llista; a les versions noves només baixa els fitxers amb el hash canviat. El flux de GitHub Pages l'executa
// abans de publicar, de manera que la llista sempre coincideix amb el que es publica. Ús: node tools/pwa-build.mjs [carpeta]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const DIR=process.argv[2]||'.';
// No formen part de l'app: fonts del muntatge, la mateixa llista, el service worker, l'HTML únic, notes i ocults.
const SKIP=[/^pwa-fitxers\.json$/,/^sw\.js$/,/^MiraiJuga2.*\.html$/,/^index\.tpl\.html$/,/^tools\//,/^fonts_so\//,/\.py$/,/\.md$/,/^VERSION$/,/(^|\/)\./,
 /^(i18n2?|three3|pwa|ones|ous|trenet|jardi|estany|hort|temps|bonanit|rentacotxes|cargols|robots|ombra|parelles|conte)\.js$/,/^(anch|hmask|llama_meta)\.json$/,/^[a-z]+\/(models|textos|hort_models)\.json$/];
const files=[];
(function walk(dir){for(const e of fs.readdirSync(path.join(DIR,dir),{withFileTypes:true})){
 const rel=dir?dir+'/'+e.name:e.name;
 if(SKIP.some(r=>r.test(rel)))continue;
 if(e.isDirectory()){walk(rel);continue;}
 if(!e.isFile())continue;
 const buf=fs.readFileSync(path.join(DIR,rel));
 files.push([rel,buf.length,crypto.createHash('sha256').update(buf).digest('hex').slice(0,16)]);
}})('');
files.sort((a,b)=>a[0]<b[0]?-1:1);
const version=(fs.existsSync(path.join(DIR,'VERSION'))?fs.readFileSync(path.join(DIR,'VERSION'),'utf8'):'').trim();
const total=files.reduce((s,f)=>s+f[1],0);
const hash=crypto.createHash('sha256').update(files.map(f=>f[0]+' '+f[2]).join('\n')).digest('hex').slice(0,16);
fs.writeFileSync(path.join(DIR,'pwa-fitxers.json'),JSON.stringify({version,hash,total,files}));
console.log('pwa-fitxers.json',version,files.length,'fitxers',(total/1048576).toFixed(1),'MB');
