/* winui-web: dependency-free controls; interactions do not return values. */
(() => {
  'use strict';
  const SELECTOR = 'elements[winui-prev]';
  const CHEVRON = '<svg class="winui-chevron" viewBox="0 0 8.1 4.6" aria-hidden="true"><path d="M.2.2a.5.5 0 0 1 .7 0l3.15 3.15L7.2.2a.5.5 0 0 1 .7.7L4.4 4.4a.5.5 0 0 1-.7 0L.2.9a.5.5 0 0 1 0-.7Z"/></svg>';
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function itemsFor(host) {
    const raw = host.getAttribute('winui-items');
    if (raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String); } catch (_) { /* use child options */ }
    }
    return [...host.querySelectorAll(':scope > option')].map(option => option.textContent.trim());
  }
  function disabled(host) { return host.getAttribute('winui-disabled') === 'true' || host.hasAttribute('disabled'); }
  function menuMarkup(items, role = 'menu') {
    const itemRole = role === 'listbox' ? 'option' : 'menuitem';
    return `<div class="winui-menu" role="${role}" data-state="closed" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="${itemRole}" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function menuController(menu, trigger, host, { focusRole = '.winui-menu-item' } = {}) {
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
      menu.hidden = false;
      menu.dataset.state = 'open';
      trigger.setAttribute('aria-expanded', 'true');
      if (focusFirst) menu.querySelector(focusRole)?.focus();
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
  function render(host) {
    if (host.dataset.winuiReady === 'true') return;
    const type = host.getAttribute('winui-prev');
    const label = host.getAttribute('winui-content') || type;
    const isDisabled = disabled(host);
    host.classList.add('elements-control');
    host.dataset.winuiReady = 'true';
    if (host.hasAttribute('winui-theme')) document.documentElement.dataset.winuiTheme = host.getAttribute('winui-theme');

    if (['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)) {
      const style = type === 'AccentButton' ? ' winui-button--accent' : type === 'ToggleButton' ? ' winui-button--toggle' : type === 'HyperlinkButton' ? ' winui-button--link' : '';
      const pressed = type === 'ToggleButton' && host.getAttribute('winui-checked') === 'true';
      host.innerHTML = `<button type="button" class="winui-button${style}"${type === 'ToggleButton' ? ` aria-pressed="${pressed}"` : ''}${isDisabled ? ' disabled' : ''}>${esc(label)}</button>`;
      if (type === 'ToggleButton') host.querySelector('button').addEventListener('click', event => {
        const button = event.currentTarget; button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
      });
      return;
    }
    if (type === 'DropDownButton') {
      const items = itemsFor(host);
      host.innerHTML = `<button type="button" class="winui-button winui-button--dropdown" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}><span>${esc(label)}</span>${CHEVRON}</button>${menuMarkup(items)}`;
      menuController(host.querySelector('.winui-menu'), host.querySelector('.winui-button'), host);
      return;
    }
    if (type === 'SplitButton') {
      const items = itemsFor(host);
      host.innerHTML = `<div class="winui-split"><button type="button" class="winui-button winui-split-primary"${isDisabled ? ' disabled' : ''}>${esc(label)}</button><button type="button" class="winui-button winui-split-arrow" aria-label="More options" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}>${CHEVRON}</button></div>${menuMarkup(items)}`;
      menuController(host.querySelector('.winui-menu'), host.querySelector('.winui-split-arrow'), host);
      return;
    }
    if (type === 'ComboBox') {
      const items = itemsFor(host);
      const placeholder = host.getAttribute('winui-placeholder') || 'Select an item';
      host.classList.add('winui-combo');
      host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(placeholder)}"${isDisabled ? ' disabled' : ''}><span class="winui-combo-chevron">${CHEVRON}</span>${menuMarkup(items, 'listbox')}`;
      const input = host.querySelector('input');
      const menu = host.querySelector('.winui-menu');
      const controller = menuController(menu, input, host);
      const filter = () => {
        const query = input.value.toLocaleLowerCase();
        menu.querySelectorAll('.winui-menu-item').forEach(item => { item.hidden = !item.dataset.value.toLocaleLowerCase().includes(query); });
      };
      input.addEventListener('focus', () => { filter(); controller.open(); });
      input.addEventListener('input', () => { filter(); controller.open(); });
      input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' && menu.hidden) { event.preventDefault(); filter(); controller.open(true); }
        else if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); controller.close(); }
      });
      menu.addEventListener('click', event => {
        const item = event.target.closest('.winui-menu-item');
        if (!item) return;
        input.value = item.dataset.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return;
    }
    host.dataset.winuiReady = 'false';
    host.classList.remove('elements-control');
  }
  function scan(root) {
    if (root.matches?.(SELECTOR)) render(root);
    root.querySelectorAll?.(SELECTOR).forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document));
  else scan(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node); })))
    .observe(document.documentElement, { childList: true, subtree: true });
})();
