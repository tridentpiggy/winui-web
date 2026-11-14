/* winui-web: no framework, XAML, or C#; every component is selected with winui-prev. */
(() => {
  'use strict';
  const SELECTOR = '[winui-prev]';
  const CHEVRON = '<svg class="winui-chevron" viewBox="0 0 8.1 4.6" aria-hidden="true"><path d="M.2.2a.5.5 0 0 1 .7 0l3.15 3.15L7.2.2a.5.5 0 0 1 .7.7L4.4 4.4a.5.5 0 0 1-.7 0L.2.9a.5.5 0 0 1 0-.7Z"/></svg>';
  const ICON = '<span class="winui-toggle-icon" aria-hidden="true"><i></i><i></i><i></i></span>';
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const truthy = value => value === '' || value === 'true' || value === '1';

  function itemsFor(host) {
    const raw = host.getAttribute('winui-items');
    if (raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String); } catch (_) { /* use child options */ }
    }
    return [...host.querySelectorAll(':scope > option')].map(option => option.textContent.trim());
  }
  function disabled(host) { return truthy(host.getAttribute('winui-disabled')) || host.hasAttribute('disabled'); }
  function buttonMarkup(label, classes = '', extra = '') {
    return `<button type="button" class="winui-button${classes}"${extra}>${label}</button>`;
  }
  function menuMarkup(items, role = 'menu') {
    const itemRole = role === 'listbox' ? 'option' : 'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="${itemRole}" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function menuController(menu, trigger, host) {
    let closeTimer;
    const close = (restoreFocus = false) => {
      if (menu.hidden || menu.dataset.state === 'closing') { if (restoreFocus) trigger.focus(); return; }
      menu.dataset.state = 'closing';
      trigger.setAttribute('aria-expanded', 'false');
      closeTimer = window.setTimeout(() => { menu.hidden = true; menu.dataset.state = 'closed'; }, 110);
      if (restoreFocus) trigger.focus();
    };
    const open = (focusFirst = false) => {
      window.clearTimeout(closeTimer);
      menu.hidden = false; menu.dataset.state = 'open';
      trigger.setAttribute('aria-expanded', 'true');
      if (focusFirst) menu.querySelector('.winui-menu-item:not([hidden]):not(:disabled)')?.focus();
    };
    trigger.addEventListener('click', () => menu.hidden || menu.dataset.state === 'closing' ? open() : close());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(true); }
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
    });
    menu.addEventListener('click', event => {
      const item = event.target.closest('.winui-menu-item');
      if (!item || item.disabled) return;
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
  function setupButton(host, type, label, isDisabled) {
    const style = type === 'AccentButton' ? ' winui-button--accent' : type === 'ToggleButton' ? ' winui-button--toggle' : type === 'HyperlinkButton' ? ' winui-button--link' : '';
    const pressed = type === 'ToggleButton' && truthy(host.getAttribute('winui-checked'));
    host.innerHTML = buttonMarkup(esc(label), style, `${type === 'ToggleButton' ? ` aria-pressed="${pressed}"` : ''}${isDisabled ? ' disabled' : ''}`);
    if (type === 'ToggleButton') host.querySelector('button').addEventListener('click', event => {
      const button = event.currentTarget; button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
    });
  }
  function setupSidebar(host) {
    host.classList.add('winui-sidebar');
    const collapsed = truthy(host.getAttribute('winui-collapsed'));
    host.dataset.collapsed = String(collapsed);
    host.setAttribute('aria-label', host.getAttribute('winui-label') || 'Navigation');
    const layout = host.closest('.winui-layout') || host.parentElement;
    const updateToggles = () => {
      const selector = host.id ? `[winui-prev="SidebarToggle"][winui-target="#${CSS.escape(host.id)}"]` : '[winui-prev="SidebarToggle"]';
      (layout || document).querySelectorAll(selector).forEach(toggle => {
        toggle.setAttribute('aria-expanded', String(host.dataset.collapsed !== 'true'));
        toggle.setAttribute('aria-controls', host.id || '');
      });
    };
    host._winuiSetCollapsed = value => {
      host.dataset.collapsed = String(Boolean(value));
      host.setAttribute('aria-expanded', String(!value));
      updateToggles();
    };
    updateToggles();
  }
  function setupSidebarToggle(host) {
    host.classList.add('winui-sidebar-toggle');
    host.setAttribute('type', host.tagName === 'BUTTON' ? 'button' : 'button');
    host.setAttribute('aria-label', host.getAttribute('winui-label') || 'Toggle navigation');
    host.setAttribute('aria-expanded', 'true');
    host.innerHTML = `${ICON}<span class="winui-sidebar-toggle-label">${esc(host.getAttribute('winui-content') || 'Navigation')}</span>`;
    host.addEventListener('click', () => {
      const target = host.getAttribute('winui-target');
      const sidebar = target ? document.querySelector(target) : host.closest('.winui-layout')?.querySelector('.winui-sidebar');
      if (!sidebar?._winuiSetCollapsed) return;
      sidebar._winuiSetCollapsed(sidebar.dataset.collapsed !== 'true');
    });
  }
  function setupSidebarItem(host) {
    host.classList.add('winui-sidebar-item');
    if (!host.hasAttribute('role')) host.setAttribute('role', 'button');
    if (!host.hasAttribute('tabindex')) host.tabIndex = 0;
    host.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); host.click(); }
    });
  }
  function setupProgress(host, ring) {
    host.classList.add(ring ? 'winui-progress-ring' : 'winui-progress');
    const value = Number(host.getAttribute('winui-value') || 0);
    const indeterminate = truthy(host.getAttribute('winui-indeterminate'));
    if (ring) {
      host.setAttribute('role', 'progressbar');
      if (!indeterminate) { host.setAttribute('aria-valuemin', '0'); host.setAttribute('aria-valuemax', '100'); host.setAttribute('aria-valuenow', String(value)); }
      else host.setAttribute('aria-label', host.getAttribute('winui-label') || 'Loading');
      host.innerHTML = '<span class="winui-progress-ring-track"></span><span class="winui-progress-ring-indicator"></span>';
    } else {
      host.setAttribute('role', 'progressbar');
      if (!indeterminate) { host.setAttribute('aria-valuemin', '0'); host.setAttribute('aria-valuemax', '100'); host.setAttribute('aria-valuenow', String(value)); }
      else { host.setAttribute('aria-busy', 'true'); host.setAttribute('aria-label', host.getAttribute('winui-label') || 'Loading'); }
      host.innerHTML = `<span style="width:${Math.max(0, Math.min(100, value))}%"></span>`;
    }
  }
  function render(host) {
    if (host.dataset.winuiReady === 'true') return;
    const type = host.getAttribute('winui-prev');
    const label = host.getAttribute('winui-content') || type;
    const isDisabled = disabled(host);
    host.dataset.winuiReady = 'true';
    host.classList.add('elements-control');
    if (host.hasAttribute('winui-theme')) document.documentElement.dataset.winuiTheme = host.getAttribute('winui-theme');

    if (['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)) { setupButton(host, type, label, isDisabled); return; }
    if (type === 'DropDownButton') {
      host.innerHTML = `${buttonMarkup(`<span>${esc(label)}</span><svg class="winui-chevron" viewBox="0 0 8.1 4.6" aria-hidden="true"><path d="M.2.2a.5.5 0 0 1 .7 0l3.15 3.15L7.2.2a.5.5 0 0 1 .7.7L4.4 4.4a.5.5 0 0 1-.7 0L.2.9a.5.5 0 0 1 0-.7Z"/></svg>`, ' winui-button--dropdown', ` aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}`)}${menuMarkup(itemsFor(host))}`;
      menuController(host.querySelector('.winui-menu'), host.querySelector('.winui-button'), host); return;
    }
    if (type === 'SplitButton') {
      host.innerHTML = `<div class="winui-split">${buttonMarkup(esc(label), ' winui-split-primary', isDisabled ? ' disabled' : '')}${buttonMarkup('<svg class="winui-chevron" viewBox="0 0 8.1 4.6" aria-hidden="true"><path d="M.2.2a.5.5 0 0 1 .7 0l3.15 3.15L7.2.2a.5.5 0 0 1 .7.7L4.4 4.4a.5.5 0 0 1-.7 0L.2.9a.5.5 0 0 1 0-.7Z"/></svg>', ' winui-split-arrow', ` aria-label="More options" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}`)}</div>${menuMarkup(itemsFor(host))}`;
      menuController(host.querySelector('.winui-menu'), host.querySelector('.winui-split-arrow'), host); return;
    }
    if (type === 'ComboBox') {
      host.classList.add('winui-combo');
      host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(host.getAttribute('winui-placeholder') || 'Select an item')}"${isDisabled ? ' disabled' : ''}><span class="winui-combo-chevron"><svg class="winui-chevron" viewBox="0 0 8.1 4.6" aria-hidden="true"><path d="M.2.2a.5.5 0 0 1 .7 0l3.15 3.15L7.2.2a.5.5 0 0 1 .7.7L4.4 4.4a.5.5 0 0 1-.7 0L.2.9a.5.5 0 0 1 0-.7Z"/></svg></span>${menuMarkup(itemsFor(host), 'listbox')}`;
      const input = host.querySelector('input'); const menu = host.querySelector('.winui-menu');
      const controller = menuController(menu, input, host);
      const filter = () => { const query = input.value.toLocaleLowerCase(); menu.querySelectorAll('.winui-menu-item').forEach(item => { item.hidden = !item.dataset.value.toLocaleLowerCase().includes(query); }); };
      input.addEventListener('focus', () => { filter(); controller.open(); });
      input.addEventListener('input', () => { filter(); controller.open(); });
      input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' && menu.hidden) { event.preventDefault(); filter(); controller.open(true); }
        else if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); controller.close(); }
      });
      menu.addEventListener('click', event => { const item = event.target.closest('.winui-menu-item'); if (item) { input.value = item.dataset.value; input.dispatchEvent(new Event('change', { bubbles: true })); } });
      return;
    }
    if (type === 'AppLayout') { host.classList.add('winui-layout'); return; }
    if (type === 'Sidebar') { setupSidebar(host); return; }
    if (type === 'SidebarToggle') { setupSidebarToggle(host); return; }
    if (type === 'SidebarItem') { setupSidebarItem(host); return; }
    if (type === 'Content') { host.classList.add('winui-content'); return; }
    if (type === 'StackPanel') { host.classList.add('winui-stack'); host.dataset.orientation = host.getAttribute('winui-orientation') || 'vertical'; return; }
    if (type === 'GridPanel') { host.classList.add('winui-grid'); host.style.setProperty('--winui-columns', host.getAttribute('winui-columns') || '1fr 1fr'); return; }
    if (type === 'LoadingRing') { setupProgress(host, true); return; }
    if (type === 'ProgressBar') { setupProgress(host, false); return; }
    host.dataset.winuiReady = 'false'; host.classList.remove('elements-control');
  }
  function scan(root) {
    if (root.matches?.(SELECTOR)) render(root);
    root.querySelectorAll?.(SELECTOR).forEach(render);
    root.querySelectorAll?.('.winui-sidebar').forEach(sidebar => { if (sidebar._winuiSetCollapsed) sidebar._winuiSetCollapsed(sidebar.dataset.collapsed === 'true'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document)); else scan(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node); })))
    .observe(document.documentElement, { childList: true, subtree: true });
})();
