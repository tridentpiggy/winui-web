/* winui-web: dependency-free controls, all selected with [winui-prev]. */
(() => {
  'use strict';
  const SELECTOR = '[winui-prev]';
  const CHEVRON = '<svg class="winui-chevron" viewBox="0 0 8 5" aria-hidden="true"><path d="m1 1 3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr = (node, name, fallback = '') => node.getAttribute(`winui-${name}`) ?? fallback;
  const yes = value => value === '' || value === 'true' || value === '1';
  const disabled = host => yes(attr(host, 'disabled')) || host.hasAttribute('disabled');
  const button = (text, classes = '', extra = '') => `<button type="button" class="winui-button${classes}"${extra}>${text}</button>`;

  function itemsFor(host) {
    const raw = attr(host, 'items');
    if (raw) {
      try { const values = JSON.parse(raw); if (Array.isArray(values)) return values.map(String); } catch (_) { /* use child options */ }
    }
    return [...host.querySelectorAll(':scope > option')].map(option => option.textContent.trim());
  }
  function menuMarkup(items, role = 'menu') {
    const itemRole = role === 'listbox' ? 'option' : 'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="${itemRole}" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function bindMenu(menu, trigger, host, onSelect = () => {}) {
    let closeTimer;
    const close = (restoreFocus = false) => {
      if (menu.hidden) { if (restoreFocus) trigger.focus(); return; }
      menu.dataset.state = 'closing';
      trigger.setAttribute('aria-expanded', 'false');
      closeTimer = window.setTimeout(() => { menu.hidden = true; menu.dataset.state = 'closed'; }, 110);
      if (restoreFocus) trigger.focus();
    };
    const open = (focusFirst = false) => {
      window.clearTimeout(closeTimer);
      menu.hidden = false;
      menu.dataset.state = 'open';
      trigger.setAttribute('aria-expanded', 'true');
      if (focusFirst) menu.querySelector('.winui-menu-item:not([hidden]):not(:disabled)')?.focus();
    };
    trigger.addEventListener('click', () => menu.hidden || menu.dataset.state === 'closing' ? open() : close());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(true); }
      else if (event.key === 'Escape') { event.preventDefault(); close(true); }
    });
    menu.addEventListener('click', event => {
      const item = event.target.closest('.winui-menu-item');
      if (!item || item.disabled) return;
      onSelect(item.dataset.value, item);
      if (menu.getAttribute('role') === 'listbox') trigger.value = item.dataset.value;
      close(true);
    });
    menu.addEventListener('keydown', event => {
      const entries = [...menu.querySelectorAll('.winui-menu-item:not([hidden]):not(:disabled)')];
      const index = entries.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); const direction = event.key === 'ArrowDown' ? 1 : -1;
        entries[(index + direction + entries.length) % entries.length]?.focus();
      } else if (event.key === 'Home') { event.preventDefault(); entries[0]?.focus(); }
      else if (event.key === 'End') { event.preventDefault(); entries.at(-1)?.focus(); }
      else if (event.key === 'Tab') close();
    });
    document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); });
    return { open, close };
  }
  function setupCombo(host, isDisabled) {
    host.classList.add('winui-combo');
    const placeholder = esc(attr(host, 'placeholder', 'Select an item'));
    host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${placeholder}"${isDisabled ? ' disabled' : ''}><span class="winui-combo-chevron" aria-hidden="true">${CHEVRON}</span>${menuMarkup(itemsFor(host), 'listbox')}`;
    const input = host.querySelector('input');
    const menu = host.querySelector('.winui-menu');
    const controller = bindMenu(menu, input, host, value => {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const filter = () => {
      const query = input.value.toLocaleLowerCase();
      menu.querySelectorAll('.winui-menu-item').forEach(item => { item.hidden = !item.dataset.value.toLocaleLowerCase().includes(query); });
    };
    input.addEventListener('focus', () => { filter(); controller.open(); });
    input.addEventListener('input', () => { filter(); controller.open(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); filter(); controller.open(true);
      } else if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault(); controller.close();
      }
    });
  }
  function setupTextInput(host, type, isDisabled) {
    const label = esc(attr(host, 'label', attr(host, 'content', type)));
    const placeholder = esc(attr(host, 'placeholder'));
    const value = esc(attr(host, 'value'));
    const disabledAttr = isDisabled ? ' disabled' : '';
    const common = `class="winui-input" aria-label="${label}"${disabledAttr}`;
    switch (type) {
      case 'TextBox': host.innerHTML = `<input ${common} type="${esc(attr(host, 'type', 'text'))}" value="${value}"${placeholder ? ` placeholder="${placeholder}"` : ''}>`; break;
      case 'PasswordBox': host.innerHTML = `<input ${common} type="password"${placeholder ? ` placeholder="${placeholder}"` : ''}>`; break;
      case 'NumberBox': host.innerHTML = `<input ${common} type="number" value="${value}" min="${esc(attr(host, 'min'))}" max="${esc(attr(host, 'max'))}" step="${esc(attr(host, 'step', '1'))}">`; break;
      case 'SearchBox': host.innerHTML = `<label class="winui-search"><span aria-hidden="true">⌕</span><input ${common} type="search"${placeholder ? ` placeholder="${placeholder}"` : ''}></label>`; break;
      case 'DatePicker': host.innerHTML = `<input ${common} type="date" value="${value}">`; break;
      case 'TimePicker': host.innerHTML = `<input ${common} type="time" value="${value}">`; break;
      case 'ColorPicker': host.innerHTML = `<label class="winui-color-picker"><input type="color" value="${value || '#0078d4'}" aria-label="${label}"${disabledAttr}><span>${label}</span></label>`; break;
    }
    host.classList.add('winui-field');
  }
  function setupChoice(host, type, isDisabled) {
    const label = esc(attr(host, 'content', attr(host, 'label', '')));
    const checked = yes(attr(host, 'checked')) ? ' checked' : '';
    const disabledAttr = isDisabled ? ' disabled' : '';
    if (type === 'CheckBox') {
      host.innerHTML = `<label class="winui-choice"><input class="winui-check-input" type="checkbox"${checked}${disabledAttr}><span class="winui-check-box" aria-hidden="true"></span><span>${label}</span></label>`;
    } else if (type === 'RadioButton') {
      const group = esc(attr(host, 'group', 'winui-radio'));
      host.innerHTML = `<label class="winui-choice"><input class="winui-radio-input" type="radio" name="${group}"${checked}${disabledAttr}><span class="winui-radio-mark" aria-hidden="true"></span><span>${label}</span></label>`;
    } else {
      host.innerHTML = `<label class="winui-switch"><span>${label}</span><input class="winui-switch-input" type="checkbox" role="switch"${checked}${disabledAttr}><span class="winui-switch-track" aria-hidden="true"></span></label>`;
    }
  }
  function setupProgress(host, ring) {
    const value = Math.max(0, Math.min(100, Number(attr(host, 'value', '0')) || 0));
    const indeterminate = yes(attr(host, 'indeterminate'));
    host.setAttribute('role', 'progressbar');
    if (indeterminate) { host.setAttribute('aria-label', attr(host, 'label', 'Loading')); if (!ring) host.setAttribute('aria-busy', 'true'); }
    else { host.setAttribute('aria-valuemin', '0'); host.setAttribute('aria-valuemax', '100'); host.setAttribute('aria-valuenow', String(value)); }
    if (ring) { host.classList.add('winui-progress-ring'); host.innerHTML = '<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>'; }
    else { host.classList.add('winui-progress'); host.innerHTML = `<span style="width:${value}%"></span>`; }
  }
  function setupSidebarToggle(host) {
    host.classList.add('winui-sidebar-toggle');
    if (host.tagName === 'BUTTON') host.type = 'button';
    host.setAttribute('aria-label', attr(host, 'label', 'Toggle navigation'));
    host.innerHTML = `<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="winui-sidebar-toggle-label">${esc(attr(host, 'content'))}</span>`;
    const target = attr(host, 'target');
    const findSidebar = () => target ? document.querySelector(target) : host.closest('.winui-layout')?.querySelector('.winui-sidebar');
    const sidebar = findSidebar();
    host._winuiTarget = sidebar;
    if (sidebar) { host.setAttribute('aria-controls', sidebar.id || ''); host.setAttribute('aria-expanded', String(sidebar.dataset.collapsed !== 'true')); }
    host.addEventListener('click', () => { const current = findSidebar(); if (current?._winuiSetCollapsed) current._winuiSetCollapsed(current.dataset.collapsed !== 'true'); });
  }
  function setupList(host, type) {
    const values = itemsFor(host);
    host.classList.add(type === 'TreeView' ? 'winui-tree' : 'winui-list-view');
    host.setAttribute('role', 'list');
    host.innerHTML = values.map((value, index) => `<button type="button" class="winui-list-item" role="listitem" aria-selected="false" data-index="${index}">${type === 'TreeView' ? '<span aria-hidden="true">›</span>' : ''}${esc(value)}</button>`).join('');
    host.addEventListener('click', event => {
      const item = event.target.closest('.winui-list-item'); if (!item) return;
      host.querySelectorAll('.winui-list-item').forEach(entry => entry.setAttribute('aria-selected', String(entry === item)));
    });
  }
  function render(host) {
    if (host.dataset.winuiReady === 'true') return;
    const type = host.getAttribute('winui-prev');
    const label = attr(host, 'content', type);
    const isDisabled = disabled(host);
    host.dataset.winuiReady = 'true';
    host.classList.add('elements-control');
    if (host.hasAttribute('winui-theme')) document.documentElement.dataset.winuiTheme = attr(host, 'theme');
    if (['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)) {
      const style = type === 'AccentButton' ? ' winui-button--accent' : type === 'ToggleButton' ? ' winui-button--toggle' : type === 'HyperlinkButton' ? ' winui-button--link' : '';
      const checked = type === 'ToggleButton' && yes(attr(host, 'checked'));
      host.innerHTML = button(esc(label), style, `${type === 'ToggleButton' ? ` aria-pressed="${checked}"` : ''}${isDisabled ? ' disabled' : ''}`);
      if (type === 'ToggleButton') host.querySelector('button').addEventListener('click', event => event.currentTarget.setAttribute('aria-pressed', event.currentTarget.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    if (type === 'DropDownButton') {
      host.innerHTML = `${button(`<span>${esc(label)}</span>${CHEVRON}`, ' winui-button--dropdown', ` aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}`)}${menuMarkup(itemsFor(host))}`;
      bindMenu(host.querySelector('.winui-menu'), host.querySelector('.winui-button'), host); return;
    }
    if (type === 'SplitButton') {
      host.innerHTML = `<div class="winui-split">${button(esc(label), ' winui-split-primary', isDisabled ? ' disabled' : '')}${button(CHEVRON, ' winui-split-arrow', ` aria-label="More options" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}`)}</div>${menuMarkup(itemsFor(host))}`;
      bindMenu(host.querySelector('.winui-menu'), host.querySelector('.winui-split-arrow'), host); return;
    }
    if (type === 'ComboBox') {
      host.classList.add('winui-combo');
      host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(attr(host, 'placeholder', 'Select an item'))}"${isDisabled ? ' disabled' : ''}><span class="winui-combo-chevron" aria-hidden="true">${CHEVRON}</span>${menuMarkup(itemsFor(host), 'listbox')}`;
      const input = host.querySelector('input'), menu = host.querySelector('.winui-menu');
      const controller = bindMenu(menu, input, host, value => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); });
      const filter = () => { const query = input.value.toLocaleLowerCase(); menu.querySelectorAll('.winui-menu-item').forEach(item => { item.hidden = !item.dataset.value.toLocaleLowerCase().includes(query); }); };
      input.addEventListener('focus', () => { filter(); controller.open(); });
      input.addEventListener('input', () => { filter(); controller.open(); });
      input.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); filter(); controller.open(true); } else if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); controller.close(); } });
      return;
    }
    if (['TextBox','PasswordBox','NumberBox','SearchBox','DatePicker','TimePicker','ColorPicker'].includes(type)) { setupTextInput(host, type, isDisabled); return; }
    if (['CheckBox','RadioButton','ToggleSwitch'].includes(type)) { setupChoice(host, type, isDisabled); return; }
    if (type === 'Slider') {
      host.classList.add('winui-slider');
      host.innerHTML = `<input class="winui-slider-input" type="range" min="${esc(attr(host,'min','0'))}" max="${esc(attr(host,'max','100'))}" step="${esc(attr(host,'step','1'))}" value="${esc(attr(host,'value','50'))}" aria-label="${esc(attr(host,'label','Slider'))}"${isDisabled?' disabled':''}>`; return;
    }
    if (type === 'LoadingRing' || type === 'ProgressRing') { setupProgress(host, true); return; }
    if (type === 'ProgressBar') { setupProgress(host, false); return; }
    if (type === 'TextBlock') { host.classList.add('winui-text-block'); return; }
    if (type === 'Card') { host.classList.add('winui-card'); return; }
    if (type === 'Separator') { host.classList.add('winui-separator'); host.setAttribute('role','separator'); return; }
    if (type === 'InfoBadge') { host.classList.add('winui-info-badge'); if (attr(host,'content')) host.textContent=attr(host,'content'); return; }
    if (type === 'InfoBar') { host.classList.add('winui-info-bar'); host.dataset.severity=attr(host,'severity','informational'); host.setAttribute('role','status'); return; }
    if (type === 'AppLayout') { host.classList.add('winui-layout'); return; }
    if (type === 'Sidebar') {
      host.classList.add('winui-sidebar'); host.dataset.collapsed=String(yes(attr(host,'collapsed'))); host.setAttribute('aria-label',attr(host,'label','Navigation'));
      host._winuiSetCollapsed = value => { host.dataset.collapsed=String(Boolean(value)); host.setAttribute('aria-expanded',String(!value)); document.querySelectorAll('.winui-sidebar-toggle').forEach(toggle => { if(toggle._winuiTarget===host) toggle.setAttribute('aria-expanded',String(!value)); }); };
      return;
    }
    if (type === 'SidebarToggle') { setupSidebarToggle(host); return; }
    if (type === 'SidebarItem') {
      host.classList.add('winui-sidebar-item'); if(!host.hasAttribute('tabindex')) host.tabIndex=0; if(!host.hasAttribute('role')) host.setAttribute('role','button');
      host.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();host.click();}}); return;
    }
    if (type === 'Content') { host.classList.add('winui-content'); return; }
    if (type === 'StackPanel') { host.classList.add('winui-stack'); host.dataset.orientation=attr(host,'orientation','vertical'); return; }
    if (type === 'GridPanel') { host.classList.add('winui-grid'); host.style.setProperty('--winui-columns',attr(host,'columns','1fr 1fr')); return; }
    if (type === 'Expander') {
      const children=[...host.childNodes], heading=attr(host,'header','Details'); host.innerHTML=`<button class="winui-expander-header" type="button" aria-expanded="${yes(attr(host,'expanded'))}">${esc(heading)}<span aria-hidden="true">⌄</span></button><div class="winui-expander-content"></div>`;
      const content=host.querySelector('.winui-expander-content'); children.forEach(child=>content.append(child)); const trigger=host.querySelector('button'); content.hidden=!yes(attr(host,'expanded'));
      trigger.addEventListener('click',()=>{const open=trigger.getAttribute('aria-expanded')!=='true';trigger.setAttribute('aria-expanded',String(open));content.hidden=!open;}); host.classList.add('winui-expander'); return;
    }
    if (type === 'TabView') {
      const tabs=itemsFor(host), initial=Math.max(0,Number(attr(host,'selected-index','0'))); host.classList.add('winui-tabs');
      host.innerHTML=`<div class="winui-tab-list" role="tablist">${tabs.map((name,index)=>`<button type="button" role="tab" class="winui-tab" aria-selected="${index===initial}" tabindex="${index===initial?0:-1}" data-index="${index}">${esc(name)}</button>`).join('')}</div><div class="winui-tab-panel" role="tabpanel"></div>`;
      const buttons=[...host.querySelectorAll('[role="tab"]')], panel=host.querySelector('[role="tabpanel"]');
      const activate=index=>{buttons.forEach((item,i)=>{item.setAttribute('aria-selected',String(i===index));item.tabIndex=i===index?0:-1;});panel.textContent=tabs[index]||'';}; activate(initial);
      buttons.forEach((item,index)=>{item.addEventListener('click',()=>activate(index));item.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;activate(next);buttons[next]?.focus();});}); return;
    }
    if (type === 'ListView' || type === 'TreeView') { setupList(host,type); return; }
    if (type === 'MenuFlyout') {
      host.innerHTML=`${button(esc(label),' winui-button--dropdown',' aria-haspopup="menu" aria-expanded="false"')}${menuMarkup(itemsFor(host))}`;
      bindMenu(host.querySelector('.winui-menu'),host.querySelector('.winui-button'),host); return;
    }
    if (type === 'MessageDialog') {
      host.innerHTML=`${button(esc(label||'Show dialog'))}<dialog class="winui-dialog"><div class="winui-dialog-title">${esc(attr(host,'title','Dialog'))}</div><p>${esc(attr(host,'message','This is a dialog message.'))}</p><form method="dialog"><button class="winui-button" value="ok">${esc(attr(host,'close-text','OK'))}</button></form></dialog>`;
      const dialog=host.querySelector('dialog');host.querySelector('.winui-button').addEventListener('click',()=>dialog.showModal());return;
    }
    host.classList.remove('elements-control'); host.dataset.winuiReady='false';
  }
  function scan(root) { if(root.matches?.(SELECTOR))render(root); root.querySelectorAll?.(SELECTOR).forEach(render); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(document));else scan(document);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node);}))).observe(document.documentElement,{childList:true,subtree:true});
})();
