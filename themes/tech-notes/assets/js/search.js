(() => {
  'use strict';
  const page = document.querySelector('[data-search-page]');
  if (!page) return;
  const input = page.querySelector('[data-search-input]');
  const form = page.querySelector('form');
  const status = page.querySelector('[data-search-status]');
  const results = page.querySelector('[data-search-results]');
  let indexPromise;
  let request = 0;
  let debounce;
  const asText = value => (Array.isArray(value) ? value.join(' ') : String(value || ''));
  const normalize = value => asText(value).normalize('NFKC').toLocaleLowerCase();
  const tokens = query => [...new Set(normalize(query).split(/\s+/u).filter(Boolean))].slice(0, 20);

  function highlighted(element, text, terms) {
    // Build text nodes instead of interpolating indexed content into HTML.
    const pattern = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!pattern) { element.textContent = text; return; }
    const regex = new RegExp(pattern, 'giu');
    let end = 0;
    for (const match of text.matchAll(regex)) {
      element.append(document.createTextNode(text.slice(end, match.index)));
      const mark = document.createElement('mark');
      mark.textContent = match[0];
      element.append(mark);
      end = match.index + match[0].length;
    }
    element.append(document.createTextNode(text.slice(end)));
  }
  function excerpt(post, terms) {
    const body = asText(post.body).replace(/\s+/g, ' ');
    const summary = asText(post.summary);
    const positions = terms.map(term => normalize(body).indexOf(term)).filter(index => index >= 0);
    if (terms.some(term => normalize(summary).includes(term)) || !positions.length) return summary || body.slice(0, 220);
    const start = Math.max(0, Math.min(...positions) - 70);
    return `${start ? '… ' : ''}${body.slice(start, start + 240)}${body.length > start + 240 ? ' …' : ''}`;
  }
  function render(post, terms) {
    const card = document.createElement('article');
    card.className = 'article-card';
    const meta = document.createElement('div');
    meta.className = 'article-meta';
    const time = document.createElement('time');
    time.dateTime = post.date;
    time.textContent = post.date;
    meta.append(time);
    const series = document.createElement('span');
    series.textContent = asText(post.series);
    meta.append(series);
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = post.url;
    highlighted(link, post.title, terms);
    heading.append(link);
    const summary = document.createElement('p');
    highlighted(summary, excerpt(post, terms), terms);
    const tags = document.createElement('div');
    tags.className = 'tag-row';
    (Array.isArray(post.tags) ? post.tags : [post.tags]).filter(Boolean).forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      highlighted(pill, tag, terms);
      tags.append(pill);
    });
    card.append(meta, heading, summary, tags);
    results.append(card);
  }
  function loadIndex() {
    if (!indexPromise) indexPromise = fetch(page.dataset.searchIndex)
      .then(response => { if (!response.ok) throw new Error('Index unavailable'); return response.json(); })
      .catch(error => { indexPromise = undefined; throw error; });
    return indexPromise;
  }
  async function search({ syncURL = true } = {}) {
    const id = ++request;
    const query = input.value.trim().slice(0, 200);
    if (syncURL) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
    results.replaceChildren();
    results.removeAttribute('aria-busy');
    if (!query) { status.textContent = ''; return; }
    status.textContent = 'Searching…';
    results.setAttribute('aria-busy', 'true');
    try {
      const index = await loadIndex();
      if (id !== request) return;
      const terms = tokens(query);
      const matches = index.map(post => {
        const fields = [post.title, post.summary, post.tags, post.series, post.body].map(normalize);
        if (!terms.every(term => fields.some(field => field.includes(term)))) return { post, score: 0 };
        const weights = [60, 25, 25, 25, 5];
        return { post, score: terms.reduce((sum, term) => sum + fields.reduce((total, field, i) => total + (field.includes(term) ? weights[i] : 0), 0), 0) };
      }).filter(match => match.score > 0).sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));
      status.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”`;
      if (!matches.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No matching notes. Try a shorter term, a tag, or a series name.';
        results.append(empty);
      }
      matches.forEach(({ post }) => render(post, terms));
    } catch (_) {
      if (id === request) status.textContent = 'Could not load the search index. Check your connection and search again.';
    } finally {
      if (id === request) results.removeAttribute('aria-busy');
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); search(); });
  input.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(search, 180); });
  window.addEventListener('popstate', () => { input.value = new URLSearchParams(location.search).get('q') || ''; search({ syncURL: false }); });
  input.value = (new URLSearchParams(location.search).get('q') || '').slice(0, 200);
  search({ syncURL: false });
})();
