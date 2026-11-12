from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw,ImageFont
from bs4 import BeautifulSoup
import base64,json,os,sys
root=Path(__file__).resolve().parent
def inline_page(name):
    soup=BeautifulSoup((root/(name+'.html')).read_text(),'html.parser')
    for link in list(soup.select('link[rel="stylesheet"]')):
        css=root/link['href']
        tag=soup.new_tag('style');tag.string=css.read_text();link.replace_with(tag)
    for scr in list(soup.select('script[src]')):
        js=root/scr['src'];tag=soup.new_tag('script');tag.string=js.read_text();scr.decompose();soup.body.append(tag)
    for im in soup.select('img[src^="assets/"]'):
        path=root/im['src'];ext=path.suffix[1:];mime='image/svg+xml' if ext=='svg' else 'image/'+ext
        im['src']='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
    favicon=soup.select_one('link[rel="icon"]')
    if favicon: favicon.decompose()
    return str(soup)
(root/'screenshots-final').mkdir(exist_ok=True)
results=[]; issues=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(1440,900),(390,844),(320,740),(768,1024),(1024,768),(1920,1080)]:
  for name in ['index','packages','docs','guides','changelog','community']:
   page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='no-preference')
   errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
   page.set_content(inline_page(name),wait_until='load')
   page.wait_for_timeout(200)
   overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
   missing=page.locator('img').evaluate_all('(arr)=>arr.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src)')
   rec={'page':name,'width':w,'response':200,'overflow':overflow,'errors':errs,'missingImages':missing}
   results.append(rec)
   if overflow or errs or missing:issues.append(rec)
   if w==1440:
    page.screenshot(path=str(root/'screenshots-final'/f'{name}-hero.png'),animations='disabled')
    page.screenshot(path=str(root/'screenshots-final'/f'{name}-full.png'),full_page=True,animations='disabled')
    if name=='index':
     page.locator('#experience').screenshot(path=str(root/'screenshots-final'/'home-flow-lab.png'),animations='disabled')
     page.locator('#composition').screenshot(path=str(root/'screenshots-final'/'home-assembly.png'),animations='disabled')
     # specific enhanced state test
     before=page.locator('.v12-stage-travel').evaluate('(el)=>getComputedStyle(el).transform')
     page.locator('[data-stage="2"]').click()
     page.wait_for_timeout(580)
     after=page.locator('.v12-stage-travel').evaluate('(el)=>getComputedStyle(el).transform')
     assert before != after,(before,after)
     assert page.locator('#v12-decision-count').inner_text()=='03'
     assert 'EXECUTION' in page.locator('#stage-label').inner_text()
     assert 'application logic' in page.locator('#flow-code').inner_text()
     page.locator('[data-flow="mapping"]').click()
     assert 'Mapping is a decision.' in page.locator('#flow-title').inner_text()
     page.locator('#v10-motion-toggle').click(); assert page.locator('#v10-signature-stage').get_attribute('data-signal-paused')=='true'
     page.locator('#v10-motion-toggle').click()
    if name=='packages':
     page.locator('[data-pkg="AstraFlow.Mapper"]').click()
     assert 'AstraFlow.Mapper' in page.locator('#install-commands').inner_text()
    if name=='docs':
     page.locator('#docs-query').fill('diagnostics')
     assert page.locator('.docs-tile:visible').count()>=1
    if name=='changelog':
     page.locator('.release-toggle').first.click()
     assert page.locator('.release-detail.open').count()>0
   if w==390:
    page.screenshot(path=str(root/'screenshots-final'/f'{name}-mobile.png'),animations='disabled')
    page.locator('.mobile-menu').click();assert page.locator('.nav.open').count()==1
   page.close()
 page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce')
 page.set_content(inline_page('index'),wait_until='load')
 assert page.locator('#v10-motion-toggle').is_disabled()
 page.close(); browser.close()

(root/'QA-v12-RESULTS.json').write_text(json.dumps({'tested':len(results),'issues':issues,'results':results},indent=2))
# create contact sheet
files=[('Home','index-hero.png'),('Flow explorer','home-flow-lab.png'),('Packages','packages-hero.png'),('Docs','docs-hero.png'),('Guides','guides-hero.png'),('Changelog','changelog-hero.png'),('Community','community-hero.png'),('Assembly','home-assembly.png')]
w,h=630,400;gap=22;bar=36
sheet=Image.new('RGB',(w*2+gap*3,(h+bar)*4+gap*5),'#F7F3EB')
d=ImageDraw.Draw(sheet)
for i,(title,f) in enumerate(files):
 im=Image.open(root/'screenshots-final'/f).convert('RGB'); im.thumbnail((w,h))
 x=gap+(i%2)*(w+gap);y=gap+(i//2)*(h+bar+gap)
 sheet.paste(im,(x+(w-im.width)//2,y+(h-im.height)//2))
 d.text((x+7,y+h+10),title.upper(),fill='#082C26')
sheet.save(root/'screenshots-final'/'V12-REVIEW-BOARD.jpg',quality=90)
print('Tested:',len(results),'issues:',len(issues),'ready at',root/'screenshots-final')
if issues: print('Failures:',issues);sys.exit(1)
