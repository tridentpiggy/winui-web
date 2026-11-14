/* Gallery runtime: active-page locator, correct disabled previews, and live slider styling. */
(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',fn,{once:true}) : fn();
  ready(() => {
    // Only explicit host-level disablement should disable a preview control.
    document.querySelectorAll('[winui-prev]').forEach(host => {
      const disabled = host.getAttribute('winui-disabled') === 'true' || (host.matches('button,input,select,textarea') && host.hasAttribute('disabled'));
      if (!disabled) host.querySelectorAll('button:disabled,input:disabled,select:disabled,textarea:disabled').forEach(control => { control.disabled = false; });
    });
    const sidebar=document.querySelector('.winui-sidebar');
    const move=()=>{
      if(!sidebar)return;
      let indicator=sidebar.querySelector(':scope > .winui-sidebar-indicator');
      if(!indicator){indicator=document.createElement('span');indicator.className='winui-sidebar-indicator';indicator.setAttribute('aria-hidden','true');sidebar.prepend(indicator);}
      const active=sidebar.querySelector('.winui-sidebar-item[aria-current="page"]');
      if(!active){indicator.dataset.visible='false';return;}
      const bounds=sidebar.getBoundingClientRect(),row=active.getBoundingClientRect();
      indicator.style.transform=`translateY(${row.top-bounds.top+(row.height-16)/2}px)`;indicator.dataset.visible='true';
    };
    if(sidebar){window.addEventListener('resize',move,{passive:true});sidebar.addEventListener('transitionend',move);new MutationObserver(move).observe(sidebar,{attributes:true,subtree:true,attributeFilter:['aria-current','data-collapsed']});requestAnimationFrame(move);}
    const links=[...document.querySelectorAll('[data-page-link]')],pages=[...document.querySelectorAll('[data-page]')],title=document.getElementById('current-title'),main=document.querySelector('.gallery-main');
    const labels=Object.fromEntries(links.map(link=>[link.dataset.pageLink,link.querySelector('.nav-text')?.textContent.trim()||link.textContent.trim()]));
    function navigate(id,hash=true){if(!pages.some(page=>page.dataset.page===id))id=pages[0]?.dataset.page;if(!id)return;pages.forEach(page=>page.hidden=page.dataset.page!==id);links.forEach(link=>link.dataset.pageLink===id?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current'));if(title)title.textContent=labels[id]||id;if(hash)history.replaceState(null,'',`#${id}`);main?.scrollTo({top:0,behavior:'smooth'});requestAnimationFrame(move);}
    links.forEach(link=>link.addEventListener('click',()=>navigate(link.dataset.pageLink)));window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));if(pages.length)navigate(location.hash.slice(1)||pages[0].dataset.page,false);
    const update=input=>{const min=Number(input.min||0),max=Number(input.max||100),current=Number(input.value||min);input.style.setProperty('--slider-progress',`${max===min?0:(current-min)/(max-min)*100}%`);};
    document.querySelectorAll('.winui-slider-input').forEach(input=>{update(input);input.addEventListener('input',()=>update(input));input.addEventListener('change',()=>update(input));});
  });
})();
