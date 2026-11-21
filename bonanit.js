/* =========================================================
   ESCENARI: BONA NIT, ANIMALS
   Al turó de l'alzina es fa fosc i sis animals de peluix de vellut (3D, fets amb Blender) juguen als seus llitets
   (ós = tronc buit, liró = closca de nou, cervatell = falgueres, llúdriga = petxina, ratolí = mitjó, marmota = cistell).
   El fons és la risografia de Marc (vespre/alba i nit, fosos per codi); estrelles, lluna, halos i rètols en 2D.
   «A dormir!»: mirar un animal gronxa el seu llitet; cada gronxada és la nota següent de la nana (vibràfon). A les
     3 gronxades (cadascuna amb el temps de selecció complet) badalla, s'ajeu, es tapa amb la manta, el fanalet s'apaga i dorm. Mirar-lo adormit el fa somriure.
     Mida petita: + el grill (2 gronxades) i el ratpenat penjat de la branca (es desperta, saluda i se'n va volant).
     Tots adormits: nana sencera, cuques de llum, la lluna somriu; després l'alba, es desperten i ronda nova.
   «Dibuixa els somnis»: un animal dorm i del seu cap surt una bombolla; cal mirar les estrelles en ordre (3/5/8)
     i, en acabar, el dibuix del somni s'omple i es mou. Cada 3 somnis, pluja d'estels i alba.
   Ajuda: als 6 s brilla el que toca; als 12 s la Lluerna (cuca de llum) hi vola. Sense error ni flaixos.
   ========================================================= */
const BONANIT=(()=>{
  const TX={
    ca:{m1:'A dormir!',m2:'Dibuixa els somnis',fosc:'Es fa fosc… Anem a dormir!',bn_os:'Bona nit, ós!',bn_liro:'Bona nit, liró!',bn_cervatell:'Bona nit, cervatell!',bn_lludriga:'Bona nit, llúdriga!',bn_ratoli:'Bona nit, ratolí!',bn_marmota:'Bona nit, marmota!',bn_grill:'Bona nit, grill!',ratpenat:'El ratpenat es desperta: és de nit!',tots:'Tothom dorm. Bona nit!',bondia:'Bon dia!',somnis:'Què somien els animals?',somia:'Què somia ara?',estrella:"Mira l'estrella.",somni:'Quin somni més bonic!',estels:"Una pluja d'estels!"},
    es:{m1:'¡A dormir!',m2:'Dibuja los sueños',fosc:'Se hace de noche… ¡Vamos a dormir!',bn_os:'¡Buenas noches, oso!',bn_liro:'¡Buenas noches, lirón!',bn_cervatell:'¡Buenas noches, cervatillo!',bn_lludriga:'¡Buenas noches, nutria!',bn_ratoli:'¡Buenas noches, ratón!',bn_marmota:'¡Buenas noches, marmota!',bn_grill:'¡Buenas noches, grillo!',ratpenat:'El murciélago se despierta: ¡es de noche!',tots:'Todos duermen. ¡Buenas noches!',bondia:'¡Buenos días!',somnis:'¿Qué sueñan los animales?',somia:'¿Qué sueña ahora?',estrella:'Mira la estrella.',somni:'¡Qué sueño más bonito!',estels:'¡Una lluvia de estrellas!'},
    eu:{m1:'Lotara!',m2:'Marraztu ametsak',fosc:'Iluntzen ari du… Goazen lotara!',bn_os:'Gabon, hartz!',bn_liro:'Gabon, muxar!',bn_cervatell:'Gabon, orein-kume!',bn_lludriga:'Gabon, igaraba!',bn_ratoli:'Gabon, sagu!',bn_marmota:'Gabon, marmota!',bn_grill:'Gabon, kilker!',ratpenat:'Saguzarra esnatu da: gaua da!',tots:'Denak lotan daude. Gabon!',bondia:'Egun on!',somnis:'Zer amesten dute animaliek?',somia:'Zer amesten du orain?',estrella:'Begiratu izarrari.',somni:'Zer amets polita!',estels:'Izar iheskorren euria!'},
    gl:{m1:'A durmir!',m2:'Debuxa os soños',fosc:'Vaise facendo de noite… Imos durmir!',bn_os:'Boas noites, oso!',bn_liro:'Boas noites, leirón!',bn_cervatell:'Boas noites, cervato!',bn_lludriga:'Boas noites, lontra!',bn_ratoli:'Boas noites, rato!',bn_marmota:'Boas noites, marmota!',bn_grill:'Boas noites, grilo!',ratpenat:'O morcego esperta: é de noite!',tots:'Todos dormen. Boas noites!',bondia:'Bos días!',somnis:'Que soñan os animais?',somia:'Que soña agora?',estrella:'Mira a estrela.',somni:'Que soño máis bonito!',estels:'Unha chuvia de estrelas!'},
    en:{m1:'Time for bed!',m2:'Draw the dreams',fosc:"It's getting dark… Time for bed!",bn_os:'Good night, bear!',bn_liro:'Good night, dormouse!',bn_cervatell:'Good night, little deer!',bn_lludriga:'Good night, otter!',bn_ratoli:'Good night, mouse!',bn_marmota:'Good night, marmot!',bn_grill:'Good night, cricket!',ratpenat:"The bat wakes up: it's night-time!",tots:"Everyone's asleep. Good night!",bondia:'Good morning!',somnis:'What do the animals dream about?',somia:"What's the next dream?",estrella:'Look at the star.',somni:'What a lovely dream!',estels:'A shower of shooting stars!'},
    fr:{m1:'Au lit !',m2:'Dessine les rêves',fosc:'Il commence à faire nuit… Allons dormir !',bn_os:'Bonne nuit, petit ours !',bn_liro:'Bonne nuit, petit loir !',bn_cervatell:'Bonne nuit, petit faon !',bn_lludriga:'Bonne nuit, petite loutre !',bn_ratoli:'Bonne nuit, petite souris !',bn_marmota:'Bonne nuit, petite marmotte !',bn_grill:'Bonne nuit, petit grillon !',ratpenat:"La chauve-souris se réveille : c'est la nuit !",tots:'Tout le monde dort. Bonne nuit !',bondia:'Bonjour !',somnis:'À quoi rêvent les animaux ?',somia:'Quel est son rêve ?',estrella:"Regarde l'étoile.",somni:'Quel joli rêve !',estels:"Une pluie d'étoiles filantes !"}};
  for(const l in TX)if(I18N[l])for(const k in TX[l])I18N[l]['nit.'+k]=TX[l][k];
  const IX=__BNIX__;
  const AN=['os','liro','cervatell','lludriga','ratoli','marmota'];
  const RATE={os:.82,liro:1.22,cervatell:1.06,lludriga:1,ratoli:1.32,marmota:.94,grill:1.4};   // to del badall i del ronc
  const DREAM={os:'mel',liro:'gla',cervatell:'poma',lludriga:'peix',ratoli:'formatge',marmota:'maduixa'};
  /* ───── dibuixos dels somnis (vectorials, escala uniforme, contorn fosc per llegir-se bé sobre el cel) ─────
     coordenades d'unitat (y cap avall); p = contorn on van les estrelles, en ordre, començant per la primera estrella */
  const INK='#231b4a';
  const DRW=(()=>{
    const P=(c,s)=>{const t=s.trim().split(/[\s,]+/);c.beginPath();let i=0;
      while(i<t.length){const k=t[i++];const n=()=>+t[i++];
        if(k==='M')c.moveTo(n(),n());else if(k==='L')c.lineTo(n(),n());else if(k==='Q')c.quadraticCurveTo(n(),n(),n(),n());
        else if(k==='C')c.bezierCurveTo(n(),n(),n(),n(),n(),n());else if(k==='Z')c.closePath()}};
    const E=(c,x,y,rx,ry,a=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,a,0,7)};
    const F=(c,col)=>{c.fillStyle=col;c.fill()},S=(c,col,w)=>{c.strokeStyle=col;c.lineWidth=w;c.stroke()};
    const clipTo=(c,path,fn)=>{c.save();P(c,path);c.clip();fn();c.restore()};
    const B={
      poma:'M 0 -0.50 C 0.22 -0.72 0.62 -0.80 0.84 -0.52 C 1.04 -0.24 0.98 0.30 0.76 0.62 C 0.58 0.88 0.32 0.98 0.14 0.90 C 0.07 0.87 -0.07 0.87 -0.14 0.90 C -0.32 0.98 -0.58 0.88 -0.76 0.62 C -0.98 0.30 -1.04 -0.24 -0.84 -0.52 C -0.62 -0.80 -0.22 -0.72 0 -0.50 Z',
      maduixa:'M 0 -0.50 C 0.38 -0.68 0.86 -0.64 0.88 -0.22 C 0.90 0.20 0.48 0.70 0.07 0.95 Q 0 0.99 -0.07 0.95 C -0.48 0.70 -0.90 0.20 -0.88 -0.22 C -0.86 -0.64 -0.38 -0.68 0 -0.50 Z',
      peix:'M -0.98 0.04 C -0.80 -0.42 -0.30 -0.62 0.12 -0.50 C 0.36 -0.42 0.50 -0.22 0.56 -0.06 L 0.56 0.06 C 0.50 0.22 0.36 0.42 0.12 0.50 C -0.30 0.62 -0.80 0.46 -0.98 0.04 Z',
      gla:'M -0.50 -0.24 C -0.58 0.28 -0.30 0.74 0 0.96 C 0.30 0.74 0.58 0.28 0.50 -0.24 Z',
      glaCap:'M -0.68 -0.16 C -0.74 -0.60 -0.36 -0.82 0 -0.82 C 0.36 -0.82 0.74 -0.60 0.68 -0.16 C 0.40 -0.04 -0.40 -0.04 -0.68 -0.16 Z',
      mel:'M -0.50 -0.42 C -0.98 -0.30 -1.00 0.50 -0.62 0.80 C -0.32 1.00 0.32 1.00 0.62 0.80 C 1.00 0.50 0.98 -0.30 0.50 -0.42 Z',
      fTop:'M -0.95 0.04 L 0.60 -0.62 Q 0.90 -0.52 0.95 -0.22 Z',
      fFront:'M -0.95 0.04 L 0.95 -0.22 L 0.95 0.40 L -0.95 0.64 Z'};
    const SH={
      poma:{c:'#e2564b',k:1,p:[[0,-.52],[.55,-.74],[.93,-.36],[.92,.22],[.64,.74],[.16,.91],[-.16,.91],[-.64,.74],[-.92,.22],[-.93,-.36],[-.55,-.74]]},
      maduixa:{c:'#e8445a',k:1,p:[[0,-.55],[.5,-.66],[.88,-.30],[.74,.24],[.36,.70],[0,.97],[-.36,.70],[-.74,.24],[-.88,-.30],[-.5,-.66]]},
      peix:{c:'#5aa9e6',k:1.04,p:[[-.98,.04],[-.55,-.45],[.1,-.56],[.98,-.52],[.98,.52],[.1,.56],[-.55,.45]]},
      gla:{c:'#c98a4a',k:1,p:[[0,-.82],[.5,-.66],[.7,-.18],[.48,.36],[.22,.78],[0,.98],[-.22,.78],[-.48,.36],[-.7,-.18],[-.5,-.66]]},
      formatge:{c:'#f6c843',k:1,p:[[-.95,.04],[.6,-.62],[.95,-.22],[.95,.40],[-.95,.64]]},
      mel:{c:'#f2b33d',k:1,p:[[-.6,-.56],[.6,-.56],[.92,-.05],[.84,.55],[.42,.93],[-.42,.93],[-.84,.55],[-.92,-.05]]}};
    function poma(c,L){
      P(c,'M 0.00 -0.46 Q 0.02 -0.80 0.14 -1.00');S(c,'#6b4226',.085);
      P(c,'M 0.10 -0.80 C 0.24 -1.04 0.56 -1.04 0.70 -0.90 C 0.52 -0.70 0.26 -0.68 0.10 -0.80 Z');F(c,'#6cbf5a');S(c,INK,L);
      P(c,'M 0.14 -0.81 Q 0.40 -0.90 0.62 -0.89');S(c,'#3f8a45',L*.7);
      P(c,B.poma);F(c,'#e2564b');
      clipTo(c,B.poma,()=>{E(c,.55,.45,.75,.85);F(c,'#c23d45');E(c,-.45,-.28,.13,.28,-.45);F(c,'rgba(255,236,220,.75)');E(c,-.6,.08,.05,.07);F(c,'rgba(255,236,220,.6)')});
      P(c,B.poma);S(c,INK,L)}
    function maduixa(c,L){
      P(c,B.maduixa);F(c,'#e8445a');
      clipTo(c,B.maduixa,()=>{E(c,.5,.4,.7,.9);F(c,'#c42f4b');E(c,-.42,-.18,.12,.24,-.5);F(c,'rgba(255,230,230,.55)');
        const hw=y=>y<-.3?.86:y<.2?.86-(y+.3)*.48:y<.6?.62-(y-.2)*.8:.3-(y-.6)*.7;
        for(let r=0;r<6;r++){const y=-.32+r*.21;for(let x=-.9+(r%2)*.13;x<.9;x+=.26){if(Math.abs(x)>hw(y)-.13)continue;
          E(c,x,y,.035,.06,x*.5);F(c,'#ffe08a');E(c,x+.012,y+.02,.012,.02);F(c,'rgba(120,40,40,.35)')}}});
      P(c,B.maduixa);S(c,INK,L);
      P(c,'M 0 -0.58 Q 0.02 -0.78 0.08 -0.92');S(c,'#3f8a45',.07);
      const cx=0,cy=-.57,leaf=(t,w)=>{const dx=t[0]-cx,dy=t[1]-cy,m=[(cx+t[0])/2,(cy+t[1])/2];c.beginPath();c.moveTo(cx,cy);
        c.quadraticCurveTo(m[0]-dy*w,m[1]+dx*w,t[0],t[1]);c.quadraticCurveTo(m[0]+dy*w,m[1]-dx*w,cx,cy);c.closePath();F(c,'#5fb35a');S(c,INK,L*.8)};
      for(const t of [[-.42,-.86],[.42,-.86]])leaf(t,.32);
      for(const t of [[-.80,-.50],[.80,-.50],[-.58,-.24],[.58,-.24],[-.2,-.14],[.2,-.14]])leaf(t,.3);
      E(c,0,-.57,.08,.06);F(c,'#4a9a4a');S(c,INK,L*.7)}
    function peix(c,L,w){const fl=Math.sin(w*7)*.06;
      P(c,`M 0.48 0 C 0.62 -0.18 0.80 ${-.40+fl} 0.99 ${-.54+fl} C 0.90 -0.20 0.90 0.20 0.99 ${.54+fl} C 0.80 ${.40+fl} 0.62 0.18 0.48 0 Z`);F(c,'#f08a6c');S(c,INK,L);
      P(c,'M -0.34 -0.52 C -0.22 -0.80 0.08 -0.82 0.22 -0.48 Z');F(c,'#f08a6c');S(c,INK,L);
      P(c,'M -0.12 0.52 C -0.04 0.74 0.12 0.74 0.18 0.48 Z');F(c,'#f08a6c');S(c,INK,L);
      P(c,B.peix);F(c,'#5aa9e6');
      clipTo(c,B.peix,()=>{E(c,-.2,.42,.95,.26);F(c,'#a9dcf7');
        c.strokeStyle='rgba(35,27,74,.35)';c.lineWidth=L*.6;for(const [x,y] of [[-.2,-.2],[.05,-.28],[.05,.0],[.3,-.12],[-.2,.08],[.3,.14]]){c.beginPath();c.arc(x,y,.12,-1.2,1.2);c.stroke()}
        c.beginPath();c.arc(-.68,0,.36,-1,1);S(c,INK,L*.8)});
      P(c,B.peix);S(c,INK,L);
      P(c,'M -0.28 0.10 Q -0.02 0.02 0.04 0.28 Q -0.16 0.32 -0.28 0.10 Z');F(c,'#f6a88f');S(c,INK,L*.7);
      E(c,-.64,-.12,.13,.13);F(c,'#fff');S(c,INK,L*.7);E(c,-.66,-.11,.07,.07);F(c,INK);E(c,-.69,-.14,.025,.025);F(c,'#fff');
      P(c,'M -0.97 0.10 Q -0.90 0.16 -0.84 0.12');S(c,INK,L*.7)}
    function gla(c,L){
      P(c,B.gla);F(c,'#c98a4a');
      clipTo(c,B.gla,()=>{E(c,.42,.35,.55,.8);F(c,'#a9703a');E(c,-.22,.18,.09,.28,.15);F(c,'rgba(255,240,220,.55)')});
      P(c,B.gla);S(c,INK,L);P(c,'M 0 0.94 L 0 1.06');S(c,INK,L*1.2);
      P(c,B.glaCap);F(c,'#8a5a33');
      clipTo(c,B.glaCap,()=>{c.strokeStyle='#6a4224';c.lineWidth=L*.8;for(let d=-1.6;d<1.6;d+=.15){c.beginPath();c.moveTo(d,-.9);c.lineTo(d+.9,0);c.stroke();c.beginPath();c.moveTo(d,-.9);c.lineTo(d-.9,0);c.stroke()}
        E(c,-.32,-.5,.16,.08,-.4);F(c,'rgba(255,230,200,.25)')});
      P(c,B.glaCap);S(c,INK,L);P(c,'M 0 -0.80 Q 0.02 -0.94 0.12 -1.02');S(c,'#5c3a20',.09)}
    function formatge(c,L){
      P(c,B.fFront);F(c,'#f2bd36');P(c,B.fTop);F(c,'#ffdd6a');
      clipTo(c,B.fFront,()=>{c.fillStyle='#e0962a';c.beginPath();c.rect(.83,-.4,.3,1.2);c.fill();
        for(const [x,y,rx,ry] of [[-.5,.36,.1,.08],[.0,.2,.14,.11],[.46,.28,.09,.08],[.28,.42,.05,.045],[-.18,.44,.05,.05],[-.15,-.06,.11,.09]]){E(c,x,y,rx,ry);F(c,'#c98a1e');E(c,x+rx*.2,y+ry*.25,rx*.75,ry*.7);F(c,'#e5a92c')}});
      clipTo(c,B.fTop,()=>{c.fillStyle='#e9a933';P(c,'M 0.60 -0.62 Q 0.90 -0.52 0.95 -0.22 L 0.86 -0.20 Q 0.82 -0.48 0.56 -0.55 Z');c.fill();
        for(const [x,y,rx,ry] of [[.3,-.3,.11,.05],[-.3,-.12,.08,.035],[.62,-.36,.05,.025]]){E(c,x,y,rx,ry);F(c,'#d99d2a')}});
      P(c,B.fFront);S(c,INK,L);P(c,B.fTop);S(c,INK,L)}
    function mel(c,L,w){
      P(c,'M 0.16 -0.50 L 0.70 -1.02');S(c,INK,.12);P(c,'M 0.16 -0.50 L 0.70 -1.02');S(c,'#b07a4a',.08);E(c,.72,-1.04,.07,.07);F(c,'#b07a4a');S(c,INK,L*.7);
      P(c,B.mel);F(c,'#c7783a');
      clipTo(c,B.mel,()=>{E(c,.5,.45,.7,.75);F(c,'#a85f2c');c.fillStyle='#e6a15c';c.fillRect(-1,.12,2,.16);E(c,-.5,0,.1,.24,.2);F(c,'rgba(255,230,200,.35)')});
      P(c,B.mel);S(c,INK,L);
      c.beginPath();c.roundRect(-.64,-.62,1.28,.22,.08);F(c,'#d88a48');S(c,INK,L);
      P(c,'M -0.64 -0.50 L 0.64 -0.50 L 0.64 -0.42 Q 0.60 -0.18 0.52 -0.18 Q 0.44 -0.18 0.42 -0.40 Q 0.30 -0.34 0.20 -0.36 Q 0.16 0.06 0.06 0.08 Q -0.04 0.08 -0.06 -0.30 Q -0.20 -0.38 -0.30 -0.36 Q -0.34 -0.04 -0.42 -0.04 Q -0.52 -0.04 -0.52 -0.38 Q -0.60 -0.40 -0.64 -0.42 Z');F(c,'#f6b93b');S(c,INK,L*.8);
      E(c,0,-.6,.6,.07);F(c,'#ffd36b');E(c,-.25,-.4,.04,.08);F(c,'rgba(255,255,255,.6)');
      const bx=-.72+Math.cos(w*2.2)*.12,by=-.78+Math.sin(w*4.4)*.08;c.save();c.translate(bx,by);
      c.setLineDash([.04,.05]);c.beginPath();c.arc(.2,.16,.2,2.4,4.4);S(c,'rgba(255,240,200,.7)',L*.6);c.setLineDash([]);
      E(c,-.04,-.13,.08,.12,-.5);F(c,'rgba(255,255,255,.85)');S(c,INK,L*.5);E(c,.06,-.13,.08,.12,.5);F(c,'rgba(255,255,255,.85)');S(c,INK,L*.5);
      E(c,0,0,.17,.11);F(c,'#ffd23f');c.save();E(c,0,0,.17,.11);c.clip();c.fillStyle=INK;c.fillRect(-.06,-.2,.05,.4);c.fillRect(.05,-.2,.05,.4);c.restore();E(c,0,0,.17,.11);S(c,INK,L*.7);
      E(c,-.12,-.02,.02,.02);F(c,INK);c.restore()}
    const FN={poma,maduixa,peix,gla,formatge,mel};
    const ghost={poma:B.poma,maduixa:B.maduixa,peix:B.peix,formatge:'M -0.95 0.04 L 0.60 -0.62 Q 0.90 -0.52 0.95 -0.22 L 0.95 0.40 L -0.95 0.64 Z',
      gla:'M 0 -0.82 C 0.36 -0.82 0.74 -0.60 0.68 -0.16 L 0.50 -0.18 C 0.58 0.28 0.30 0.74 0 0.96 C -0.30 0.74 -0.58 0.28 -0.50 -0.18 L -0.68 -0.16 C -0.74 -0.60 -0.36 -0.82 0 -0.82 Z',
      mel:'M -0.64 -0.62 L 0.64 -0.62 L 0.64 -0.40 L 0.50 -0.42 C 0.98 -0.30 1.00 0.50 0.62 0.80 C 0.32 1.00 -0.32 1.00 -0.62 0.80 C -1.00 0.50 -0.98 -0.30 -0.50 -0.42 L -0.64 -0.40 Z'};
    return{SH,
      draw(c,k,x,y,s,w,a){c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=a;c.lineCap='round';c.lineJoin='round';FN[k](c,4.5/s,w);c.restore()},
      ghost(c,k,x,y,s,a){c.save();c.translate(x,y);c.scale(s,s);P(c,ghost[k]);c.globalAlpha*=a;c.fillStyle='rgba(217,214,255,.10)';c.fill();
        c.setLineDash([10/s,12/s]);c.strokeStyle='rgba(217,214,255,.55)';c.lineWidth=3/s;c.stroke();c.restore()}}})();
  const SHAPE=DRW.SH;
  /* llitets: posició de la base a 1280×720 i escala (1 = P píxels per unitat); mida petita: + grill i ratpenat */
  const SIZES=[{k:1,pos:[[270,612],[640,612],[1000,612]],stars:3,r:70},
    {k:.8,pos:[[420,482],[860,482],[230,654],[640,654],[1040,654]],stars:5,r:55},
    {k:.65,pos:[[262,470],[525,470],[1060,470],[140,654],[385,654],[665,654],[900,654]],stars:8,r:42,bat:[800,276]}];
  const M2BED=[255,668],CX=665,CY=292,SD=130;          // mode 2: llit a baix a l'esquerra i constel·lació al cel
  /* la nana en fa major (una nota per gronxada; la mateixa que la música); notes de les estrelles: fa pentatònic */
  const MEL=[440,523.25,440,349.23,392,440,466.16,440,392,349.23,392,440,523.25,587.33,523.25,440,392,440,392,349.23,329.63,349.23,392,349.23];
  const STARF=[698.46,783.99,880,1046.5,1174.66,1396.91,1567.98,1760];
  const P=200,PIT=18*Math.PI/180,SP=Math.sin(PIT),CP=Math.cos(PIT),HELP=6,MOON=[230,175];
  const LOOPS=new Set(['repos','jugar','son','dormir','volar','cantar']);
  const OX_RAT=.34;                                             // el mitjó del ratolí surt cap a l'esquerra: es desplaça perquè quedi centrat
  let R=null,S3,cam,cvs=null,fgc=null,fx=null,on=false,ready=false,lq=null,MODE=0,ENV=null,amb,sun,ROOT,VAR=null,loading=0;
  const PROTO={},CL={},MX={},MAT={},TXS={},IM={},GOT={};
  let st=null,now=0,cur=null,dw=0,idle=0,acts=0,wait=[],fxp=[],melI=0,helpSaid=false,LL=null,BAT=null,stars=[];
  const VB={};let vSrc=null,vQ=[],vTok=0;
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lerp=(a,b,t)=>a+(b-a)*t;
  const V1=new THREE.Vector3(),V2=new THREE.Vector3();

  function init(){if(R)return;
    if(!LOWQ)try{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl'),e=g&&g.getExtension('WEBGL_debug_renderer_info'),
        r=e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):'',l=g&&g.getExtension('WEBGL_lose_context');if(l)l.loseContext();
      if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)){LOWQ=true;window.dispatchEvent(new Event('resize'));syncOpts()}}catch(_){}
    cvs=document.createElement('canvas');cvs.id='c3n';cvs.style.cssText='position:fixed;left:0;top:0;pointer-events:none;display:none';cv.after(cvs);
    fgc=document.createElement('canvas');fgc.id='c3nf';fgc.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';cvs.after(fgc);fx=fgc.getContext('2d');
    R=new THREE.WebGLRenderer({canvas:cvs,antialias:!LOWQ,alpha:true,powerPreference:'high-performance'});R.setClearColor(0,0);
    R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1;
    S3=new THREE.Scene();cam=new THREE.OrthographicCamera(-W/2/P,W/2/P,H/2/P,-H/2/P,-80,140);cam.position.set(0,20*SP,20*CP);cam.lookAt(0,0,0);
    amb=new THREE.AmbientLight(0xffffff,.38);sun=new THREE.DirectionalLight(0xffffff,1.15);sun.position.set(-3,5,6);S3.add(amb,sun);
    ROOT=new THREE.Group();S3.add(ROOT);
    for(const k of ['fons','fons_alba'])IM[k]=img('bonanit/'+k+'.webp');
    for(let i=0;i<70;i++)stars.push({x:rnd(10,W-10),y:rnd(8,330),r:rnd(.7,1.9),p:rnd(0,6)});
    loadSet(['lluerna','ratpenat','grill','fulla']);loadVar();resize()}
  /* càrrega: els bitxos una vegada; animals i llits en la variant que toca (completa o lleugera, «_ll» en mode ràpid) */
  function loadSet(keys,done){const L=new GLTFLoader();let n=keys.filter(k=>!GOT[k]).length;if(!n){if(done)done();return}loading++;
    for(const k of keys){if(GOT[k])continue;GOT[k]=1;
      L.load(U('bonanit/m/'+k+'.glb'),g=>{PROTO[k]=g.scene;CL[k]={};for(const c of g.animations)CL[k][c.name]=c;if(g.animations.length)MX[k]=new THREE.AnimationMixer(g.scene);
        g.scene.traverse(o=>{if(o.isMesh){o.userData.mn=o.material&&o.material.name;o.frustumCulled=false}});if(ready||k.length)paint(g.scene,k);
        if(--n===0){loading--;if(done)done()}},undefined,e=>{console.error(e);if(--n===0){loading--;if(done)done()}})}}
  function loadVar(){const v=LOWQ?'_ll':'';if(VAR===v&&ready)return;const keys=[];for(const a of AN)keys.push(a+v,'llit_'+a+v);
    loadSet(keys,()=>{if((LOWQ?'_ll':'')!==v)return;const first=!ready;VAR=v;
      if(PROTO.lluerna&&PROTO.ratpenat&&PROTO.grill&&PROTO.fulla){ready=true;quality();if(on){if(first||!st)newGame();else rebuild()}}
      else setTimeout(()=>{VAR=null;loadVar()},120)})}
  function resize(){if(!R)return;const pr=Math.min(devicePixelRatio||1,2)*(LOWQ?.6:1);R.setPixelRatio(1);R.setSize(Math.max(2,Math.round(W*SC*pr)),Math.max(2,Math.round(H*SC*pr)),false);
    Object.assign(cvs.style,{left:OX+'px',top:OY+'px',width:W*SC+'px',height:H*SC+'px'});if(fgc){fgc.width=cv.width;fgc.height=cv.height}}
  {const prev=window.__onesResize;window.__onesResize=()=>{if(prev)prev();resize()}}

  /* ───── materials pel prefix del nom (provats a blender/test_three): alta = vellut amb sheen i relleu; ràpid = Lambert/Phong ───── */
  function tx(n,srgb){const k=n+(srgb?'':'|n');if(TXS[k])return TXS[k];const t=new THREE.TextureLoader().load(U('bonanit/t/'+n+'.webp'));t.flipY=false;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return TXS[k]=t}
  function mk(name,key){const mi=IX[key]||{},kind=name.split('_')[0],T=mi.tex||key,D=THREE.DoubleSide,V=(a,b)=>new THREE.Vector2(a,b);
    if(kind==='llum')return mi.tipus==='llit'?new THREE.MeshBasicMaterial({color:0xfff2c4}):new THREE.MeshBasicMaterial({map:tx(T+'_color',true)});
    const c=tx(T+'_color',true),nm=(!LOWQ&&mi.normal)?tx(T+'_normal',false):null;
    if(kind==='ala')return new THREE.MeshLambertMaterial({map:c,transparent:true,opacity:.55,side:D,depthWrite:false});
    if(LOWQ){if(kind==='llis')return new THREE.MeshPhongMaterial({map:c,shininess:90,specular:0x555555});return new THREE.MeshLambertMaterial({map:c,side:kind==='manta'?D:THREE.FrontSide})}
    if(kind==='pelfa')return new THREE.MeshPhysicalMaterial({map:c,normalMap:nm,normalScale:V(.5,-.5),roughness:.95,metalness:0,sheen:.5,sheenRoughness:.45,sheenColor:new THREE.Color(1,.82,.66),envMap:ENV,envMapIntensity:.22});
    if(kind==='llit')return new THREE.MeshStandardMaterial({map:c,normalMap:nm,normalScale:V(.8,-.8),roughness:.9,metalness:0,envMap:ENV,envMapIntensity:.22});
    if(kind==='manta')return new THREE.MeshPhysicalMaterial({map:c,normalMap:nm,normalScale:V(.8,-.8),roughness:.95,metalness:0,sheen:.4,sheenRoughness:.5,sheenColor:new THREE.Color(1,.9,.8),envMap:ENV,envMapIntensity:.22,side:D});
    return new THREE.MeshStandardMaterial({map:c,roughness:.16,metalness:0,envMap:ENV,envMapIntensity:.9})}
  const M=(name,key)=>{const k=name+'|'+(IX[key]||{}).tex+'|'+((IX[key]||{}).tipus||'');return MAT[k]||(MAT[k]=mk(name,key))};
  function paint(o,key){o.traverse(n=>{if(n.isMesh&&n.userData.mn)n.material=M(n.userData.mn,key)})}
  function quality(){if(!R)return;lq=LOWQ;for(const k in MAT){MAT[k].dispose();delete MAT[k]}
    if(!LOWQ&&!ENV){const pm=new THREE.PMREMGenerator(R);ENV=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}
    for(const k in TXS){const t=TXS[k];t.anisotropy=LOWQ?1:4;t.minFilter=LOWQ?THREE.LinearMipmapNearestFilter:THREE.LinearMipmapLinearFilter;if(t.image)t.needsUpdate=true}
    for(const k in PROTO)paint(PROTO[k],k);if(st)for(const b of st.beds)if(b.lampM)b.lampM=findLamp(b);
    if((LOWQ?'_ll':'')!==VAR)loadVar()}
  function lights(){const n=st?ease(st.night):0;amb.color.setRGB(lerp(1,.62,n),lerp(1,.68,n),lerp(1,.92,n));sun.color.setRGB(lerp(1,.78,n),lerp(1,.84,n),1);
    amb.intensity=lerp(LOWQ?1.05:.38,LOWQ?.9:.5,n);sun.intensity=lerp(LOWQ?1.4:1.15,LOWQ?1:.85,n)}

  /* ───── pantalla (px) ↔ món ───── */
  const gpos=(v,px,py)=>v.set((px-640)/P,0,(py-360)/(P*SP));
  const placeV=(v,px,py,by)=>v.set((px-640)/P,(by-py)/(CP*P),(by-360)/(P*SP));
  const proj=v=>[640+v.x*P,360+v.z*SP*P-v.y*CP*P];
  function later(t,f){wait.push({t:now+t,f})}
  function sz(){return SIZES[CFG.size]}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function cap(k,d=3){if(st)st.cap={k,d}}

  /* ───── veus (ElevenLabs, xiuxiuejades: bonanit/v/<idioma>_<clau>.mp3; si no hi són, no sona res) ───── */
  function vload(n){const key=LANG+'_'+n;if(!AC)return Promise.reject();if(!VB[key])VB[key]=fetch(U('bonanit/v/'+key+'.mp3')).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>AC.decodeAudioData(b));return VB[key]}
  function say(list){vTok++;vQ=list.slice();if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}vNext(vTok)}
  function vNext(t){if(t!==vTok||!on||!AC||!CFG.sound||!vQ.length)return;const n=vQ.shift();
    vload(n).then(buf=>{if(t!==vTok||!on)return;const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=1.25;s.connect(g);g.connect(SG);s.start();vSrc=s;
      s.onended=()=>{if(vSrc===s){vSrc=null;setTimeout(()=>vNext(t),140)}}}).catch(()=>vNext(t))}
  function vStop(){vTok++;vQ=[];if(vSrc){try{vSrc.stop()}catch(e){}vSrc=null}}
  function tell(k,d=3){cap(k,d);say([k])}

  /* ───── clips: rig = {k (model), A (accions), cur, cn (nom), ct (temps), dur, once} ───── */
  function rigOf(k){return{k,A:{},cur:null,cn:'',ct:0,dur:0,once:false}}
  function clip(r,name,fade=.3){const c=CL[r.k]&&CL[r.k][(IX[r.k].prefix||r.k+'_')+name];if(!c)return;let a=r.A[name];if(!a)a=r.A[name]=MX[r.k].clipAction(c);
    const once=!LOOPS.has(name),prev=r.cur;a.enabled=true;a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=once;a.setEffectiveTimeScale(1);a.setEffectiveWeight(1);a.play();
    if(prev&&prev!==a&&fade>0)prev.crossFadeTo(a,fade,false);else if(prev&&prev!==a)prev.stop();
    r.cur=a;r.cn=name;r.ct=0;r.dur=c.duration;r.once=once}
  const ends=(r,m=.15)=>r.once&&r.ct>=r.dur-m;

  /* ───── llitets (un objecte per animal: cada model és únic a l'escena, es reaprofita) ───── */
  function findLamp(b){let m=null;const o=b.L.getObjectByName(IX['llit_'+b.an+VAR].peces.llum);if(o)o.traverse(n=>{if(n.isMesh&&!m)m=n.material});return m}
  function mkBed(an,x,y,k){const lk='llit_'+an+VAR,L=PROTO[lk],A=PROTO[an+VAR],pc=IX[lk].peces;
    const g=new THREE.Group(),off=new THREE.Group();g.add(off);off.add(L);off.position.x=an==='ratoli'?OX_RAT:0;L.position.set(0,0,0);L.rotation.set(0,0,0);
    L.getObjectByName(pc.animal).add(A);A.position.set(0,0,0);A.rotation.set(0,0,0);
    const manta=[];const mo=L.getObjectByName(pc.manta);if(mo)mo.traverse(n=>{if(n.isMesh&&n.morphTargetInfluences)manta.push(n)});
    const b={kind:'bed',an,x,y,k,g,L,A,rig:rigOf(an+VAR),manta,lampM:null,state:'awake',rocks:0,need:3,acc:0,sacc:0,sw:0,swv:0,st:0,smile:0,tap:0,lamp:1,t:rnd(0,9),pt:rnd(0,4),pop:0,popT:rnd(0,.25),flags:{}};
    b.lampM=findLamp(b);gpos(g.position,x,y);ROOT.add(g);return b}
  function mkGrill(x,y,k){const g=new THREE.Group(),G=PROTO.grill,F=PROTO.fulla;g.add(F);g.add(G);for(const o of [G,F]){o.position.set(0,0,0);o.rotation.set(0,0,0)}
    const b={kind:'grill',an:'grill',x,y,k:k*.95,g,A:G,rig:rigOf('grill'),manta:[],state:'awake',rocks:0,need:2,acc:0,sacc:0,sw:0,swv:0,st:0,smile:0,tap:0,lamp:0,t:rnd(0,9),pt:0,pop:0,popT:rnd(0,.25),chirp:rnd(1,4),flags:{}};
    gpos(g.position,x,y);ROOT.add(g);return b}
  function mkBat(x,y,k){const g=new THREE.Group(),B=PROTO.ratpenat;g.add(B);B.position.set(0,0,0);B.rotation.set(0,0,0);
    const s=.78*k/.65,b={kind:'bat',an:'ratpenat',x,y,k:s,g,A:B,rig:rigOf('ratpenat'),manta:[],state:'hang',rocks:0,need:2,acc:0,sacc:0,sw:0,swv:0,st:0,smile:0,tap:0,lamp:0,t:0,pt:0,pop:1,popT:0,fx:x,fy:y,flags:{}};
    ROOT.add(g);batPlace(b,x,y);return b}
  /* ratpenat penjat: els peus (0,33 per sobre de l'origen, escalat) toquen la branca a (x, y) */
  function batPlace(b,px,py,hang=true){placeV(b.g.position,px,py+(hang?.33*b.k*CP*P:0),470)}
  function bedBox(b){const Pe=P*b.k;
    if(b.kind==='bat')return{x0:b.x-.62*Pe,x1:b.x+.62*Pe,y0:b.y-14,y1:b.y+.8*Pe*CP};
    if(b.kind==='grill')return{x0:b.x-.5*Pe,x1:b.x+.5*Pe,y0:b.y-1.05*CP*Pe,y1:b.y+.2*Pe};
    const m=IX['llit_'+b.an].meta.mida,ox=b.an==='ratoli'?OX_RAT:0;
    return{x0:b.x+(m.min[0]+ox)*Pe-6,x1:b.x+(m.max[0]+ox)*Pe+6,y0:b.y-(m.max[1]*SP+Math.max(m.max[2],1.25)*CP)*Pe,y1:b.y-m.min[1]*SP*Pe+8}}
  function lampXY(b){const l=IX['llit_'+b.an].meta.llum,Pe=P*b.k,ox=b.an==='ratoli'?OX_RAT:0;return[b.x+(l[0]+ox)*Pe,b.y-(l[1]*SP+l[2]*CP)*Pe]}
  function headXY(b){const Pe=P*b.k;if(b.kind==='grill')return[b.x+.1*Pe,b.y-.35*Pe];return[b.x+(b.an==='ratoli'?OX_RAT*Pe:0),b.y-(.5*SP+.62*CP)*Pe]}
  function clearAll(){for(const b of (st?st.beds:[]))b.g.removeFromParent();while(ROOT.children.length)ROOT.remove(ROOT.children[0]);LL=null;BAT=null}

  /* ───── partides ───── */
  function newGame(){if(!ready)return;vStop();clearAll();wait=[];fxp=[];idle=0;dw=0;cur=null;helpSaid=false;
    st={night:MODE===1?.45:0,beds:[],cap:null,phase:'play',pt:0,round:0,m2:null,dreams:0,shoots:[],snore:rnd(4,7),ff:[]};
    mkLluerna();
    if(MODE===0){setupBeds();later(.6,()=>tell('fosc',3.2))}else{st.m2={order:shuffle(AN.slice()),k:0,phase:'in',t:0};newDream(true)}
    updLoops()}
  function rebuild(){const m=MODE;newGame();MODE=m}           // canvi de variant (complet ↔ lleuger): es torna a començar la ronda
  function mkLluerna(){const g=new THREE.Group(),o=PROTO.lluerna;g.add(o);o.position.set(0,0,0);o.rotation.set(0,0,0);g.scale.setScalar(.42);ROOT.add(g);
    LL={g,rig:rigOf('lluerna'),x:1090,y:185,tx:1090,ty:185,vis:1};clip(LL.rig,'volar',0);LL.rig.ct=rnd(0,3)}
  function setupBeds(){const s=sz(),ans=shuffle(AN.slice());let list=s.bat?ans.concat(['grill']):ans.slice(0,s.pos.length);list=shuffle(list).slice(0,s.pos.length);
    st.beds=list.map((an,i)=>{const [x,y]=s.pos[i];const b=an==='grill'?mkGrill(x,y,s.k):mkBed(an,x,y,s.k);wake(b,true);return b});
    if(s.bat){BAT=mkBat(s.bat[0],s.bat[1],s.k);clip(BAT.rig,'dormir',0);st.beds.push(BAT)}
    st.beds.forEach(b=>{b.box=bedBox(b)})}
  /* ronda nova: els llitets canvien de lloc (es fan petits i tornen a sortir) i es torna a fer fosc */
  function newRound(){st.round++;st.phase='play';st.pt=0;idle=0;helpSaid=false;const s=sz(),list=shuffle(st.beds.filter(b=>b.kind!=='bat'));
    list.forEach((b,i)=>{b.popOut=0;later(i*.06,()=>{b.popOut=.01})});
    later(.45,()=>{list.forEach((b,i)=>{const [x,y]=s.pos[i];b.x=x;b.y=y;gpos(b.g.position,x,y);b.box=bedBox(b);b.popOut=0;b.pop=0;b.popT=i*.07;wake(b,true)});
      if(BAT){BAT.state='hang';BAT.rocks=0;BAT.acc=0;clip(BAT.rig,'dormir',.3)}});
    later(.8,()=>tell('fosc',3.2));updLoops()}
  function wake(b,fresh){b.state='awake';b.rocks=0;b.acc=0;b.sacc=0;b.st=0;b.smile=0;b.flags={};if(fresh){b.tap=0}b.lamp=1;
    if(b.kind==='grill')clip(b.rig,'cantar',.3);else playClip(b)}
  function playClip(b){const r=Math.random(),n=b.rig.cn==='jugar'?(r<.65?'repos':'saludar'):(r<.7?'jugar':r<.85?'repos':'saludar');clip(b.rig,n,.35);b.pt=n==='saludar'?99:rnd(3,6)}

  /* ───── mode 2: somnis ───── */
  function newDream(first){const m=st.m2,an=m.order[m.k%6],sh=SHAPE[DREAM[an]],s=sz(),n=s.stars;
    for(const b of st.beds)b.g.removeFromParent();
    m.an=an;m.phase='in';m.t=0;m.next=0;m.lineT=0;m.wob=0;m.r=s.r;
    const P2=sh.p.map(q=>[CX+q[0]*SD*sh.k*1.1,CY+q[1]*SD*sh.k*1.1]),L=[0];   // estrelles just per fora de la silueta
    for(let i=0;i<P2.length;i++){const a=P2[i],b=P2[(i+1)%P2.length];L.push(L[i]+Math.hypot(b[0]-a[0],b[1]-a[1]))}
    const tot=L[L.length-1];m.pts=P2;m.st=[];
    for(let j=0;j<n;j++){const d=tot*j/n;let i=0;while(L[i+1]<d)i++;const u=(d-L[i])/(L[i+1]-L[i]),a=P2[i],b=P2[(i+1)%P2.length];m.st.push({x:lerp(a[0],b[0],u),y:lerp(a[1],b[1],u),on:0,tw:0})}
    const b=mkBed(an,M2BED[0],M2BED[1],1);b.state='sleep';b.rocks=4;b.tap=1;b.lamp=.35;b.popT=.1;clip(b.rig,'dormir',0);b.rig.ct=rnd(0,4);b.box=bedBox(b);st.beds=[b];
    later(.5,()=>tell(first?'somnis':'somia',2.6))}
  function lightStar(){const m=st.m2,s=m.st[m.next];s.on=.01;idle=0;helpSaid=false;acts++;STATS.n++;$('#oN').textContent=STATS.n;m.lineT=0;
    play('bn_nota2',.55,STARF[m.next%8]/880);play('bn_estrella',.35,rnd(.95,1.08));
    for(let i=0;i<12;i++)fxp.push({x:s.x,y:s.y,vx:rnd(-90,90),vy:rnd(-90,90),t:0,d:.8,c:'#ffe58a',r:rnd(2,4)});
    m.next++;if(m.next>=m.st.length){m.phase='done';m.t=0;play('bn_somni',.8);const b=st.beds[0];clip(b.rig,'somriure',.3);b.smile=2.5;later(.9,()=>tell('somni',3))}else play('bn_linia',.6)}

  /* ───── mirada ───── */
  const inB=(b,x,y)=>x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1;
  function hit(x,y){if(!st)return null;
    if(MODE===1){const m=st.m2;if(!m||m.phase!=='draw')return null;let best=null,bd=1e9;
      m.st.forEach((s,i)=>{const d=Math.hypot(x-s.x,y-s.y);if(d<=m.r&&d<bd){bd=d;best={k:'star',i}}});return best}
    if(st.phase!=='play')return null;let best=null,bd=1e9;
    for(const b of st.beds){if(b.state==='gone'||b.state==='fly'||b.pop<.6||!b.box)continue;if(inB(b.box,x,y)){const cx=(b.box.x0+b.box.x1)/2,cy=(b.box.y0+b.box.y1)/2,d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best={k:'bed',b}}}}
    return best}
  const same=(a,b)=>a===b||!!(a&&b&&a.k===b.k&&a.b===b.b&&a.i===b.i);
  const rockable=b=>b&&((b.kind==='bat'&&b.state==='hang')||(b.kind!=='bat'&&(b.state==='awake'||b.state==='rock')));
  function rockT(b){if(CFG.mode===1)return CFG.dwell;   /* mirada sostinguda: cada gronxada demana el temps de selecció complet (Marc, 16-11) */
    return b.kind==='bat'?.66:.55}
  function rock(b){if(!rockable(b))return;idle=0;helpSaid=false;acts++;STATS.n++;$('#oN').textContent=STATS.n;b.rocks++;b.swv+=1.7;
    if(b.kind==='bat'){play('bn_nota2',.25,1.5);if(b.rocks>=b.need){b.state='wake';b.st=0;clip(b.rig,'despertar',.3)}return}
    const f=MEL[melI%MEL.length];melI++;play('bn_nota',.8,f/440);play('bn_bressol',.22,rnd(.9,1.1));if(b.kind==='grill')play('bn_grill',.3,1.1);
    if(b.state==='awake'&&b.kind==='bed'){b.state='rock';clip(b.rig,'son',.4)}else if(b.state==='awake')b.state='rock';
    if(b.rocks>=b.need){b.st=0;b.flags={};if(b.kind==='grill'){b.state='lie';clip(b.rig,'ajeure',.25)}else{b.state='yawn';clip(b.rig,'badall',.3)}}}
  function smile(b){b.smile=2.6;clip(b.rig,'somriure',.3);play('bn_somriure',.5,rnd(.95,1.08));const [hx,hy]=headXY(b);
    for(let i=0;i<9;i++)fxp.push({x:hx+rnd(-20,20),y:hy-10,vx:rnd(-50,50),vy:rnd(-100,-30),t:0,d:1.1,c:'#ffe9a8',r:rnd(2,4)})}
  function hint(){if(!st)return null;
    if(MODE===1){const m=st.m2;if(!m||m.phase!=='draw')return null;const s=m.st[m.next];return{x:s.x,y:s.y,r:m.r}}
    if(st.phase!=='play')return null;const c=st.beds.filter(b=>rockable(b)&&b.pop>.6);if(!c.length)return null;
    const b=c.sort((a,b2)=>(b2.rocks-a.rocks)||(a.kind==='bat')-(b2.kind==='bat'))[0];const bx=b.box;return{b,x:(bx.x0+bx.x1)/2,y:(bx.y0+bx.y1)/2,r:Math.max(bx.x1-bx.x0,bx.y1-bx.y0)*.5}}
  function activate(g){if(!g)return;if(g.k==='star'){if(st.m2&&st.m2.phase==='draw'&&g.i===st.m2.next)lightStar();return}
    const b=g.b;if(rockable(b))rock(b);else if(b.kind==='bed'&&b.state==='sleep'&&b.smile<=0)smile(b)}

  /* ───── pas de temps ───── */
  function step(dt){if(!R||!ready||!st)return;if(lq!==LOWQ)quality();
    const sp=CFG.speed,kk=sp>0?Math.max(.4,sp):1,dA=dt*kk,free_=!optsOpen&&view==='scene';now+=dA;
    const [wx,wy]=toWorld(cmx,cmy),has=free_&&cmx>-999;ringP=0;
    for(let i=wait.length-1;i>=0;i--)if(now>=wait[i].t){const w=wait.splice(i,1)[0];w.f()}
    if(st.cap){st.cap.d-=dA;if(st.cap.d<=0)st.cap=null}
    const ph=MODE===1&&st.m2?(st.m2.phase==='dawn'?'dawn':'play'):st.phase;
    st.night=ph==='dawn'?Math.max(0,st.night-dA/4):Math.min(1,st.night+dA/(MODE===1?2.5:7));
    /* mirada */
    const g=has?hit(wx,wy):null;
    if(MODE===0){const b=g?g.b:null;if(!same(g,cur)){cur=g;dw=0}
      for(const o of st.beds){if(o!==b){o.acc=Math.max(0,o.acc-dt*.5);o.sacc=0}}
      if(b&&CFG.mode!==2){if(rockable(b)){b.acc+=dt;const rt=rockT(b);if(CFG.mode===1)ringP=clamp(b.acc/rt,0,1);if(b.acc>=rt){b.acc=CFG.mode===1?0:b.acc-rt;rock(b)}}
        else if(b.kind==='bed'&&b.state==='sleep'&&b.smile<=0&&b.st>1){b.sacc+=dt;if(CFG.mode===1)ringP=clamp(b.sacc/.9,0,1);if(b.sacc>=.9){b.sacc=0;smile(b)}}}}
    else{const m=st.m2,ok=g&&g.k==='star'&&m.phase==='draw'&&g.i===m.next,entered=!same(g,cur);if(entered){cur=g;dw=0;if(g&&!ok&&g.k==='star')m.st[g.i].tw=1}
      if(ok&&CFG.mode!==2){if(CFG.mode===0){if(entered)lightStar()}else{dw+=dt;ringP=clamp(dw/CFG.dwell,0,1);if(dw>=CFG.dwell){dw=0;cur={k:'lock'};lightStar()}}}else dw=0}
    if(MODE===0)stepM1(dA);else stepM2(dA);
    for(const b of st.beds)stepBed(b,dA);
    stepLluerna(dA);
    /* ronc d'algun dorment, de tant en tant */
    st.snore-=dA;if(st.snore<=0){st.snore=rnd(5,9);const z=st.beds.filter(b=>b.kind==='bed'&&b.state==='sleep'&&b.smile<=0);if(z.length&&st.night>.5){const b=z[Math.floor(Math.random()*z.length)];play('bn_ronc',.3,RATE[b.an]);b.zz=1}}
    for(const p of fxp){p.t+=dA;p.x+=p.vx*dA;p.y+=p.vy*dA;p.vy+=(p.g||0)*dA}fxp=fxp.filter(p=>p.t<p.d);
    st.shoots=st.shoots.filter(s=>(s.t+=dA)<2.2);
    const busy=st.beds.some(b=>b.state==='yawn'||b.state==='lie'||b.state==='wake'||b.state==='fly')||(MODE===1&&st.m2&&st.m2.phase!=='draw')||(MODE===0&&st.phase!=='play');
    if(busy)idle=0;else idle+=dA;
    if(idle>HELP*2&&!helpSaid){helpSaid=true;play('bn_lluerna',.45);if(MODE===1)say(['estrella'])}
    lights()}
  function stepM1(dA){
    if(st.phase==='play'){if(st.beds.length&&st.beds.every(b=>b.state==='sleep'||b.state==='gone')){st.phase='finale';st.pt=0;later(.8,()=>tell('tots',4));updLoops();clip(LL.rig,'content',.3);LL.cont=1}}
    else if(st.phase==='finale'){st.pt+=dA;if(LL.cont&&ends(LL.rig)){LL.cont=0;clip(LL.rig,'volar',.3)}
      if(Math.random()<dA*3&&st.ff.length<22)st.ff.push({x:rnd(60,1220),y:rnd(380,690),t:0,d:rnd(3,6),vx:rnd(-25,25),vy:rnd(-22,-6),p:rnd(0,6)});
      if(st.pt>9){st.phase='dawn';st.pt=0;tell('bondia',2.6);play('bn_ocells',.6);updLoops();
        st.beds.forEach((b,i)=>{if(b.kind==='bat'){b.state='back';b.st=0;clip(b.rig,'volar',0);b.g.visible=true}else later(.6+i*.28,()=>{if(b.state==='sleep'){b.state='wakeup';b.st=0;clip(b.rig,'despertar',.25)}})})}}
    else if(st.phase==='dawn'){st.pt+=dA;if(st.pt>7.5)newRound()}
    st.ff=st.ff.filter(f=>(f.t+=dA)<f.d);for(const f of st.ff){f.x+=f.vx*dA;f.y+=f.vy*dA}}
  function stepM2(dA){const m=st.m2;m.t+=dA;
    if(m.phase==='in'){if(m.t>1.6){m.phase='draw';m.t=0}}
    else if(m.phase==='draw'){m.lineT=Math.min(1,m.lineT+dA*2.2)}
    else if(m.phase==='done'){m.wob+=dA;if(m.t>5.4){st.dreams++;m.k++;
        if(st.dreams%3===0){m.phase='shoot';m.t=0;later(.4,()=>tell('estels',3));updLoops()}
        else{const b=st.beds[0];b.popOut=.01;m.phase='out';m.t=0}}}
    else if(m.phase==='out'){if(m.t>.5)newDream(false)}
    else if(m.phase==='shoot'){if(Math.random()<dA*1.8){st.shoots.push({x:rnd(260,1240),y:rnd(30,200),t:0,l:rnd(180,280)});if(Math.random()<.55)play('bn_estel',.4,rnd(.9,1.1))}
      if(m.t>7){m.phase='dawn';m.t=0;tell('bondia',2.6);play('bn_ocells',.6);updLoops();const b=st.beds[0];later(.5,()=>{b.state='wakeup';b.st=0;clip(b.rig,'despertar',.25)})}}
    else if(m.phase==='dawn'){if(m.t>6.5){const b=st.beds[0];b.popOut=.01;m.phase='out';m.t=0;st.night=Math.max(st.night,.01);later(.05,updLoops)}}
    for(const s of m.st){s.tw=Math.max(0,s.tw-dA*1.5);if(s.on)s.on=Math.min(1,s.on+dA*3)}}
  function stepBed(b,dA){const r=b.rig;b.t+=dA;b.st+=dA;r.ct+=dA;b.smile=Math.max(0,b.smile-dA);b.zz=Math.max(0,(b.zz||0)-dA*.6);
    /* aparèixer / desaparèixer */
    if(b.popOut){b.popOut=Math.min(1,b.popOut+dA*3.2);b.pop=1-ease(b.popOut)}else if(b.pop<1){b.popT-=dA;if(b.popT<=0)b.pop=Math.min(1,b.pop+dA*2.2)}
    const sc=b.popOut?b.pop:eBack(b.pop);
    /* gronxar: molla amortida (i un balanceig molt suau mentre dorm) */
    b.swv+=(-b.sw*9-b.swv*1.6)*dA;b.sw+=b.swv*dA;
    const a=b.sw*.1+(b.state==='sleep'&&b.kind==='bed'&&MODE===0?.014*Math.sin(b.t*1.25):0);
    if(b.kind==='bed'){b.L.rotation.z=a;b.L.position.x=-IX['llit_'+b.an].meta.balanci*a;b.g.scale.setScalar(Math.max(.001,b.k*sc))}
    else if(b.kind==='grill'){b.g.rotation.z=a*.8;b.g.scale.setScalar(Math.max(.001,b.k*sc))}
    else{b.g.rotation.z=b.state==='hang'||b.state==='wake'?a*1.4+Math.sin(now*1.1)*.03:0;b.g.scale.setScalar(b.k)}
    /* màquina d'estats */
    if(b.kind==='bed'){
      if(b.state==='awake'){b.pt-=dA;if(b.pt<=0||(r.cn==='saludar'&&ends(r)))playClip(b)}
      else if(b.state==='yawn'){if(!b.flags.boca&&r.ct>=1){b.flags.boca=1;play('bn_badall',.7,RATE[b.an])}if(ends(r)){b.state='lie';b.st=0;b.flags={};clip(r,'ajeure',.15)}}
      else if(b.state==='lie'){b.tap=ease(clamp((r.ct-1.25)/.75,0,1));if(!b.flags.manta&&r.ct>=1.2){b.flags.manta=1;play('bn_manta',.6)}
        if(!b.flags.llum&&r.ct>=1.67){b.flags.llum=1;play('bn_apaga',.5);tell('bn_'+b.an,2.4)}
        if(ends(r)){b.state='sleep';b.st=0;b.tap=1;clip(r,'dormir',.2)}}
      else if(b.state==='sleep'){if(r.cn==='somriure'&&ends(r,.3))clip(r,'dormir',.4)}
      else if(b.state==='wakeup'){b.tap=1-ease(clamp(r.ct/.5,0,1));if(ends(r)){b.state='day';clip(r,'saludar',.25)}}
      else if(b.state==='day'){if(r.cn==='saludar'&&ends(r))clip(r,'jugar',.3)}
      const ln=b.flags.llum||b.state==='sleep'||b.state==='wakeup'||b.state==='day'?0:1;b.lamp+=(ln*(MODE===1?.35:1)-b.lamp)*Math.min(1,dA*2.5);
      if(b.lampM)b.lampM.color.setRGB(lerp(.28,1,b.lamp),lerp(.26,.95,b.lamp),lerp(.32,.77,b.lamp));
      for(const n of b.manta)n.morphTargetInfluences[0]=b.tap}
    else if(b.kind==='grill'){
      if(b.state==='awake'||b.state==='rock'){b.chirp-=dA;if(b.chirp<=0){b.chirp=rnd(3.5,6.5);if(st.night>.5&&st.phase==='play')play('bn_grill',.22,rnd(.95,1.08))}}
      else if(b.state==='lie'){if(!b.flags.llum&&r.ct>=1.33){b.flags.llum=1;tell('bn_grill',2.4)}if(ends(r)){b.state='sleep';b.st=0;clip(r,'dormir',.2)}}
      else if(b.state==='wakeup'){if(ends(r)){b.state='day';clip(r,'repos',.25)}}}
    else{   // ratpenat
      if(b.state==='wake'){if(!b.flags.ulls&&r.ct>=.58){b.flags.ulls=1;tell('ratpenat',3)}if(r.ct>=2.9){b.state='fly';b.st=0;clip(r,'volar',.3);play('bn_ales',.6)}}
      else if(b.state==='fly'){const u=clamp(b.st/2.8,0,1),px=lerp(b.x,1420,ease(u)),py=b.y+40-Math.sin(u*Math.PI)*170;placeV(b.g.position,px,py,470);b.g.rotation.y=-.5;if(u>=1){b.state='gone';b.g.visible=false}}
      else if(b.state==='back'){const u=clamp(b.st/3,0,1),px=lerp(1420,b.x,ease(u)),py=b.y+40-Math.sin(u*Math.PI)*150;placeV(b.g.position,px,py,470);b.g.rotation.y=.5;
        if(u>=1){b.state='hang';b.g.rotation.y=0;batPlace(b,b.x,b.y);clip(r,'dormir',.4);b.rocks=0;b.acc=0}}}
    if(b.kind!=='bat'||b.state!=='gone')MX[r.k].update(dA)}
  function stepLluerna(dA){if(!LL)return;const r=LL.rig;r.ct+=dA;MX.lluerna.update(dA);
    const h=idle>HELP*2?hint():null;
    if(MODE===0&&st.phase==='finale'){LL.tx=640+Math.sin(now*.7)*160;LL.ty=230+Math.sin(now*1.1)*30}
    else if(h){LL.tx=h.x+h.r*.65+30;LL.ty=h.y-h.r*.55}
    else{LL.tx=1090+Math.sin(now*.5)*28;LL.ty=185+Math.sin(now*.8)*16}
    const k=Math.min(1,dA*1.6);LL.x+=(LL.tx-LL.x)*k;LL.y+=(LL.ty-LL.y)*k;
    placeV(LL.g.position,LL.x,LL.y+Math.sin(now*2.2)*5,760);LL.g.rotation.y=clamp((LL.tx-LL.x)*.004,-.6,.6);LL.vis=Math.min(1,st.night*1.4+.2)}

  /* ───── dibuix: cel, lluna, halos, ombres i constel·lacions darrere; 3D; espurnes, zzz, punts de progrés i rètol davant ───── */
  function glow(c,x,y,r,a,col='255,214,120'){const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(.45,`rgba(${col},${a*.4})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  function halo(c,x,y,r){const p=.5+.5*Math.sin(now*2.6);c.fillStyle=`rgba(255,240,180,${.14+.12*p})`;c.beginPath();c.arc(x,y,r+8*p,0,7);c.fill()}
  function drawSky(c){const n=ease(st.night);
    if(IM.fons_alba.complete)c.drawImage(IM.fons_alba,-2,-2,W+4,H+4);
    /* sol de l'alba (surt de darrere els turons) */
    const dawn=(MODE===0&&st.phase==='dawn')||(MODE===1&&st.m2&&st.m2.phase==='dawn');
    if(dawn&&n<1){const u=MODE===0?st.pt:st.m2.t,sy=lerp(400,262,clamp(u/4.5,0,1));c.save();c.beginPath();c.rect(0,0,W,352);c.clip();glow(c,330,sy,120,.5*(1-n),'255,224,140');c.fillStyle='#ffd36b';c.globalAlpha=1-n;c.beginPath();c.arc(330,sy,50,0,7);c.fill();c.restore();c.globalAlpha=1}
    if(n>.003&&IM.fons.complete){c.globalAlpha=n;c.drawImage(IM.fons,-2,-2,W+4,H+4);c.globalAlpha=1}
    if(n>.05){c.fillStyle='#fff6d6';for(const s of stars){c.globalAlpha=n*(.35+.25*Math.sin(now*.9+s.p));c.beginPath();c.arc(s.x,s.y,s.r,0,7);c.fill()}c.globalAlpha=1}
    /* lluna (somriu quan tothom dorm) */
    if(n>.02){const [mx,my]=MOON,mr=42;c.globalAlpha=n;glow(c,mx,my,mr*2.4,.32,'255,240,190');c.fillStyle='#fbe9b0';c.beginPath();c.arc(mx,my,mr,0,7);c.fill();
      c.fillStyle='rgba(214,190,130,.45)';[[-15,-13,8],[13,9,6],[-5,19,5],[19,-17,4]].forEach(q=>{c.beginPath();c.arc(mx+q[0],my+q[1],q[2],0,7);c.fill()});
      const sm=MODE===0&&(st.phase==='finale'||st.phase==='dawn')?1:0;c.strokeStyle='#8a6d3b';c.lineWidth=3;c.lineCap='round';
      for(const s of [-1,1]){c.beginPath();if(sm)c.arc(mx+s*13,my-1,6,Math.PI*1.1,Math.PI*1.9);else c.arc(mx+s*13,my-3,6,.15*Math.PI,.85*Math.PI);c.stroke()}
      c.beginPath();c.arc(mx,my+8,sm?11:8,.2*Math.PI,.8*Math.PI);c.stroke();c.lineCap='butt';c.globalAlpha=1}}
  function starS(c,x,y,r,col,a=1){c.save();c.translate(x,y);c.globalAlpha=a;c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.45:r,an=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}c.closePath();c.fill();c.restore()}
  /* gra de risografia (una vegada) i capa fora de pantalla per al dibuix del somni */
  let GRN=null,OC=null;
  function grain(){if(GRN)return GRN;const g=document.createElement('canvas');g.width=g.height=96;const x=g.getContext('2d'),d=x.createImageData(96,96);
    for(let i=0;i<d.data.length;i+=4){const r=Math.random();if(r<.14){const v=r<.1?25:255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=v>100?22:38}}x.putImageData(d,0,0);return GRN=g}
  function cloud(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx*.86,ry*.8,0,0,7);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=(rx+ry)*.17*(1+.18*Math.sin(i*2.3));c.moveTo(x+Math.cos(a)*rx*.82+r,y+Math.sin(a)*ry*.78);c.arc(x+Math.cos(a)*rx*.82,y+Math.sin(a)*ry*.78,r,0,7)}c.fill()}
  function dreamPic(c,k,x,y,s,w,a){const q=c.getTransform().a,Z=2.6*s,n=Math.max(8,Math.ceil(Z*q));
    if(!OC)OC=document.createElement('canvas');if(OC.width!==n){OC.width=n;OC.height=n}const o=OC.getContext('2d');
    o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,n,n);o.setTransform(q,0,0,q,n/2,n/2);DRW.draw(o,k,0,0,s,w,1);
    o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-atop';o.fillStyle=o.createPattern(grain(),'repeat');o.fillRect(0,0,n,n);o.globalCompositeOperation='source-over';
    c.save();c.globalAlpha*=a;c.drawImage(OC,x-Z/2,y-Z/2,Z,Z);c.restore()}
  function drawM2(c,H0){const m=st.m2;if(!m)return;
    const ia=m.phase==='in'?clamp(m.t/1.4,0,1):(m.phase==='shoot'||m.phase==='dawn'||m.phase==='out')?Math.max(0,1-m.t/1.2):1;
    const k=DREAM[m.an],sh=SHAPE[k],s=SD*sh.k,fin=m.next>=m.st.length,u=fin?(m.phase==='done'?ease(clamp(m.t/1.2,0,1)):1):0;
    if(ia>0){const [hx,hy]=headXY(st.beds[0]);c.globalAlpha=ia*.55;c.fillStyle='#d9d6ff';[[hx+45,hy-40,10],[hx+90,hy-85,14],[hx+140,hy-130,19]].forEach(q=>{c.beginPath();c.arc(q[0],q[1],q[2],0,7);c.fill()});
      c.globalAlpha=ia*.11;cloud(c,CX,CY,SD*1.5,SD*1.22);c.globalAlpha=1}
    if(ia<=0)return;c.globalAlpha=ia;
    /* silueta guia (discontínua) mentre es dibuixa; desapareix quan surt el dibuix */
    if(u<1)DRW.ghost(c,k,CX,CY,s,ia*(1-u));
    /* dibuix acabat: apareix a poc a poc i es mou suaument (el peix neda, l'abella vola, la fruita es gronxa) */
    if(fin){const w=m.wob,dx=k==='peix'?Math.sin(w*2.4)*26:0,dy=k==='peix'?0:Math.sin(w*2.2)*5,rr=k==='poma'||k==='maduixa'||k==='gla'?Math.sin(w*1.8)*.07:0;
      c.save();c.translate(CX+dx,CY+dy-s*.9);c.rotate(rr);c.translate(0,s*.9);dreamPic(c,k,0,0,s,w,ia*u);c.restore()}
    /* línies i estrelles (s'esvaeixen una mica quan el dibuix ja és complet) */
    const la=ia*(1-.85*u);c.globalAlpha=la;c.strokeStyle='#ffe58a';c.lineWidth=4;c.beginPath();
    for(let i=1;i<m.next;i++){const a=m.st[i-1],b=m.st[i],v=i===m.next-1&&m.phase==='draw'?m.lineT:1;c.moveTo(a.x,a.y);c.lineTo(lerp(a.x,b.x,v),lerp(a.y,b.y,v))}
    if(fin){const a=m.st[m.st.length-1],b=m.st[0];c.moveTo(a.x,a.y);c.lineTo(b.x,b.y)}c.stroke();
    m.st.forEach((st2,i)=>{const nx=i===m.next&&m.phase==='draw';if(nx&&H0)halo(c,st2.x,st2.y,m.r);
      const pulse=nx?1+.16*Math.sin(now*3.4):1+.08*st2.tw*Math.sin(now*14);
      if(st2.on||i<m.next){glow(c,st2.x,st2.y,m.r*1.1,.55*(1-.85*u),'255,236,150');starS(c,st2.x,st2.y,m.r*.55,'#ffe58a',la)}
      else if(nx){glow(c,st2.x,st2.y,m.r,.4,'255,255,255');starS(c,st2.x,st2.y,m.r*.55*pulse,'#ffffff',ia)}
      else starS(c,st2.x,st2.y,m.r*.4*pulse,'#c9c6f0',.75*ia)});
    c.globalAlpha=1}
  function render(){const c=ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    if(CFG.simple){c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height)}
    c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    const f=fx;f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,fgc.width,fgc.height);
    if(!R||!ready||!st)return;
    if(!CFG.simple)drawSky(c);
    const n=st.night,H0=idle>HELP?hint():null;
    /* estels fugaços (darrere dels models) */
    for(const s of st.shoots){const u=s.t/2.2,a=Math.sin(u*Math.PI),x=s.x-u*s.l*1.6,y=s.y+u*s.l*.7;const g=c.createLinearGradient(x,y,x+90,y-40);g.addColorStop(0,`rgba(255,246,210,${a})`);g.addColorStop(1,'rgba(255,246,210,0)');
      c.strokeStyle=g;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+90,y-40);c.stroke();c.lineCap='butt';starS(c,x,y,6,`rgba(255,250,225,${a})`)}
    if(MODE===1)drawM2(c,H0);
    /* llumetes dels fanalets (fan de diana), halo d'ajuda i ombres */
    for(const b of st.beds){if(b.kind==='bed'&&b.pop>.05&&b.state!=='gone'){const [lx,ly]=lampXY(b),Pe=P*b.k;if(b.lamp>.02)glow(c,lx,ly,Pe*.95*b.pop,(.42+.06*Math.sin(now*2+b.x))*b.lamp*(.35+.65*n))}}
    if(H0&&H0.b)halo(c,H0.x,H0.y,H0.r);
    for(const b of st.beds){if(b.kind==='bat'||b.pop<.05)continue;const Pe=P*b.k,ox=b.an==='ratoli'?OX_RAT*Pe:0,w=b.kind==='grill'?.38:.5;
      c.fillStyle=`rgba(12,14,52,${.28*b.pop})`;c.beginPath();c.ellipse(b.x+ox,b.y+4,w*Pe*b.pop,9*b.k,0,0,7);c.fill()}
    if(LL&&LL.vis>.05){const [lx,ly]=proj(LL.g.position);glow(c,lx,ly+10,70,.45*LL.vis,'255,232,130')}
    R.render(S3,cam);
    /* davant */
    f.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);
    for(const p of fxp){f.globalAlpha=Math.max(0,1-p.t/p.d);f.fillStyle=p.c;f.beginPath();f.arc(p.x,p.y,p.r,0,7);f.fill()}f.globalAlpha=1;
    if(st.ff.length){for(const q of st.ff){const a=Math.sin(q.t/q.d*Math.PI)*(.55+.45*Math.sin(now*3+q.p));f.globalAlpha=a*.35;f.fillStyle='#fff2a0';f.beginPath();f.arc(q.x,q.y,9,0,7);f.fill();f.globalAlpha=a;f.beginPath();f.arc(q.x,q.y,3,0,7);f.fill()}f.globalAlpha=1}
    for(const b of st.beds){if(b.state!=='sleep'||b.kind==='bat'||b.pop<.5)continue;if(MODE===0&&st.phase==='dawn')continue;const [hx,hy]=headXY(b),s=b.k;
      for(let i=0;i<3;i++){const u=((b.st*.42+i/3)%1);f.globalAlpha=Math.sin(u*Math.PI)*.85;f.fillStyle='#ecebff';f.font=`800 ${Math.round((15+u*14)*Math.max(.7,s))}px Nunito, system-ui, sans-serif`;f.fillText('z',hx+(26+u*40)*s,hy-(30+u*70)*s)}f.globalAlpha=1}
    if(MODE===0&&st.phase==='play')for(const b of st.beds){if(!rockable(b)||b.pop<.8)continue;const nn=b.need,r=7,gap=22,y=b.kind==='bat'?b.box.y1+10:b.box.y1+8,x=b.kind==='bed'&&b.an==='ratoli'?b.x+OX_RAT*P*b.k:b.x;
      for(let i=0;i<nn;i++){const cx=x+(i-(nn-1)/2)*gap;f.fillStyle=i<b.rocks?'#ffd85a':'rgba(255,255,255,.34)';f.beginPath();f.arc(cx,y,r,0,7);f.fill()}}
    drawCap(f)}
  function drawCap(f){const c=st.cap;if(!c)return;const s=T('nit.'+c.k);f.font='800 34px Nunito, "Segoe UI", system-ui, sans-serif';
    const tw2=f.measureText(s).width,x=W/2,y=MODE===0?176:688,al=Math.min(1,c.d*3);
    f.globalAlpha=al;f.fillStyle='rgba(255,251,238,.92)';f.beginPath();f.roundRect(x-tw2/2-26,y-36,tw2+52,56,28);f.fill();f.fillStyle='#2b2a5e';f.textAlign='center';f.textBaseline='alphabetic';f.fillText(s,x,y+4);f.textAlign='left';f.globalAlpha=1}

  function click(cx,cy){if(CFG.mode!==2)return;const [wx,wy]=toWorld(cx,cy),g=hit(wx,wy);activate(g)}
  function layout(){if(!ready)return;newGame()}
  function setMode(m){MODE=m;document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===m));if(on&&ready)newGame()}
  function tray(){const t=$('#tray');t.innerHTML='';['nit.m1','nit.m2'].forEach((k,m)=>{const b=document.createElement('button');b.className='mb dwell';b.dataset.m=m;b.textContent=T(k);
      b.onclick=e=>{e.stopPropagation();setMode(m)};t.appendChild(b)});
    document.querySelectorAll('#tray .mb').forEach(b=>b.classList.toggle('sel',+b.dataset.m===MODE))}
  function start(){init();on=true;cvs.style.display='block';fgc.style.display='block';tray();if(ready)layout()}
  function stop(){on=false;vStop();if(cvs){cvs.style.display='none';fgc.style.display='none'}if(R&&ready)clearAll();st=null}
  /* música i ambient (index: musKey i updLoops) */
  function mus(){if(!st)return 'm_bn_coixi';if(MODE===1)return st.m2&&st.m2.phase==='dawn'?'m_bn_alba':'m_bn_nana';return st.phase==='finale'?'m_bn_nana':st.phase==='dawn'?'m_bn_alba':'m_bn_coixi'}
  function ambK(){if(!st)return null;const d=MODE===1?st.m2&&st.m2.phase==='dawn':st.phase==='dawn';return d?null:['bn_nit',.5]}
  const scr=(x,y)=>[OX+x*SC,OY+y*SC];
  return {start,stop,step,render,layout,click,tray,toggle(){setMode(1-MODE)},setMode,mus,amb:ambK,hit,hint,activate,rock,scr,bedBox,
    get ready(){return ready},get mode(){return MODE},get st(){return st},get idle(){return idle},get acts(){return acts},get R(){return R},get VAR(){return VAR},get LL(){return LL},get loading(){return loading}};
})();
