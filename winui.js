/* winui-web: no dependencies, return values, or application data binding. */
(() => {
  'use strict';
  const SELECTOR = 'elements[winui-prev]';
  const CHEVRON = '<svg class="winui-chevron" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5-.8-.8L5 5.4 2.3 2.7z"/></svg>';
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function itemsFor(host) {
    const raw = host.getAttribute('winui-items');
    if (raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String); } catch (_) { /* fall through to child options */ }
    }
    return [...host.querySelectorAll(':scope > option')].map(option => option.textContent.trim());
  }
  function disabled(host) { return host.getAttribute('winui-disabled') === 'true' || host.hasAttribute('disabled'); }
  function setupMenu(host, menu, trigger, onChoose) {
    const close = (focus = false) => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); };
    const open = (focusFirst = false) => { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); if (focusFirst) menu.querySelector('.winui-menu-item')?.focus(); };
    trigger.addEventListener('click', () => menu.hidden ? open() : close());
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); open(true); }
      if (event.key === 'Escape') close(true);
    });
    menu.addEventListener('click', event => {
      const item = event.target.closest('.winui-menu-item'); if (!item) return;
      onChoose(item.dataset.value); close(true);
    });
    menu.addEventListener('keydown', event => {
      const buttons = [...menu.querySelectorAll('.winui-menu-item')]; const index = buttons.indexOf(document.activeElement);
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); buttons[(index + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length]?.focus(); }
      else if (event.key === 'Home') { event.preventDefault(); buttons[0]?.focus(); }
      else if (event.key === 'End') { event.preventDefault(); buttons.at(-1)?.focus(); }
    });
    document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); });
    return { open, close };
  }
  function menuMarkup(items) {
    return `<div class="winui-menu" role="menu" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="menuitem" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
  }
  function render(host) {
    if (host.dataset.winuiReady === 'true') return;
    const type = host.getAttribute('winui-prev'); const label = host.getAttribute('winui-content') || type; const isDisabled = disabled(host);
    host.classList.add('elements-control'); host.dataset.winuiReady = 'true';
    if (host.hasAttribute('winui-theme')) document.documentElement.dataset.winuiTheme = host.getAttribute('winui-theme');
    if (['Button','AccentButton','ToggleButton','HyperlinkButton'].includes(type)) {
      const style = type === 'AccentButton' ? ' winui-button--accent' : type === 'ToggleButton' ? ' winui-button--toggle' : type === 'HyperlinkButton' ? ' winui-button--link' : '';
      const pressed = type === 'ToggleButton' && host.getAttribute('winui-checked') === 'true';
      host.innerHTML = `<button type="button" class="winui-button${style}"${type === 'ToggleButton' ? ` aria-pressed="${pressed}"` : ''}${isDisabled ? ' disabled' : ''}>${esc(label)}</button>`;
      if (type === 'ToggleButton') host.querySelector('button').addEventListener('click', event => event.currentTarget.setAttribute('aria-pressed', event.currentTarget.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    if (type === 'DropDownButton') {
      host.innerHTML = `<button type="button" class="winui-button" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}>${esc(label)}${CHEVRON}</button>${menuMarkup(itemsFor(host))}`;
      const trigger = host.querySelector('.winui-button'); const menu = host.querySelector('.winui-menu');
      setupMenu(host, menu, trigger, () => {}); return;
    }
    if (type === 'SplitButton') {
      const items = itemsFor(host);
      host.innerHTML = `<div class="winui-split"><button type="button" class="winui-button winui-split-primary"${isDisabled ? ' disabled' : ''}>${esc(label)}</button><button type="button" class="winui-button winui-split-arrow" aria-label="More options" aria-haspopup="menu" aria-expanded="false"${isDisabled ? ' disabled' : ''}>${CHEVRON}</button></div>${menuMarkup(items)}`;
      const trigger = host.querySelector('.winui-split-arrow'); const menu = host.querySelector('.winui-menu');
      setupMenu(host, menu, trigger, () => {}); return;
    }
    if (type === 'ComboBox') {
      const items = itemsFor(host); const placeholder = host.getAttribute('winui-placeholder') || 'Select an item';
      host.classList.add('winui-combo');
      host.innerHTML = `<input class="winui-combo-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-haspopup="listbox" placeholder="${esc(placeholder)}"${isDisabled ? ' disabled' : ''}><span class="winui-combo-chevron">${CHEVRON}</span><div class="winui-menu" role="listbox" hidden>${items.map(item => `<button class="winui-menu-item" type="button" role="option" data-value="${esc(item)}">${esc(item)}</button>`).join('')}</div>`;
      const input = host.querySelector('input'); const menu = host.querySelector('.winui-menu');
      const close = () => { menu.hidden = true; input.setAttribute('aria-expanded','false'); };
      const open = () => { menu.hidden = false; input.setAttribute('aria-expanded','true'); filter(); };
      const filter = () => { const query = input.value.toLocaleLowerCase(); menu.querySelectorAll('.winui-menu-item').forEach(item => { item.hidden = !item.dataset.value.toLocaleLowerCase().includes(query); }); };
      input.addEventListener('focus', open); input.addEventListener('input', open);
      input.addEventListener('keydown', event => {
        const visible = [...menu.querySelectorAll('.winui-menu-item')].filter(item => !item.hidden);
        if (event.key === 'ArrowDown') { event.preventDefault(); open(); visible[0]?.focus(); }
        if (event.key === 'Escape') close();
        if (event.key === 'Enter' && document.activeElement.classList.contains('winui-menu-item')) { event.preventDefault(); document.activeElement.click(); }
      });
      menu.addEventListener('click', event => { const item = event.target.closest('.winui-menu-item'); if (!item) return; input.value = item.dataset.value; close(); input.focus(); });
      menu.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); input.focus(); } });
      document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); });
      return;
    }
    host.dataset.winuiReady = 'false'; host.classList.remove('elements-control');
  }
  function scan(root) {
    if (root.matches?.(SELECTOR)) render(root);
    root.querySelectorAll?.(SELECTOR).forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document)); else scan(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node); }))).observe(document.documentElement, { childList: true, subtree: true });
})();
