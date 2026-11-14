(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const system = matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = false;
  try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('blog-theme')); } catch (_) {}
  function updateThemeControl() {
    toggle?.setAttribute('aria-label', `Switch to ${root.dataset.bsTheme === 'dark' ? 'light' : 'dark'} theme`);
  }
  if (toggle) {
    toggle.hidden = false;
    updateThemeControl();
    toggle.addEventListener('click', () => {
      root.dataset.bsTheme = root.dataset.bsTheme === 'dark' ? 'light' : 'dark';
      explicitTheme = true;
      try { localStorage.setItem('blog-theme', root.dataset.bsTheme); } catch (_) {}
      updateThemeControl();
    });
  }
  system.addEventListener('change', event => {
    if (!explicitTheme && !['light', 'dark'].includes(root.dataset.defaultTheme)) {
      root.dataset.bsTheme = event.matches ? 'dark' : 'light';
      updateThemeControl();
    }
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const topButton = document.querySelector('[data-back-to-top]');
  if (topButton) {
    const update = () => { topButton.hidden = window.scrollY < 420; };
    update();
    window.addEventListener('scroll', update, { passive: true });
    topButton.addEventListener('click', () => {
      document.getElementById('main')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return; } catch (_) { /* Try the local fallback. */ }
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(area);
    const active = document.activeElement;
    try {
      area.select();
      if (!document.execCommand('copy')) throw new Error('Copy unavailable');
    } finally {
      area.remove();
      active?.focus({ preventScroll: true });
    }
  }
  document.querySelectorAll('[data-copy-code]').forEach(button => {
    button.hidden = false;
    const label = button.querySelector('[data-copy-label]');
    label.setAttribute('aria-live', 'polite');
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block').querySelector('pre code');
      if (!code) return;
      const clone = code.cloneNode(true);
      clone.querySelectorAll('.ln, .lnt').forEach(line => line.remove());
      button.disabled = true;
      try {
        await copyText(clone.textContent);
        label.textContent = 'Copied!';
      } catch (_) {
        label.textContent = 'Select to copy';
      }
      setTimeout(() => { label.textContent = 'Copy'; button.disabled = false; }, 1800);
    });
  });

  // Collapse the contents on small screens while leaving it available without JS.
  const tocPanel = document.querySelector('.toc-panel');
  const compact = matchMedia('(max-width: 991px)');
  if (tocPanel) {
    tocPanel.open = !compact.matches;
    compact.addEventListener('change', event => { tocPanel.open = !event.matches; });
  }
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const headings = tocLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  if (headings.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!active) return;
      tocLinks.forEach(link => {
        if (decodeURIComponent(link.hash.slice(1)) === active.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
    headings.forEach(heading => observer.observe(heading));
  }
  document.querySelectorAll('.mobile-nav nav a').forEach(link => {
    link.addEventListener('click', () => { link.closest('details').open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.mobile-nav[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); });
  });
})();
