/* Integrated gallery behavior: fix demo disabled states, navigation locator, and Slider updates. */
(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',fn,{once:true}) : fn();
  ready(() => {
    // Only the component host's explicit disabled flag should disable its generated controls.
    document.querySelectorAll('[winui-prev]').forEach(host => {
      const disabled = host.getAttribute('winui-disabled') === 'true' || (host.matches('button,input,select,textarea') && host.hasAttribute('disabled'));
      if (!disabled) host.querySelectorAll('button:disabled,input:disabled,select:disabled,textarea:disabled').forEach(control => { control.disabled = false; });
    });
    const sidebar = document.querySelector('.winui-sidebar');
    if (sidebar) {
      let indicator = sidebar.querySelector(':scope > .winui-sidebar-indicator');
      if (!indicator) { indicator=document.createElement('span'); indicator.className='winui-sidebar-indicator'; indicator.setAttribute('aria-hidden','true'); sidebar.prepend(indicator); }
      const move = () => {
        const active=sidebar.querySelector('.winui-sidebar-item[aria-current="page"]');
        if (!active) { indicator.dataset.visible='false'; return; }
        const side=sidebar.getBoundingClientRect(),row=active.getBoundingClientRect();
        indicator.style.transform=`translateY(${row.top-side.top+(row.height-16)/2}px)`;indicator.dataset.visible='true';
      };
      window.addEventListener('resize',move,{passive:true});sidebar.addEventListener('transitionend',move);
      new MutationObserver(move).observe(sidebar,{attributes:true,subtree:true,attributeFilter:['aria-current','data-collapsed']});
      // Sidebar click sets the selected row and lets the component's own toggle listener run exactly once.
      document.querySelectorAll('.winui-sidebar-toggle').forEach(toggle=>{
        const targetSelector=toggle.getAttribute('winui-target');
        const target=()=>targetSelector?document.querySelector(targetSelector):sidebar;
        const controlled=target();
        if(controlled){toggle._winuiTarget=controlled;toggle.setAttribute('aria-controls',controlled.id||'');toggle.setAttribute('aria-expanded',String(controlled.dataset.collapsed!=='true'));}
      });
      requestAnimationFrame(move);
    }
    const links=[...document.querySelectorAll('[data-page-link]')],pages=[...document.querySelectorAll('[data-page]')],title=document.getElementById('current-title');
    const labels=Object.fromEntries(links.map(link=>[link.dataset.pageLink,link.querySelector('.nav-text')?.textContent.trim()||link.textContent.trim()]));
    function navigate(id,hash=true){if(!pages.some(page=>page.dataset.page===id))id=pages[0]?.dataset.page;if(!id)return;pages.forEach(page=>page.hidden=page.dataset.page!==id);links.forEach(link=>link.dataset.pageLink===id?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current'));if(title)title.textContent=labels[id]||id;if(hash)history.replaceState(null,'',`#${id}`);document.querySelector('.gallery-main')?.scrollTo({top:0,behavior:'smooth'});requestAnimationFrame(()=>sidebar?._winuiMoveLocator?.());}
    links.forEach(link=>link.addEventListener('click',()=>navigate(link.dataset.pageLink)));
    window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));
    if(pages.length)navigate(location.hash.slice(1)||pages[0].dataset.page,false);
    const updateSlider=input=>{const min=Number(input.min||0),max=Number(input.max||100),current=Number(input.value||min);input.style.setProperty('--slider-progress',`${max===min?0:(current-min)/(max-min)*100}%`);input.setAttribute('aria-valuenow',String(current));};
    document.querySelectorAll('.winui-slider-input').forEach(input=>{updateSlider(input);input.addEventListener('input',()=>updateSlider(input));input.addEventListener('change',()=>updateSlider(input));});
  });
})();
