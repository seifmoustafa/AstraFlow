/* AstraFlow / progressive enhancement for the final HTML visual reference.
   No scroll hijack, no motion on hero typography or logo geometry. */
(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // A thin, semantic scroll completion indicator. RAF-throttled and non-interactive.
  const updateProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.max(0, Math.min(1, window.scrollY/max));
    document.documentElement.style.setProperty('--v11-scroll', percent.toFixed(4));
  };
  let pending=false;
  window.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{updateProgress();pending=false})},{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});updateProgress();
  // One-time entrance for the lower content, never the hero or any LCP candidate.
  if(!prefersReduced.matches && 'IntersectionObserver' in window){
    const candidates=[...document.querySelectorAll('.editorial-panel .section-head, .editorial-panel .line-card, .v10-assembly-head, .v10-assembly-figure, .release-row, .docs-reading, .v10-flow-instrument')]
      .filter(el=>el.getBoundingClientRect().top>window.innerHeight+20);
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.dataset.v11Entrance='visible';observer.unobserve(entry.target)}
    }),{threshold:.04,rootMargin:'0px 0px -4% 0px'});
    candidates.forEach(el=>{el.dataset.v11Entrance='waiting';observer.observe(el)});
  }
  // Make an active Flow stage visibly progress along its rail and offer a useful copy interaction.
  const path=document.querySelector('.v10-flow-instrument .flow-path');
  if(path){
    const syncStage=()=>{
      const active=path.querySelector('.flow-node[data-active="true"]');
      const idx=active?Number(active.dataset.stage):0;
      path.style.setProperty('--v11-stage-progress', `${(idx/3*100).toFixed(2)}%`);
      path.setAttribute('aria-label', `Guided flow, step ${idx+1} of 4`);
    };
    new MutationObserver(syncStage).observe(path,{subtree:true,attributes:true,attributeFilter:['data-active']});syncStage();
    path.addEventListener('keydown',event=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
      const nodes=[...path.querySelectorAll('button[data-stage]')];
      if(!nodes.includes(document.activeElement))return;
      event.preventDefault();
      const current=Number(document.activeElement.dataset.stage);
      const next=event.key==='Home'?0:event.key==='End'?3:event.key==='ArrowRight'?Math.min(3,current+1):Math.max(0,current-1);
      nodes[next].click();nodes[next].focus();
    });
    const code=document.querySelector('.v10-flow-instrument .flow-code');
    if(code && !code.querySelector('.v11-code-copy')){
      const copy=document.createElement('button');copy.type='button';copy.className='v11-code-copy';copy.textContent='COPY EXAMPLE  ↗';copy.setAttribute('aria-label','Copy the currently displayed C# code example');
      code.append(copy);
      copy.addEventListener('click',async()=>{
        const value=document.querySelector('#flow-code')?.textContent||'';
        try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(value);copy.textContent='COPIED ✓'}
        catch{copy.textContent='SELECT CODE TO COPY';document.querySelector('#flow-code')?.focus();}
        setTimeout(()=>{copy.textContent='COPY EXAMPLE  ↗'},1700);
      });
    }
  }
  // Semantically complete tab keyboard support for accessible Flow capability and Guides selectors.
  for(const selector of ['.flow-list[role="tablist"]','.timeline-ribbon[role="tablist"]']){
    const tablist=document.querySelector(selector);if(!tablist)continue;
    const tabs=[...tablist.querySelectorAll('button[role="tab"]')];
    function syncTabs(){tabs.forEach(tab=>tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1)}
    syncTabs();tabs.forEach(tab=>tab.addEventListener('click',syncTabs));
    tablist.addEventListener('keydown',event=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
      const current=tabs.indexOf(document.activeElement);if(current<0)return;
      event.preventDefault();
      const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(current+1)%tabs.length:(current-1+tabs.length)%tabs.length;
      tabs[target].click();tabs[target].focus();syncTabs();
    });
  }
  // Header search shortcut only for the actual Docs search in this prototype.
  window.addEventListener('keydown',event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
      const field=document.querySelector('#docs-query');if(field){event.preventDefault();field.focus();field.select();}
    }
  });
  // Correct nav states in the locally opened prototype, and close the mobile menu on selection.
  const menu=document.querySelector('.mobile-menu');const nav=document.querySelector('#main-menu');
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    if(!menu||!nav)return;menu.setAttribute('aria-expanded','false');nav.classList.remove('open');
  }));
  // Figure should not be suspended behind offscreen autoplay; no expensive perpetual loops outside hero.
})();
