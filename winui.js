/* winui-web: unified winui-prev renderer. No framework, XAML, or C#. */
(() => {
  'use strict';
  const SELECTOR = '[winui-prev]';
  const ICON = '<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const yes = value => value === '' || value === 'true' || value === '1';
  const attr = (host, name, fallback = '') => host.getAttribute(`winui-${name}`) ?? fallback;
  function itemsFor(host) {
    try { const data = JSON.parse(attr(host, 'items', '[]')); if (Array.isArray(data)) return data.map(String); } catch (_) { /* accept options below */ }
    return [...host.querySelectorAll(':scope > option')].map(option => option.textContent.trim());
  }
  function button(label, classes = '', extra = '') { return `<button type="button" class="winui-button${classes}"${extra}>${label}</button>`; }
  function menuMarkup(items, role = 'menu') {
    const itemRole = role === 'listbox' ? 'option' : 'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="${itemRole}" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function bindMenu(menu, trigger, host) {
    let closeTimer;
    const close = (restore = false) => {
      if (menu.hidden) { if (restore) trigger.focus(); return; }
      menu.dataset.state = 'closing'; trigger.setAttribute('aria-expanded', 'false');
      closeTimer = setTimeout(() => { menu.hidden = true; menu.dataset.state = 'closed'; }, 110);
      if (restore) trigger.focus();
    };
    const open = (focus = false) => { clearTimeout(closeTimer); menu.hidden = false; menu.dataset.state = 'open'; trigger.setAttribute('aria-expanded', 'true'); if (focus) menu.querySelector('.winui-menu-item:not([hidden])')?.focus(); };
    trigger.addEventListener('click', () => menu.hidden || menu.dataset.state === 'closing' ? open() : close());
    trigger.addEventListener('keydown', event => { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); open(true); } if (event.key === 'Escape') { event.preventDefault(); close(true); } });
    menu.addEventListener('click', event => { const item = event.target.closest('.winui-menu-item'); if (!item) return; if (menu.role === 'listbox') trigger.value = item.dataset.value; close(true); });
    menu.addEventListener('keydown', event => {
      const entries = [...menu.querySelectorAll('.winui-menu-item:not([hidden])')], index = entries.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      else if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); const d = event.key === 'ArrowDown' ? 1 : -1; entries[(index + d + entries.length) % entries.length]?.focus(); }
      else if (event.key === 'Home') { event.preventDefault(); entries[0]?.focus(); }
      else if (event.key === 'End') { event.preventDefault(); entries.at(-1)?.focus(); }
      else if (event.key === 'Tab') close();
    });
    document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); });
    return { open, close };
  }
  function textControl(host, type) {
    const label = attr(host, 'content', attr(host, 'label'));
    const placeholder = esc(attr(host, 'placeholder'));
    const disabled = yes(attr(host, 'disabled')) ? ' disabled' : '';
    const common = `class="winui-input"${placeholder ? ` placeholder="${placeholder}"` : ''}${disabled}`;
    if (type === 'TextBox') host.innerHTML = `<input ${common} type="${attr(host,'type','text')}" value="${esc(attr(host,'value'))}" aria-label="${esc(label || placeholder || 'Text input')}">`;
    if (type === 'PasswordBox') host.innerHTML = `<input ${common} type="password" placeholder="${placeholder}" aria-label="${esc(label || 'Password')}">`;
    if (type === 'NumberBox') host.innerHTML = `<input ${common} type="number" value="${esc(attr(host,'value'))}" min="${esc(attr(host,'min'))}" max="${esc(attr(host,'max'))}" step="${esc(attr(host,'step','1'))}" aria-label="${esc(label || 'Number')}">`;
    if (type === 'SearchBox') host.innerHTML = `<label class="winui-search"><span aria-hidden="true">⌕</span><input ${common} type="search" placeholder="${placeholder || 'Search'}" aria-label="${esc(label || 'Search')}"></label>`;
    if (type === 'DatePicker') host.innerHTML = `<input ${common} type="date" value="${esc(attr(host,'value'))}" aria-label="${esc(label || 'Date')}">`;
    if (type === 'TimePicker') host.innerHTML = `<input ${common} type="time" value="${esc(attr(host,'value'))}" aria-label="${esc(label || 'Time')}">`;
    if (type === 'ColorPicker') host.innerHTML = `<label class="winui-color-picker"><input type="color" value="${esc(attr(host,'value','#0078d4'))}"${disabled}><span>${esc(label || 'Choose color')}</span></label>`;
    host.classList.add('winui-field');
  }
  function choiceControl(host, type) {
    const label = esc(attr(host,'content',attr(host,'label',''))), disabled = yes(attr(host,'disabled')) ? ' disabled' : '';
    if (type === 'CheckBox') {
      const checked = yes(attr(host,'checked')) ? ' checked' : '';
      host.innerHTML = `<label class="winui-choice"><input class="winui-check-input" type="checkbox"${checked}${disabled}><span class="winui-check-box" aria-hidden="true"></span><span>${label}</span></label>`;
    } else if (type === 'RadioButton') {
      const checked = yes(attr(host,'checked')) ? ' checked' : '';
      host.innerHTML = `<label class="winui-choice"><input class="winui-radio-input" type="radio" name="${esc(attr(host,'group','winui-radio'))}"${checked}${disabled}><span class="winui-radio-mark" aria-hidden="true"></span><span>${label}</span></label>`;
    } else {
      const checked = yes(attr(host,'checked')) ? ' checked' : '';
      host.innerHTML = `<label class="winui-switch"><span>${label}</span><input class="winui-switch-input" type="checkbox" role="switch"${checked}${disabled}><span class="winui-switch-track" aria-hidden="true"></span></label>`;
    }
  }
  function progress(host, ring) {
    const value = Math.max(0, Math.min(100, Number(attr(host,'value','0')) || 0)), busy = yes(attr(host,'indeterminate'));
    host.setAttribute('role','progressbar');
    if (busy) { host.setAttribute('aria-label', attr(host,'label','Loading')); if (!ring) host.setAttribute('aria-busy','true'); }
    else { host.setAttribute('aria-valuemin','0'); host.setAttribute('aria-valuemax','100'); host.setAttribute('aria-valuenow',String(value)); }
    if (ring) { host.classList.add('winui-progress-ring'); host.innerHTML = '<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>'; }
    else { host.classList.add('winui-progress'); host.innerHTML = `<span style="width:${value}%"></span>`; }
  }
  function sidebarToggle(host) {
    host.classList.add('winui-sidebar-toggle'); if (host.tagName === 'BUTTON') host.type = 'button';
    host.setAttribute('aria-label', attr(host,'label','Toggle navigation'));
    host.innerHTML = `${ICON}<span class="winui-sidebar-toggle-label">${esc(attr(host,'content'))}</span>`;
    const target = attr(host,'target');
    const find = () => target ? document.querySelector(target) : host.closest('.winui-layout')?.querySelector('.winui-sidebar');
    const sidebar = find(); host._winuiTarget = sidebar;
    if (sidebar) { host.setAttribute('aria-controls',sidebar.id || ''); host.setAttribute('aria-expanded',String(sidebar.dataset.collapsed !== 'true')); }
    host.addEventListener('click', () => { const side = find(); if (side?._winuiSetCollapsed) side._winuiSetCollapsed(side.dataset.collapsed !== 'true'); });
  }
  function render(host) {
    if (host.dataset.winuiReady === 'true') return;
    const type = host.getAttribute('winui-prev'), label = attr(host,'content',type), disabled = yes(attr(host,'disabled')) || host.hasAttribute('disabled');
    host.dataset.winuiReady = 'true'; host.classList.add('elements-control');
    if (host.hasAttribute('winui-theme')) document.documentElement.dataset.winuiTheme = attr(host,'theme');
    if (['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)) {
      const cls = type === 'AccentButton' ? ' winui-button--accent' : type === 'ToggleButton' ? ' winui-button--toggle' : type === 'HyperlinkButton' ? ' winui-button--link' : '';
      host.innerHTML = button(esc(label),cls,`${type === 'ToggleButton' ? ` aria-pressed="${yes(attr(host,'checked'))}"` : ''}${disabled ? ' disabled' : ''}`);
      if (type === 'ToggleButton') host.querySelector('button').addEventListener('click',e => e.currentTarget.setAttribute('aria-pressed',e.currentTarget.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    if (type === 'DropDownButton') { host.innerHTML = `${button(`<span>${esc(label)}</span><svg class="winui-chevron" viewBox="0 0 8 5"><path d="m1 1 3 3 3-3" fill="none" stroke="currentColor"/></svg>`,' winui-button--dropdown',` aria-haspopup="menu" aria-expanded="false"${disabled?' disabled':''}`)}${menuMarkup(itemsFor(host))}`; bindMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host); return; }
    if (type === 'SplitButton') { host.innerHTML = `<div class="winui-split">${button(esc(label),' winui-split-primary',disabled?' disabled':'')}${button('<svg class="winui-chevron" viewBox="0 0 8 5"><path d="m1 1 3 3 3-3" fill="none" stroke="currentColor"/></svg>',' winui-split-arrow',` aria-label="More options" aria-haspopup="menu" aria-expanded="false"${disabled?' disabled':''}`)}</div>${menuMarkup(itemsFor(host))}`; bindMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-split-arrow'),host); return; }
    if (type === 'ComboBox') { host.classList.add('winui-combo'); host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(attr(host,'placeholder','Select an item'))}"${disabled?' disabled':''}><span class="winui-combo-chevron">⌄</span>${menuMarkup(itemsFor(host),'listbox')}`; const input=host.querySelector('input'),menu=host.querySelector('.winui-menu'),controller=bindMenu(menu,input,host),filter=()=>{const q=input.value.toLocaleLowerCase();menu.querySelectorAll('.winui-menu-item').forEach(item=>item.hidden=!item.dataset.value.toLocaleLowerCase().includes(q));};input.addEventListener('focus',()=>{filter();controller.open();});input.addEventListener('input',()=>{filter();controller.open();});menu.addEventListener('click',e=>{const item=e.target.closest('.winui-menu-item');if(item){input.value=item.dataset.value;input.dispatchEvent(new Event('change',{bubbles:true}));}});return; }
    if (['TextBox','PasswordBox','NumberBox','SearchBox','DatePicker','TimePicker','ColorPicker'].includes(type)) { textControl(host,type); return; }
    if (['CheckBox','RadioButton','ToggleSwitch'].includes(type)) { choiceControl(host,type); return; }
    if (type === 'Slider') { const value=Number(attr(host,'value','50')),min=Number(attr(host,'min','0')),max=Number(attr(host,'max','100')); host.classList.add('winui-slider');host.innerHTML=`<input class="winui-slider-input" type="range" min="${min}" max="${max}" step="${esc(attr(host,'step','1'))}" value="${value}" aria-label="${esc(attr(host,'label','Slider'))}"${disabled?' disabled':''}>`; return; }
    if (type === 'LoadingRing' || type === 'ProgressRing') { progress(host,true); return; }
    if (type === 'ProgressBar') { progress(host,false); return; }
    if (type === 'TextBlock') { host.classList.add('winui-text-block'); return; }
    if (type === 'Card') { host.classList.add('winui-card'); return; }
    if (type === 'Separator') { host.classList.add('winui-separator'); host.setAttribute('role','separator'); return; }
    if (type === 'InfoBadge') { host.classList.add('winui-info-badge'); if (attr(host,'content')) host.textContent=attr(host,'content'); return; }
    if (type === 'InfoBar') { host.classList.add('winui-info-bar'); host.dataset.severity=attr(host,'severity','informational'); host.setAttribute('role','status'); return; }
    if (type === 'AppLayout') { host.classList.add('winui-layout'); return; }
    if (type === 'Sidebar') { host.classList.add('winui-sidebar');host.dataset.collapsed=String(yes(attr(host,'collapsed')));host.setAttribute('aria-label',attr(host,'label','Navigation'));host._winuiSetCollapsed=value=>{host.dataset.collapsed=String(Boolean(value));host.setAttribute('aria-expanded',String(!value));document.querySelectorAll('.winui-sidebar-toggle').forEach(t=>{if(t._winuiTarget===host)t.setAttribute('aria-expanded',String(!value));});};return; }
    if (type === 'SidebarToggle') { sidebarToggle(host); return; }
    if (type === 'SidebarItem') { host.classList.add('winui-sidebar-item');if(!host.hasAttribute('tabindex'))host.tabIndex=0;if(!host.hasAttribute('role'))host.setAttribute('role','button');host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();host.click();}});return; }
    if (type === 'Content') { host.classList.add('winui-content'); return; }
    if (type === 'StackPanel') { host.classList.add('winui-stack');host.dataset.orientation=attr(host,'orientation','vertical');return; }
    if (type === 'GridPanel') { host.classList.add('winui-grid');host.style.setProperty('--winui-columns',attr(host,'columns','1fr 1fr'));return; }
    if (type === 'Expander') { const children=[...host.childNodes];const heading=attr(host,'header','Details');host.innerHTML=`<button class="winui-expander-header" type="button" aria-expanded="${yes(attr(host,'expanded'))}">${esc(heading)}<span aria-hidden="true">⌄</span></button><div class="winui-expander-content"></div>`;const content=host.querySelector('.winui-expander-content');children.forEach(child=>content.append(child));const trigger=host.querySelector('button');content.hidden=!yes(attr(host,'expanded'));trigger.addEventListener('click',()=>{const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));content.hidden=!open;});host.classList.add('winui-expander');return; }
    if (type === 'TabView') { const labels=itemsFor(host);const initial=Math.max(0,Number(attr(host,'selected-index','0')));host.classList.add('winui-tabs');host.innerHTML=`<div class="winui-tab-list" role="tablist">${labels.map((x,i)=>`<button type="button" role="tab" class="winui-tab" aria-selected="${i===initial}" tabindex="${i===initial?0:-1}" data-index="${i}">${esc(x)}</button>`).join('')}</div><div class="winui-tab-panel" role="tabpanel">${esc(labels[initial]||'')}</div>`;const tabs=[...host.querySelectorAll('[role=tab]')],panel=host.querySelector('[role=tabpanel]');const activate=i=>{tabs.forEach((tab,j)=>{tab.setAttribute('aria-selected',String(j===i));tab.tabIndex=j===i?0:-1;});panel.textContent=labels[i]||'';};tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(i));tab.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:labels.length-1))%labels.length;activate(n);tabs[n]?.focus();}});});return; }
    if (type === 'ListView' || type === 'TreeView') { const list=itemsFor(host);host.classList.add(type==='TreeView'?'winui-tree':'winui-list-view');host.setAttribute('role','list');host.innerHTML=list.map((x,i)=>`<button type="button" class="winui-list-item" role="listitem" aria-selected="false" data-index="${i}">${type==='TreeView'?'<span aria-hidden="true">›</span>':''}${esc(x)}</button>`).join('');host.addEventListener('click',e=>{const item=e.target.closest('.winui-list-item');if(!item)return;host.querySelectorAll('.winui-list-item').forEach(x=>x.setAttribute('aria-selected',String(x===item)));});return; }
    if (type === 'MenuFlyout') { const items=itemsFor(host);host.innerHTML=`${button(esc(label),' winui-button--dropdown',' aria-haspopup="menu" aria-expanded="false"')} ${menuMarkup(items)}`;bindMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host);return; }
    if (type === 'MessageDialog') { const message=esc(attr(host,'message','This is a dialog message.'));host.innerHTML=`${button(esc(label||'Show dialog'))}<dialog class="winui-dialog"><div class="winui-dialog-title">${esc(attr(host,'title','Dialog'))}</div><p>${message}</p><form method="dialog"><button class="winui-button" value="ok">${esc(attr(host,'close-text','OK'))}</button></form></dialog>`;const dialog=host.querySelector('dialog');host.querySelector('.winui-button').addEventListener('click',()=>dialog.showModal());return; }
    host.classList.remove('elements-control');host.dataset.winuiReady='false';
  }
  function scan(root){if(root.matches?.(SELECTOR))render(root);root.querySelectorAll?.(SELECTOR).forEach(render);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(document));else scan(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node);}))).observe(document.documentElement,{childList:true,subtree:true});
})();
