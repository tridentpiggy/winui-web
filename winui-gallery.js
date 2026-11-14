/* Gallery behavior fixes: locator animation, active-page navigation, enabled previews. */
(() => {
  'use strict';
  const ready = callback => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', callback, { once:true }) : callback();
  ready(() => {
    // Demo controls should only be disabled when explicitly requested by their markup.
    document.querySelectorAll('[winui-prev]').forEach(host => {
      const explicitlyDisabled = host.getAttribute('winui-disabled') === 'true' || host.hasAttribute('disabled');
      if (!explicitlyDisabled) host.querySelectorAll('button:disabled,input:disabled,select:disabled,textarea:disabled').forEach(control => control.disabled = false);
    });

    const sidebar = document.querySelector('.winui-sidebar');
    if (sidebar) {
      let indicator = sidebar.querySelector('.winui-sidebar-indicator');
      if (!indicator) { indicator = document.createElement('span'); indicator.className = 'winui-sidebar-indicator'; indicator.setAttribute('aria-hidden','true'); sidebar.prepend(indicator); }
      const positionIndicator = () => {
        const active = sidebar.querySelector('.winui-sidebar-item[aria-current="page"]');
        if (!active) { indicator.dataset.visible = 'false'; return; }
        const side = sidebar.getBoundingClientRect(), item = active.getBoundingClientRect();
        indicator.style.transform = `translateY(${item.top - side.top + (item.height - 16) / 2}px)`;
        indicator.dataset.visible = 'true';
      };
      window.addEventListener('resize', positionIndicator, { passive:true });
      sidebar.addEventListener('transitionend', positionIndicator);
      new MutationObserver(positionIndicator).observe(sidebar, { attributes:true, subtree:true, attributeFilter:['aria-current','data-collapsed'] });
      requestAnimationFrame(positionIndicator);

      // Replace the renderer's toggle listener so each click performs exactly one state change.
      document.querySelectorAll('.winui-sidebar-toggle').forEach(original => {
        const toggle = original.cloneNode(true);
        original.replaceWith(toggle);
        const selector = toggle.getAttribute('winui-target');
        const target = () => selector ? document.querySelector(selector) : sidebar;
        toggle._winuiTarget = sidebar;
        toggle.setAttribute('aria-controls', sidebar.id || '');
        toggle.setAttribute('aria-expanded', String(sidebar.dataset.collapsed !== 'true'));
        toggle.addEventListener('click', () => {
          const controlled = target();
          if (!controlled) return;
          const collapsed = controlled.dataset.collapsed !== 'true';
          controlled.dataset.collapsed = String(collapsed);
          controlled.setAttribute('aria-expanded', String(!collapsed));
          toggle.setAttribute('aria-expanded', String(!collapsed));
          positionIndicator();
        });
      });
    }

    const links = [...document.querySelectorAll('[data-page-link]')];
    const pages = [...document.querySelectorAll('[data-page]')];
    const title = document.getElementById('current-title');
    const labels = Object.fromEntries(links.map(link => [link.dataset.pageLink, link.querySelector('.nav-text')?.textContent.trim() || link.textContent.trim()]));
    function navigate(id, updateHash = true) {
      if (!pages.some(page => page.dataset.page === id)) id = pages[0]?.dataset.page;
      pages.forEach(page => { page.hidden = page.dataset.page !== id; });
      links.forEach(link => {
        if (link.dataset.pageLink === id) link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      });
      if (title) title.textContent = labels[id] || id;
      if (updateHash && id) history.replaceState(null,'',`#${id}`);
      document.querySelector('.gallery-main')?.scrollTo({ top:0, behavior:'smooth' });
      requestAnimationFrame(() => sidebar && (sidebar.querySelector('.winui-sidebar-indicator').style.transform = `translateY(${sidebar.querySelector('[aria-current="page"]')?.offsetTop || 0}px)`));
    }
    links.forEach(link => link.addEventListener('click', () => navigate(link.dataset.pageLink)));
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1), false));
    if (pages.length) navigate(location.hash.slice(1) || pages[0].dataset.page, false);

    // Style range track fill dynamically, independent of how the control was authored.
    const updateRange = input => {
      const min = Number(input.min || 0), max = Number(input.max || 100), value = Number(input.value || min);
      input.style.setProperty('--slider-progress', `${max === min ? 0 : (value - min) / (max - min) * 100}%`);
    };
    document.querySelectorAll('.winui-slider-input').forEach(input => {
      updateRange(input);
      input.addEventListener('input', () => updateRange(input));
      input.addEventListener('change', () => updateRange(input));
    });
  });
})();
