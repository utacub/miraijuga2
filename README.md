# Mira i Juga 2

Quinze escenaris animats perquè infants petits aprenguin a controlar l'ordinador amb la mirada (lector ocular), el ratolí o la pantalla tàctil. Sis idiomes: català, castellà, basc, gallec, anglès i francès.

**Web:** https://utacub.github.io/miraijuga2/

Es pot instal·lar com a aplicació (PWA) des del botó «Instal·lar» de la portada: abans d'instal·lar mostra l'espai que ocuparà, i després funciona sense connexió i s'actualitza sola. Funciona a Windows, Chromebook i Android (Chrome i Edge) i a l'iPad i l'iPhone (Safari › Comparteix › Afegeix a la pantalla d'inici).

## Com es munta

- `index.tpl.html` + `i18n.js`, `i18n2.js`, `pwa.js` i els mòduls de cada activitat → `python3 build.py` escriu `index.html` (web) i `python3 build.py inline` l'HTML únic descarregable (no es puja al repositori).
- `VERSION` és el número de versió que es veu a la portada i als crèdits.
- Els vídeos amb transparència són WebM VP9 amb alfa; per a Safari n'hi ha una còpia `.sa.mp4` (H.264, color a dalt i alfa a baix) que l'app recompon amb WebGL.
- En publicar, `tools/pwa-build.mjs` escriu `pwa-fitxers.json` (fitxers, mides i hashes de l'app instal·lable).

Creat per la Unitat de Tècniques Augmentatives de Comunicació (UTAC), Universitat de Barcelona.
