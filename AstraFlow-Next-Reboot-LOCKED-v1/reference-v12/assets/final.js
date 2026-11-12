// AstraFlow / final targeted behavior. No animation on headline, logo geometry or scroll position.
(() => {
  const svg=document.querySelector('.v10-logo-svg');
  const control=document.querySelector('#v10-motion-toggle');
  const stage=document.querySelector('#v10-signature-stage');
  if(svg&&control&&stage){
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused=false,visible=true;
    function sync(){
      const paused=media.matches||userPaused||!visible||document.hidden;
      stage.dataset.signalPaused=String(paused);
      try{if(paused)svg.pauseAnimations?.();else svg.unpauseAnimations?.()}catch{}
      control.setAttribute('aria-pressed',String(userPaused));
      control.setAttribute('aria-label',userPaused?'Resume hero trace animation':'Pause hero trace animation');
      control.innerHTML=userPaused?'RESUME SIGNAL <span aria-hidden="true">▶</span>':'PAUSE SIGNAL <span aria-hidden="true">Ⅱ</span>';
      control.disabled=media.matches;control.title=media.matches?'Movement disabled by your reduced-motion preference':'';
    }
    control.addEventListener('click',()=>{userPaused=!userPaused;sync()});
    media.addEventListener?.('change',sync);document.addEventListener('visibilitychange',sync);
    const observer=new IntersectionObserver(items=>{visible=items[0]?.isIntersecting??true;sync()},{threshold:.06});
    observer.observe(stage);sync();
  }
  const branches=document.querySelector('.v10-community-branches');
  if(branches){
    const links=[...branches.querySelectorAll('.v10-branch-item')];
    links.forEach((link,index)=>{
      const on=()=>{branches.dataset.activeBranch=String(index)};
      const off=()=>{if(!branches.contains(document.activeElement))branches.removeAttribute('data-active-branch')};
      link.addEventListener('mouseenter',on);link.addEventListener('focus',on);
      link.addEventListener('mouseleave',off);link.addEventListener('blur',()=>setTimeout(off,0));
    });
  }
  const layerButtons=[...document.querySelectorAll('.v10-layer-control')];
  const figure=document.querySelector('.v10-assembly-figure');
  const details=[
    ['01 / INPUT SELECTED','Typed requests declare intent without hiding the contract behind infrastructure.'],
    ['02 / EXECUTION SELECTED','Handlers, pipeline behaviors and mapping rules are distinct, opt-in responsibilities.'],
    ['03 / INSPECTION SELECTED','Use diagnostics, analyzers and testing helpers to inspect supported relationships and validate decisions.']
  ];
  function activateLayer(index){
    if(!figure)return;
    figure.dataset.activeLayer=String(index);
    layerButtons.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
    document.querySelectorAll('[data-geom-layer]').forEach((el,i)=>el.dataset.selected=String(i===index));
    document.querySelector('#v10-layer-label').textContent=details[index][0];
    document.querySelector('#v10-layer-description').textContent=details[index][1];
  }
  layerButtons.forEach((button,i)=>button.addEventListener('click',()=>activateLayer(i)));
  if(figure)activateLayer(1);
})();
