import json,base64,sys,os,re
inline=len(sys.argv)>1 and sys.argv[1]=='inline'
B='/tmp/claude-0/-home-user/1be71652-e311-5c3f-bbc3-85e8042e01ef/scratchpad/'
s=open('index.tpl.html').read()
s=s.replace('__I18N_EARLY__',open('i18n.js').read()).replace('__I18N__',open('i18n.js').read()).replace('__I18N2__',open('i18n2.js').read()).replace('__ANCHORS__',open('anch.json').read()).replace('__HMASK__',open('hmask.json').read())
s=s.replace('__ONES__',open('ones.js').read().replace('__LLAMA__',open(B+'ones2/llama_meta.json' if os.path.exists(B+'ones2/llama_meta.json') else 'llama_meta.json').read()))
s=s.replace('__OUS__',open('ous.js').read())
s=s.replace('__TREN__',open('trenet.js').read())
s=s.replace('__JARDI__',open('jardi.js').read())
s=s.replace('__ESTANY__',open('estany.js').read())
s=s.replace('__HORT__',open('hort.js').read())
s=s.replace('__TEMPS__',open('temps.js').read())
s=s.replace('__CONTE__',open('conte.js').read().replace('__COIX__',open('conte/models.json').read()).replace('__COTX__',open('conte/textos.json').read()))
s=s.replace('__PARELLES__',open('parelles.js').read().replace('__PAIX__',open('parelles/models.json').read()).replace('__PATX__',open('parelles/textos.json').read()))
s=s.replace('__OMBRA__',open('ombra.js').read().replace('__OMIX__',open('ombra/models.json').read()).replace('__OMTX__',open('ombra/textos.json').read()))
s=s.replace('__ROBOTS__',open('robots.js').read().replace('__RBIX__',open('robots/models.json').read()).replace('__RBTX__',open('robots/textos.json').read()))
s=s.replace('__CARGOLS__',open('cargols.js').read().replace('__CGIX__',open('cargols/models.json').read()).replace('__CGTX__',open('cargols/textos.json').read()))
s=s.replace('__RENTA__',open('rentacotxes.js').read().replace('__RCIX__',open('renta/models.json').read()).replace('__RCTX__',open('renta/textos.json').read()))
s=s.replace('__BONANIT__',open('bonanit.js').read().replace('__BNIX__',open('bonanit/models.json').read()))
s=s.replace('__THREE__',open(B+'bund/three3.js' if os.path.exists(B+'bund/three3.js') else 'three3.js').read().replace('</script','<\\/script'))
s=s.replace('__PWA__',open('pwa.js').read())
s=s.replace('__VERSION__',open('VERSION').read().strip())
out='index.html'
if inline:
  A={}
  for d in ['menu','portada','bosc','ones','ones/d','ones/m','ones/veu','ones/so','so','ous','ous/m','ous/so','ous/v','ous/veu','bosc/veu','tren','tren/m','tren/so','tren/v','jardi','jardi/m','jardi/so','estany','estany/m','estany/so','hort','hort/m','hort/so','temps','temps/m','temps/so','temps/v','bonanit','bonanit/m','bonanit/t','bonanit/so','bonanit/v','renta','renta/m','renta/t','renta/s','renta/so','renta/v','cargols','cargols/m','cargols/t','cargols/so','cargols/v','robots','robots/m','robots/t','robots/so','robots/v','ombra','ombra/m','ombra/t','ombra/s','ombra/cr','ombra/so','ombra/v','parelles','parelles/m','parelles/t','parelles/so','parelles/v','conte','conte/m','conte/t','conte/2d','conte/so','conte/v']:
    if not os.path.isdir(d):continue
    for f in sorted(os.listdir(d)):
      p=d+'/'+f
      if os.path.isfile(p) and not f.endswith('.json') and not f.endswith('.sa.mp4') or p.endswith('.gltf.json'): A[p]=base64.b64encode(open(p,'rb').read()).decode()
  def du(p):
    m={'webp':'image/webp','png':'image/png'}[p.split('.')[-1]];return 'data:%s;base64,%s'%(m,base64.b64encode(open(p,'rb').read()).decode())
  s=re.sub(r'src="((?:bosc|ones|ous|portada|inst)/[^"$]+|utac\.png)"',lambda m:'src="%s"'%du(m.group(1)),s)
  fd=du('bosc/fons.webp');fp=du('portada/fons.webp');s=s.replace(':root{',':root{--portimg:url('+fp+');',1).replace('url(portada/fons.webp)','var(--portimg)');s=s.replace(':root{',':root{--fonsimg:url('+fd+');',1).replace('url(bosc/fons.webp)','var(--fonsimg)')
  s=s.replace('<script>\n','<script>window.ASSET='+json.dumps(A)+';</script>\n<script>\n',1)
  s=re.sub(r'url\((fonts/[^)]+\.woff2)\)',lambda m:'url(data:font/woff2;base64,'+base64.b64encode(open(m.group(1),'rb').read()).decode()+')',s)
  s=re.sub(r'<link rel="manifest"[^>]*>','',s);s=re.sub(r'<link rel="apple-touch-icon"[^>]*>','',s)
  s=s.replace('href="icons/icon-192.png"','href="data:image/png;base64,'+base64.b64encode(open('icons/icon-192.png','rb').read()).decode()+'"')
  out='MiraiJuga2.html'
open(out,'w').write(s);print(out,len(s)//1024,'KB')
