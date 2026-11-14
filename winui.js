/* winui-web: dependency-free Fluent controls. Components are selected by [winui-prev]. */
(() => {
  'use strict';
  const SELECTOR='[winui-prev]';
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value=(node,name,fallback='')=>node.getAttribute(`winui-${name}`)??fallback;
  const isTrue=raw=>raw==='true'||raw==='1';
  const explicitlyDisabled=node=>isTrue(value(node,'disabled'))||node.hasAttribute('disabled');
  const makeButton=(label,classes='',attrs='')=>`<button type="button" class="winui-button${classes}"${attrs}>${label}</button>`;
  const CHEVRON='<svg class="winui-chevron" viewBox="0 0 8 5" aria-hidden="true"><path d="m1 1 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const MENU_ICON='<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>';

  function getItems(host){
    const raw=value(host,'items');
    if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed.map(String);}catch(_){/* optional child options */}}
    return [...host.querySelectorAll(':scope > option')].map(option=>option.textContent.trim());
  }
  function menuMarkup(items,role='menu'){
    const itemRole=role==='listbox'?'option':'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item=>`<button type="button" class="winui-menu-item" role="${itemRole}" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div>`;
  }
  function attachMenu(menu,trigger,host,onSelect=()=>{}){
    let closeTimer;
    const close=(restoreFocus=false)=>{
      if(menu.hidden){if(restoreFocus)trigger.focus();return;}
      menu.dataset.state='closing';trigger.setAttribute('aria-expanded','false');
      window.clearTimeout(closeTimer);closeTimer=window.setTimeout(()=>{menu.hidden=true;menu.dataset.state='closed';},110);
      if(restoreFocus)trigger.focus();
    };
    const open=(focusFirst=false)=>{
      window.clearTimeout(closeTimer);menu.hidden=false;menu.dataset.state='open';trigger.setAttribute('aria-expanded','true');
      if(focusFirst)menu.querySelector('.winui-menu-item:not([hidden]):not(:disabled)')?.focus();
    };
    trigger.addEventListener('click',()=>menu.hidden||menu.dataset.state==='closing'?open():close());
    trigger.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(true);}
      else if(event.key==='Escape'){event.preventDefault();close(true);}
    });
    menu.addEventListener('click',event=>{
      const item=event.target.closest('.winui-menu-item');if(!item||item.disabled)return;
      onSelect(item.dataset.value,item);
      if(menu.getAttribute('role')==='listbox')trigger.value=item.dataset.value;
      close(true);
    });
    menu.addEventListener('keydown',event=>{
      const entries=[...menu.querySelectorAll('.winui-menu-item:not([hidden]):not(:disabled)')],index=entries.indexOf(document.activeElement);
      if(event.key==='Escape'){event.preventDefault();close(true);}
      else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const step=event.key==='ArrowDown'?1:-1;entries[(index+step+entries.length)%entries.length]?.focus();}
      else if(event.key==='Home'){event.preventDefault();entries[0]?.focus();}
      else if(event.key==='End'){event.preventDefault();entries.at(-1)?.focus();}
      else if(event.key==='Tab')close();
    });
    document.addEventListener('pointerdown',event=>{if(!host.contains(event.target))close();});
    return{open,close};
  }
  function setDisabledState(host,disabled){
    host.querySelectorAll('button,input,select,textarea').forEach(control=>{
      control.disabled=Boolean(disabled);
    });
  }
  function setupCombo(host,disabled){
    host.classList.add('winui-combo');
    host.innerHTML=`<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${escapeHtml(value(host,'placeholder','Select an item'))}"${disabled?' disabled':''}><span class="winui-combo-chevron" aria-hidden="true">${CHEVRON}</span>${menuMarkup(getItems(host),'listbox')}`;
    const input=host.querySelector('input'),menu=host.querySelector('.winui-menu');
    const controller=attachMenu(menu,input,host,selected=>{input.value=selected;input.dispatchEvent(new Event('change',{bubbles:true}));});
    const filter=()=>{const query=input.value.toLocaleLowerCase();menu.querySelectorAll('.winui-menu-item').forEach(item=>{item.hidden=!item.dataset.value.toLocaleLowerCase().includes(query);});};
    input.addEventListener('focus',()=>{filter();controller.open();});
    input.addEventListener('input',()=>{filter();controller.open();});
    input.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'){event.preventDefault();filter();controller.open(true);}
      else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();controller.close();}
    });
  }
  function setupSlider(host,disabled){
    host.classList.add('winui-slider');
    host.innerHTML=`<input class="winui-slider-input" type="range" min="${escapeHtml(value(host,'min','0'))}" max="${escapeHtml(value(host,'max','100'))}" step="${escapeHtml(value(host,'step','1'))}" value="${escapeHtml(value(host,'value','50'))}" aria-label="${escapeHtml(value(host,'label','Slider'))}"${disabled?' disabled':''}>`;
    const input=host.querySelector('input');
    const update=()=>{
      const min=Number(input.min||0),max=Number(input.max||100),current=Number(input.value||min);
      const percent=max===min?0:Math.min(100,Math.max(0,(current-min)/(max-min)*100));
      input.style.setProperty('--slider-progress',`${percent}%`);
      input.setAttribute('aria-valuenow',String(current));
    };
    update();input.addEventListener('input',update);input.addEventListener('change',update);
  }
  function setupProgress(host,ring){
    const progress=Math.min(100,Math.max(0,Number(value(host,'value','0'))||0)),indeterminate=isTrue(value(host,'indeterminate'));
    host.setAttribute('role','progressbar');
    if(indeterminate){host.setAttribute('aria-label',value(host,'label','Loading'));if(!ring)host.setAttribute('aria-busy','true');}
    else{host.setAttribute('aria-valuemin','0');host.setAttribute('aria-valuemax','100');host.setAttribute('aria-valuenow',String(progress));}
    if(ring){host.classList.add('winui-progress-ring');host.innerHTML='<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>';}
    else{host.classList.add('winui-progress');host.innerHTML=`<span style="width:${progress}%"></span>`;}
  }
  function setupSidebar(host){
    host.classList.add('winui-sidebar');host.dataset.collapsed=String(isTrue(value(host,'collapsed')));host.setAttribute('aria-label',value(host,'label','Navigation'));
    let locator=host.querySelector(':scope > .winui-sidebar-indicator');
    if(!locator){locator=document.createElement('span');locator.className='winui-sidebar-indicator';locator.setAttribute('aria-hidden','true');host.prepend(locator);}
    const moveLocator=()=>{
      const active=host.querySelector('.winui-sidebar-item[aria-current="page"]');
      if(!active){locator.dataset.visible='false';return;}
      const bounds=host.getBoundingClientRect(),row=active.getBoundingClientRect();
      locator.style.transform=`translateY(${row.top-bounds.top+(row.height-16)/2}px)`;locator.dataset.visible='true';
    };
    host._winuiMoveLocator=moveLocator;
    host._winuiSetCollapsed=collapsed=>{
      host.dataset.collapsed=String(Boolean(collapsed));host.setAttribute('aria-expanded',String(!collapsed));
      document.querySelectorAll('.winui-sidebar-toggle').forEach(toggle=>{if(toggle._winuiTarget===host)toggle.setAttribute('aria-expanded',String(!collapsed));});
      requestAnimationFrame(moveLocator);
    };
    host.addEventListener('click',event=>{
      const item=event.target.closest('.winui-sidebar-item');if(!item||!host.contains(item))return;
      host.querySelectorAll('.winui-sidebar-item[aria-current="page"]').forEach(current=>current.removeAttribute('aria-current'));
      item.setAttribute('aria-current','page');requestAnimationFrame(moveLocator);
    });
    host.addEventListener('transitionend',moveLocator);window.addEventListener('resize',moveLocator,{passive:true});
    requestAnimationFrame(moveLocator);
  }
  function setupSidebarToggle(host){
    host.classList.add('winui-sidebar-toggle');if(host.tagName==='BUTTON')host.type='button';
    host.setAttribute('aria-label',value(host,'label','Toggle navigation'));
    host.innerHTML=`${MENU_ICON}<span class="winui-sidebar-toggle-label">${escapeHtml(value(host,'content'))}</span>`;
    const target=value(host,'target');const findTarget=()=>target?document.querySelector(target):host.closest('.winui-layout')?.querySelector('.winui-sidebar');
    const sidebar=findTarget();host._winuiTarget=sidebar;
    if(sidebar){host.setAttribute('aria-controls',sidebar.id||'');host.setAttribute('aria-expanded',String(sidebar.dataset.collapsed!=='true'));}
    host.addEventListener('click',()=>{const current=findTarget();if(current?._winuiSetCollapsed)current._winuiSetCollapsed(current.dataset.collapsed!=='true');});
  }
  function setupList(host,type){
    const items=getItems(host);host.classList.add(type==='TreeView'?'winui-tree':'winui-list-view');host.setAttribute('role','list');
    host.innerHTML=items.map((item,index)=>`<button type="button" class="winui-list-item" role="listitem" aria-selected="false" data-index="${index}">${type==='TreeView'?'<span aria-hidden="true">›</span>':''}${escapeHtml(item)}</button>`).join('');
    host.addEventListener('click',event=>{const selected=event.target.closest('.winui-list-item');if(!selected)return;host.querySelectorAll('.winui-list-item').forEach(item=>item.setAttribute('aria-selected',String(item===selected)));});
  }
  function setupChoice(host,type,disabled){
    const label=escapeHtml(value(host,'content',value(host,'label',''))),checked=isTrue(value(host,'checked'))?' checked':'',off=disabled?' disabled':'';
    if(type==='CheckBox')host.innerHTML=`<label class="winui-choice"><input class="winui-check-input" type="checkbox"${checked}${off}><span class="winui-check-box" aria-hidden="true"></span><span>${label}</span></label>`;
    else if(type==='RadioButton')host.innerHTML=`<label class="winui-choice"><input class="winui-radio-input" type="radio" name="${escapeHtml(value(host,'group','winui-radio'))}"${checked}${off}><span class="winui-radio-mark" aria-hidden="true"></span><span>${label}</span></label>`;
    else host.innerHTML=`<label class="winui-switch"><span>${label}</span><input class="winui-switch-input" type="checkbox" role="switch"${checked}${off}><span class="winui-switch-track" aria-hidden="true"></span></label>`;
  }
  function setupText(host,type,disabled){
    const label=escapeHtml(value(host,'label',value(host,'content',type))),placeholder=escapeHtml(value(host,'placeholder')),current=escapeHtml(value(host,'value')),off=disabled?' disabled':'';
    const common=`class="winui-input" aria-label="${label}"${off}`;
    if(type==='TextBox')host.innerHTML=`<input ${common} type="${escapeHtml(value(host,'type','text'))}" value="${current}"${placeholder?` placeholder="${placeholder}"`:''}>`;
    if(type==='PasswordBox')host.innerHTML=`<input ${common} type="password"${placeholder?` placeholder="${placeholder}"`:''}>`;
    if(type==='NumberBox')host.innerHTML=`<input ${common} type="number" value="${current}" min="${escapeHtml(value(host,'min'))}" max="${escapeHtml(value(host,'max'))}" step="${escapeHtml(value(host,'step','1'))}">`;
    if(type==='SearchBox')host.innerHTML=`<label class="winui-search"><span aria-hidden="true">⌕</span><input ${common} type="search"${placeholder?` placeholder="${placeholder}"`:''}></label>`;
    if(type==='DatePicker')host.innerHTML=`<input ${common} type="date" value="${current}">`;
    if(type==='TimePicker')host.innerHTML=`<input ${common} type="time" value="${current}">`;
    if(type==='ColorPicker')host.innerHTML=`<label class="winui-color-picker"><input type="color" value="${current||'#0078d4'}" aria-label="${label}"${off}><span>${label}</span></label>`;
    host.classList.add('winui-field');
  }
  function render(host){
    if(host.dataset.winuiReady==='true')return;
    const type=host.getAttribute('winui-prev'),label=value(host,'content',type),off=explicitlyDisabled(host);
    host.dataset.winuiReady='true';host.classList.add('elements-control');
    if(host.hasAttribute('winui-theme'))document.documentElement.dataset.winuiTheme=value(host,'theme');
    if(['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)){
      const style=type==='AccentButton'?' winui-button--accent':type==='ToggleButton'?' winui-button--toggle':type==='HyperlinkButton'?' winui-button--link':'';
      const pressed=type==='ToggleButton'&&isTrue(value(host,'checked'));
      host.innerHTML=button(escapeHtml(label),style,`${type==='ToggleButton'?` aria-pressed="${pressed}"`:''}${off?' disabled':''}`);
      if(type==='ToggleButton')host.querySelector('button').addEventListener('click',event=>event.currentTarget.setAttribute('aria-pressed',String(event.currentTarget.getAttribute('aria-pressed')!=='true')));
      return;
    }
    if(type==='DropDownButton'){
      host.innerHTML=`${button(`<span>${escapeHtml(label)}</span>${CHEVRON}`,' winui-button--dropdown',` aria-haspopup="menu" aria-expanded="false"${off?' disabled':''}`)}${menuMarkup(getItems(host))}`;
      attachMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host);return;
    }
    if(type==='SplitButton'){
      host.innerHTML=`<div class="winui-split">${button(escapeHtml(label),' winui-split-primary',off?' disabled':'')}${button(CHEVRON,' winui-split-arrow',` aria-label="More options" aria-haspopup="menu" aria-expanded="false"${off?' disabled':''}`)}</div>${menuMarkup(getItems(host))}`;
      attachMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-split-arrow'),host);return;
    }
    if(type==='ComboBox'){
      host.classList.add('winui-combo');host.innerHTML=`<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${escapeHtml(value(host,'placeholder','Select an item'))}"${off?' disabled':''}><span class="winui-combo-chevron" aria-hidden="true">${CHEVRON}</span>${menuMarkup(getItems(host),'listbox')}`;
      const input=host.querySelector('input'),menu=host.querySelector('.winui-menu'),controller=attachMenu(menu,input,host,selected=>{input.value=selected;input.dispatchEvent(new Event('change',{bubbles:true}));});
      const filter=()=>{const query=input.value.toLocaleLowerCase();menu.querySelectorAll('.winui-menu-item').forEach(item=>{item.hidden=!item.dataset.value.toLocaleLowerCase().includes(query);});};
      input.addEventListener('focus',()=>{filter();controller.open();});input.addEventListener('input',()=>{filter();controller.open();});input.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();filter();controller.open(true);}else if(event.key==='Escape'&&!menu.hidden){event.preventDefault();controller.close();}});return;
    }
    if(['TextBox','PasswordBox','NumberBox','SearchBox','DatePicker','TimePicker','ColorPicker'].includes(type)){setupText(host,type,off);return;}
    if(['CheckBox','RadioButton','ToggleSwitch'].includes(type)){setupChoice(host,type,off);return;}
    if(type==='Slider'){
      host.classList.add('winui-slider');host.innerHTML=`<input class="winui-slider-input" type="range" min="${escapeHtml(value(host,'min','0'))}" max="${escapeHtml(value(host,'max','100'))}" step="${escapeHtml(value(host,'step','1'))}" value="${escapeHtml(value(host,'value','50'))}" aria-label="${escapeHtml(value(host,'label','Slider'))}"${off?' disabled':''}`+'>';
      const input=host.querySelector('input'),update=()=>{const min=Number(input.min||0),max=Number(input.max||100),current=Number(input.value||min),percent=max===min?0:Math.max(0,Math.min(100,(current-min)/(max-min)*100));input.style.setProperty('--slider-progress',`${percent}%`);input.setAttribute('aria-valuenow',String(current));};
      update();input.addEventListener('input',update);input.addEventListener('change',update);return;
    }
    if(type==='LoadingRing'||type==='ProgressRing'||type==='ProgressBar'){
      const ring=type!=='ProgressBar',percent=Math.max(0,Math.min(100,Number(value(host,'value','0'))||0)),busy=isTrue(value(host,'indeterminate'));
      host.setAttribute('role','progressbar');if(busy){host.setAttribute('aria-label',value(host,'label','Loading'));if(!ring)host.setAttribute('aria-busy','true');}else{host.setAttribute('aria-valuemin','0');host.setAttribute('aria-valuemax','100');host.setAttribute('aria-valuenow',String(percent));}
      if(ring){host.classList.add('winui-progress-ring');host.innerHTML='<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>';}
      else{host.classList.add('winui-progress');host.innerHTML=`<span style="width:${percent}%"></span>`;}return;
    }
    if(type==='AppLayout'){host.classList.add('winui-layout');return;}
    if(type==='Sidebar'){
      host.classList.add('winui-sidebar');host.dataset.collapsed=String(isTrue(value(host,'collapsed')));host.setAttribute('aria-label',value(host,'label','Navigation'));
      let locator=host.querySelector(':scope > .winui-sidebar-indicator');if(!locator){locator=document.createElement('span');locator.className='winui-sidebar-indicator';locator.setAttribute('aria-hidden','true');host.prepend(locator);}
      const move=()=>{const active=host.querySelector('.winui-sidebar-item[aria-current="page"]');if(!active){locator.dataset.visible='false';return;}const side=host.getBoundingClientRect(),row=active.getBoundingClientRect();locator.style.transform=`translateY(${row.top-side.top+(row.height-16)/2}px)`;locator.dataset.visible='true';};
      host._winuiMoveLocator=move;host._winuiSetCollapsed=collapsed=>{host.dataset.collapsed=String(Boolean(collapsed));host.setAttribute('aria-expanded',String(!collapsed));document.querySelectorAll('.winui-sidebar-toggle').forEach(toggle=>{if(toggle._winuiTarget===host)toggle.setAttribute('aria-expanded',String(!collapsed));});requestAnimationFrame(move);};
      host.addEventListener('click',event=>{const item=event.target.closest('.winui-sidebar-item');if(!item||!host.contains(item))return;host.querySelectorAll('.winui-sidebar-item[aria-current="page"]').forEach(old=>old.removeAttribute('aria-current'));item.setAttribute('aria-current','page');requestAnimationFrame(move);});
      host.addEventListener('transitionend',move);window.addEventListener('resize',move,{passive:true});requestAnimationFrame(move);return;
    }
    if(type==='SidebarToggle'){
      host.classList.add('winui-sidebar-toggle');if(host.tagName==='BUTTON')host.type='button';host.setAttribute('aria-label',value(host,'label','Toggle navigation'));
      host.innerHTML=`<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="winui-sidebar-toggle-label">${escapeHtml(value(host,'content'))}</span>`;
      const selector=value(host,'target'),find=()=>selector?document.querySelector(selector):host.closest('.winui-layout')?.querySelector('.winui-sidebar');host._winuiTarget=find();
      if(host._winuiTarget){host.setAttribute('aria-controls',host._winuiTarget.id||'');host.setAttribute('aria-expanded',String(host._winuiTarget.dataset.collapsed!=='true'));}
      host.addEventListener('click',()=>{const side=find();if(side?._winuiSetCollapsed)side._winuiSetCollapsed(side.dataset.collapsed!=='true');});return;
    }
    if(type==='SidebarItem'){
      host.classList.add('winui-sidebar-item');if(!host.hasAttribute('tabindex'))host.tabIndex=0;if(!host.hasAttribute('role'))host.setAttribute('role','button');
      host.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();host.click();}});return;
    }
    if(type==='Content'){host.classList.add('winui-content');return;}
    if(type==='StackPanel'){host.classList.add('winui-stack');host.dataset.orientation=value(host,'orientation','vertical');return;}
    if(type==='GridPanel'){host.classList.add('winui-grid');host.style.setProperty('--winui-columns',value(host,'columns','1fr 1fr'));return;}
    if(type==='TextBlock'){host.classList.add('winui-text-block');return;}
    if(type==='Card'){host.classList.add('winui-card');return;}
    if(type==='Separator'){host.classList.add('winui-separator');host.setAttribute('role','separator');return;}
    if(type==='InfoBadge'){host.classList.add('winui-info-badge');if(value(host,'content'))host.textContent=value(host,'content');return;}
    if(type==='InfoBar'){host.classList.add('winui-info-bar');host.dataset.severity=value(host,'severity','informational');host.setAttribute('role','status');return;}
    if(type==='Expander'){
      const children=[...host.childNodes],heading=value(host,'header','Details'),expanded=isTrue(value(host,'expanded'));host.innerHTML=`<button class="winui-expander-header" type="button" aria-expanded="${expanded}">${escapeHtml(heading)}<span aria-hidden="true">⌄</span></button><div class="winui-expander-content"></div>`;
      const content=host.querySelector('.winui-expander-content');children.forEach(child=>content.append(child));const trigger=host.querySelector('button');content.hidden=!expanded;trigger.addEventListener('click',()=>{const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));content.hidden=!open;});host.classList.add('winui-expander');return;
    }
    if(type==='TabView'){
      const tabs=getItems(host),selected=Math.min(Math.max(0,Number(value(host,'selected-index','0'))),Math.max(0,tabs.length-1));host.classList.add('winui-tabs');
      host.innerHTML=`<div class="winui-tab-list" role="tablist">${tabs.map((tab,index)=>`<button type="button" role="tab" class="winui-tab" aria-selected="${index===selected}" tabindex="${index===selected?0:-1}" data-index="${index}">${escapeHtml(tab)}</button>`).join('')}</div><div class="winui-tab-panel" role="tabpanel"></div>`;
      const buttons=[...host.querySelectorAll('[role="tab"]')],panel=host.querySelector('[role="tabpanel"]'),activate=index=>{buttons.forEach((item,i)=>{item.setAttribute('aria-selected',String(i===index));item.tabIndex=i===index?0:-1;});panel.textContent=tabs[index]||'';};activate(selected);
      buttons.forEach((item,index)=>{item.addEventListener('click',()=>activate(index));item.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;activate(next);buttons[next]?.focus();});});return;
    }
    if(type==='ListView'||type==='TreeView'){setupList(host,type);return;}
    if(type==='MenuFlyout'){host.innerHTML=`${button(escapeHtml(label),' winui-button--dropdown',' aria-haspopup="menu" aria-expanded="false"')}${menuMarkup(getItems(host))}`;attachMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host);return;}
    if(type==='MessageDialog'){
      host.innerHTML=`${button(escapeHtml(label||'Show dialog'))}<dialog class="winui-dialog"><div class="winui-dialog-title">${escapeHtml(value(host,'title','Dialog'))}</div><p>${escapeHtml(value(host,'message','This is a dialog message.'))}</p><form method="dialog"><button class="winui-button" value="ok">${escapeHtml(value(host,'close-text','OK'))}</button></form></dialog>`;
      const dialog=host.querySelector('dialog');host.querySelector('.winui-button').addEventListener('click',()=>dialog.showModal());return;
    }
    host.classList.remove('elements-control');host.dataset.winuiReady='false';
  }
  function scan(root){if(root.matches?.(SELECTOR))render(root);root.querySelectorAll?.(SELECTOR).forEach(render);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(document));else scan(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node);}))).observe(document.documentElement,{childList:true,subtree:true});
})();
