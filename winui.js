/* winui-web: dependency-free Fluent controls. Every component uses [winui-prev]. */
(() => {
  'use strict';
  const SELECTOR='[winui-prev]';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value=(node,name,fallback='')=>node.getAttribute(`winui-${name}`)??fallback;
  const truthy=raw=>raw==='true'||raw==='1';
  const disabled=node=>truthy(value(node,'disabled'))||(node.matches('button,input,select,textarea')&&node.disabled);
  const button=(label,cls='',attrs='')=>`<button type="button" class="winui-button${cls}"${attrs}>${label}</button>`;
  const chevron='<svg class="winui-chevron" viewBox="0 0 8 5" aria-hidden="true"><path d="m1 1 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const menuIcon='<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>';

  function getItems(host){const raw=value(host,'items');if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed.map(String);}catch(_){/* fallback to native options */}}return [...host.querySelectorAll(':scope > option')].map(option=>option.textContent.trim());}
  function menuMarkup(items,role='menu'){
    const itemRole=role==='listbox'?'option':'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item=>`<button type="button" class="winui-menu-item" role="${itemRole}" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function attachMenu(menu,trigger,host,onSelect=()=>{}){
    let closeTimer;
    const close=(restore=false)=>{if(menu.hidden){if(restore)trigger.focus();return;}menu.dataset.state='closing';trigger.setAttribute('aria-expanded','false');clearTimeout(closeTimer);closeTimer=setTimeout(()=>{menu.hidden=true;menu.dataset.state='closed';},110);if(restore)trigger.focus();};
    const open=(focus=false)=>{clearTimeout(closeTimer);menu.hidden=false;menu.dataset.state='open';trigger.setAttribute('aria-expanded','true');if(focus)menu.querySelector('.winui-menu-item:not([hidden]):not(:disabled)')?.focus();};
    trigger.addEventListener('click',()=>menu.hidden||menu.dataset.state==='closing'?open():close());
    trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(true);}else if(event.key==='Escape'){event.preventDefault();close(true);}});
    menu.addEventListener('click',event=>{const item=event.target.closest('.winui-menu-item');if(!item||item.disabled)return;onSelect(item.dataset.value,item);if(menu.getAttribute('role')==='listbox')trigger.value=item.dataset.value;close(true);});
    menu.addEventListener('keydown',event=>{const list=[...menu.querySelectorAll('.winui-menu-item:not([hidden]):not(:disabled)')],index=list.indexOf(document.activeElement);if(event.key==='Escape'){event.preventDefault();close(true);}else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const step=event.key==='ArrowDown'?1:-1;list[(index+step+list.length)%list.length]?.focus();}else if(event.key==='Home'){event.preventDefault();list[0]?.focus();}else if(event.key==='End'){event.preventDefault();list.at(-1)?.focus();}else if(event.key==='Tab')close();});
    document.addEventListener('pointerdown',event=>{if(!host.contains(event.target))close();});
    return{open,close};
  }
  function setupCombo(host,isDisabled){
    host.classList.add('winui-combo');
    host.innerHTML=`<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(value(host,'placeholder','Select an item'))}"${isDisabled?' disabled':''}><span class="winui-combo-chevron" aria-hidden="true">${chevron}</span>${menuMarkup(getItems(host),'listbox')}`;
    const input=host.querySelector('input'),menu=host.querySelector('.winui-menu');
    const controller=attachMenu(menu,input,host,selected=>{input.value=selected;input.dispatchEvent(new Event('change',{bubbles:true}));});
    const filter=()=>{const query=input.value.toLocaleLowerCase();menu.querySelectorAll('.winui-menu-item').forEach(item=>{item.hidden=!item.dataset.value.toLocaleLowerCase().includes(query);});};
    input.addEventListener('focus',()=>{filter();controller.open();});input.addEventListener('input',()=>{filter();controller.open();});
    input.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();filter();controller.open(true);}else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();controller.close();}});
  }
  function setupSlider(host,isDisabled){
    host.classList.add('winui-slider');
    host.innerHTML=`<input class="winui-slider-input" type="range" min="${esc(value(host,'min','0'))}" max="${esc(value(host,'max','100'))}" step="${esc(value(host,'step','1'))}" value="${esc(value(host,'value','50'))}" aria-label="${esc(value(host,'label','Slider'))}"${isDisabled?' disabled':''}>`;
    const input=host.querySelector('input');
    const update=()=>{const min=Number(input.min||0),max=Number(input.max||100),current=Number(input.value||min),percent=max===min?0:Math.max(0,Math.min(100,(current-min)/(max-min)*100));input.style.setProperty('--slider-progress',`${percent}%`);input.setAttribute('aria-valuenow',String(current));};
    update();input.addEventListener('input',update);input.addEventListener('change',update);
  }
  function setupSidebar(host){
    host.classList.add('winui-sidebar');host.dataset.collapsed=String(truthy(value(host,'collapsed')));host.setAttribute('aria-label',value(host,'label','Navigation'));
    let locator=host.querySelector(':scope > .winui-sidebar-indicator');
    if(!locator){locator=document.createElement('span');locator.className='winui-sidebar-indicator';locator.setAttribute('aria-hidden','true');host.prepend(locator);}
    const move=()=>{const active=host.querySelector('.winui-sidebar-item[aria-current="page"]');if(!active){locator.dataset.visible='false';return;}const side=host.getBoundingClientRect(),row=active.getBoundingClientRect();locator.style.transform=`translateY(${row.top-side.top+(row.height-16)/2}px)`;locator.dataset.visible='true';};
    host._winuiMoveLocator=move;
    host._winuiSetCollapsed=collapsed=>{host.dataset.collapsed=String(Boolean(collapsed));host.setAttribute('aria-expanded',String(!collapsed));document.querySelectorAll('.winui-sidebar-toggle').forEach(toggle=>{if(toggle._winuiTarget===host)toggle.setAttribute('aria-expanded',String(!collapsed));});requestAnimationFrame(move);};
    host.addEventListener('click',event=>{const item=event.target.closest('.winui-sidebar-item');if(!item||!host.contains(item))return;host.querySelectorAll('.winui-sidebar-item[aria-current="page"]').forEach(current=>current.removeAttribute('aria-current'));item.setAttribute('aria-current','page');requestAnimationFrame(move);});
    host.addEventListener('transitionend',move);window.addEventListener('resize',move,{passive:true});requestAnimationFrame(move);
  }
  function setupSidebarToggle(host){
    host.classList.add('winui-sidebar-toggle');if(host.tagName==='BUTTON')host.type='button';host.setAttribute('aria-label',value(host,'label','Toggle navigation'));
    host.innerHTML=`${menuIcon}<span class="winui-sidebar-toggle-label">${esc(value(host,'content'))}</span>`;
    const selector=value(host,'target'),find=()=>selector?document.querySelector(selector):host.closest('.winui-layout')?.querySelector('.winui-sidebar');
    host._winuiTarget=find();const sidebar=host._winuiTarget;
    if(sidebar){host.setAttribute('aria-controls',sidebar.id||'');host.setAttribute('aria-expanded',String(sidebar.dataset.collapsed!=='true'));}
    host.addEventListener('click',()=>{const current=find();if(current?._winuiSetCollapsed)current._winuiSetCollapsed(current.dataset.collapsed!=='true');});
  }
  function setupProgress(host,type){const ring=type!=='ProgressBar',percent=Math.max(0,Math.min(100,Number(value(host,'value','0'))||0)),busy=truthy(value(host,'indeterminate'));host.setAttribute('role','progressbar');if(busy){host.setAttribute('aria-label',value(host,'label','Loading'));if(!ring)host.setAttribute('aria-busy','true');}else{host.setAttribute('aria-valuemin','0');host.setAttribute('aria-valuemax','100');host.setAttribute('aria-valuenow',String(percent));}if(ring){host.classList.add('winui-progress-ring');host.innerHTML='<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>';}else{host.classList.add('winui-progress');host.innerHTML=`<span style="width:${percent}%"></span>`;}}
  function setupChoice(host,type,isDisabled){const label=esc(value(host,'content',value(host,'label',''))),checked=truthy(value(host,'checked'))?' checked':'',off=isDisabled?' disabled':'';if(type==='CheckBox')host.innerHTML=`<label class="winui-choice"><input class="winui-check-input" type="checkbox"${checked}${off}><span class="winui-check-box" aria-hidden="true"></span><span>${label}</span></label>`;else if(type==='RadioButton')host.innerHTML=`<label class="winui-choice"><input class="winui-radio-input" type="radio" name="${esc(value(host,'group','winui-radio'))}"${checked}${off}><span class="winui-radio-mark" aria-hidden="true"></span><span>${label}</span></label>`;else host.innerHTML=`<label class="winui-switch"><span>${label}</span><input class="winui-switch-input" type="checkbox" role="switch"${checked}${off}><span class="winui-switch-track" aria-hidden="true"></span></label>`;}
  function setupText(host,type,isDisabled){const label=esc(value(host,'label',value(host,'content',type))),placeholder=esc(value(host,'placeholder')),current=esc(value(host,'value')),off=isDisabled?' disabled':'',common=`class="winui-input" aria-label="${label}"${off}`;if(type==='TextBox')host.innerHTML=`<input ${common} type="${esc(value(host,'type','text'))}" value="${current}"${placeholder?` placeholder="${placeholder}"`:''}>`;if(type==='PasswordBox')host.innerHTML=`<input ${common} type="password"${placeholder?` placeholder="${placeholder}"`:''}>`;if(type==='NumberBox')host.innerHTML=`<input ${common} type="number" value="${current}" min="${esc(value(host,'min'))}" max="${esc(value(host,'max'))}" step="${esc(value(host,'step','1'))}">`;if(type==='SearchBox')host.innerHTML=`<label class="winui-search"><span aria-hidden="true">⌕</span><input ${common} type="search"${placeholder?` placeholder="${placeholder}"`:''}></label>`;if(type==='DatePicker')host.innerHTML=`<input ${common} type="date" value="${current}">`;if(type==='TimePicker')host.innerHTML=`<input ${common} type="time" value="${current}">`;if(type==='ColorPicker')host.innerHTML=`<label class="winui-color-picker"><input type="color" value="${current||'#0078d4'}" aria-label="${label}"${off}><span>${label}</span></label>`;host.classList.add('winui-field');}
  function setupList(host,type){const items=getItems(host);host.classList.add(type==='TreeView'?'winui-tree':'winui-list-view');host.setAttribute('role','list');host.innerHTML=items.map((item,index)=>`<button type="button" class="winui-list-item" role="listitem" aria-selected="false" data-index="${index}">${type==='TreeView'?'<span aria-hidden="true">›</span>':''}${escapeHtml(item)}</button>`).join('');host.addEventListener('click',event=>{const selected=event.target.closest('.winui-list-item');if(!selected)return;host.querySelectorAll('.winui-list-item').forEach(item=>item.setAttribute('aria-selected',String(item===selected)));});}
  function render(host){
    if(host.dataset.winuiReady==='true')return;
    const type=host.getAttribute('winui-prev'),label=value(host,'content',type),isDisabled=explicitlyDisabled(host);
    host.dataset.winuiReady='true';host.classList.add('elements-control');if(host.hasAttribute('winui-theme'))document.documentElement.dataset.winuiTheme=value(host,'theme');
    if(['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)){const style=type==='AccentButton'?' winui-button--accent':type==='ToggleButton'?' winui-button--toggle':type==='HyperlinkButton'?' winui-button--link':'';const pressed=type==='ToggleButton'&&isTrue(value(host,'checked'));host.innerHTML=button(escapeHtml(label),style,`${type==='ToggleButton'?` aria-pressed="${pressed}"`:''}${isDisabled?' disabled':''}`);if(type==='ToggleButton')host.querySelector('button').addEventListener('click',event=>event.currentTarget.setAttribute('aria-pressed',String(event.currentTarget.getAttribute('aria-pressed')!=='true')));return;}
    if(type==='DropDownButton'){host.innerHTML=`${button(`<span>${escapeHtml(label)}</span>${CHEVRON}`,' winui-button--dropdown',` aria-haspopup="menu" aria-expanded="false"${isDisabled?' disabled':''}`)}${menuMarkup(getItems(host))}`;attachMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host);return;}
    if(type==='SplitButton'){host.innerHTML=`<div class="winui-split">${button(escapeHtml(label),' winui-split-primary',isDisabled?' disabled':'')}${button(CHEVRON,' winui-split-arrow',` aria-label="More options" aria-haspopup="menu" aria-expanded="false"${isDisabled?' disabled':''}`)}</div>${menuMarkup(getItems(host))}`;attachMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-split-arrow'),host);return;}
    if(type==='ComboBox'){setupCombo(host,isDisabled);return;}
    if(['TextBox','PasswordBox','NumberBox','SearchBox','DatePicker','TimePicker','ColorPicker'].includes(type)){setupText(host,type,isDisabled);return;}
    if(['CheckBox','RadioButton','ToggleSwitch'].includes(type)){setupChoice(host,type,isDisabled);return;}
    if(type==='Slider'){setupSlider(host,isDisabled);return;}
    if(['LoadingRing','ProgressRing','ProgressBar'].includes(type)){setupProgress(host,type);return;}
    if(type==='Sidebar'){setupSidebar(host);return;}
    if(type==='SidebarToggle'){setupSidebarToggle(host);return;}
    if(type==='SidebarItem'){host.classList.add('winui-sidebar-item');if(!host.hasAttribute('tabindex'))host.tabIndex=0;if(!host.hasAttribute('role'))host.setAttribute('role','button');host.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();host.click();}});return;}
    if(type==='AppLayout'){host.classList.add('winui-layout');return;}if(type==='Content'){host.classList.add('winui-content');return;}if(type==='StackPanel'){host.classList.add('winui-stack');host.dataset.orientation=value(host,'orientation','vertical');return;}if(type==='GridPanel'){host.classList.add('winui-grid');host.style.setProperty('--winui-columns',value(host,'columns','1fr 1fr'));return;}
    if(type==='TextBlock'){host.classList.add('winui-text-block');return;}if(type==='Card'){host.classList.add('winui-card');return;}if(type==='Separator'){host.classList.add('winui-separator');host.setAttribute('role','separator');return;}if(type==='InfoBadge'){host.classList.add('winui-info-badge');if(value(host,'content'))host.textContent=value(host,'content');return;}if(type==='InfoBar'){host.classList.add('winui-info-bar');host.dataset.severity=value(host,'severity','informational');host.setAttribute('role','status');return;}
    host.classList.remove('elements-control');host.dataset.winuiReady='false';
  }
  function scan(root){if(root.matches?.(SELECTOR))render(root);root.querySelectorAll?.(SELECTOR).forEach(render);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(document));else scan(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node);}))).observe(document.documentElement,{childList:true,subtree:true});
})();
