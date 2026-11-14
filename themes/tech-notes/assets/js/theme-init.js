(() => {
  const root = document.documentElement;
  let saved;
  try { saved = localStorage.getItem('blog-theme'); } catch (_) { /* Storage may be disabled. */ }
  const preference = root.dataset.defaultTheme;
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.bsTheme = ['light', 'dark'].includes(saved) ? saved : (['light', 'dark'].includes(preference) ? preference : system);
})();
