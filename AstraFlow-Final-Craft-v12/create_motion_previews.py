from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from pathlib import Path
from PIL import Image
from io import BytesIO
import base64
r=Path(__file__).resolve().parent

def inline_page():
 s=BeautifulSoup((r/'index.html').read_text(),'html.parser')
 for link in list(s.select('link[rel="stylesheet"]')):
  style=s.new_tag('style');style.string=(r/link['href']).read_text();link.replace_with(style)
 for x in list(s.select('script[src]')):
  script=s.new_tag('script');script.string=(r/x['src']).read_text();x.decompose();s.body.append(script)
 for im in s.select('img[src^="assets/"]'):
  file=r/im['src'];im['src']='data:image/svg+xml;base64,'+base64.b64encode(file.read_bytes()).decode()
 return str(s)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1440,'height':900},reduced_motion='no-preference')
 page.set_content(inline_page())
 frames=[]
 for i in range(15):
  im=Image.open(BytesIO(page.locator('.v10-signature-stage').screenshot(animations='allow'))).convert('RGB')
  im.thumbnail((720,540))
  frames.append(im)
  page.wait_for_timeout(360)
 frames[0].save(r/'screenshots-final'/'HERO-LIVE-PATH.gif',save_all=True,append_images=frames[1:],duration=360,loop=0,optimize=True)
 # stages: use snapshots after selection, hold each for clearer preview
 flow=[]
 for i in range(4):
  page.locator(f'.flow-node[data-stage="{i}"]').click()
  page.wait_for_timeout(360)
  im=Image.open(BytesIO(page.locator('.v10-flow-instrument').screenshot(animations='disabled'))).convert('RGB')
  im.thumbnail((900,600));flow.append(im)
 flow[0].save(r/'screenshots-final'/'STAGE-SYNCHRONIZATION.gif',save_all=True,append_images=flow[1:],duration=900,loop=0,optimize=True)
 page.close();b.close()
print('GIFs created')
