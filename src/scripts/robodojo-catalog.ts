const catalog = document.querySelector<HTMLElement>('[data-rb-catalog]');
if (catalog) mountCatalog(catalog);

function mountCatalog(root: HTMLElement) {
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-rb-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-rb-card]')];
  const taskLinks = new Map(
    [...root.querySelectorAll<HTMLAnchorElement>('[data-rb-task-link]')].map(link => [link.dataset.rbTaskLink, link.href]),
  );
  const category = root.querySelector<HTMLSelectElement>('[data-rb-category]')!;
  const batch = root.querySelector<HTMLSelectElement>('[data-rb-batch]')!;
  const search = root.querySelector<HTMLInputElement>('[data-rb-search]')!;
  const count = root.querySelector<HTMLElement>('[data-rb-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-rb-empty]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-rb-clear]')!;
  const statusHashes: Record<string, string> = {
    accepted: '#accepted', in_progress: '#in-progress', not_started: '#not-started', all: '#tasks',
  };
  const validStatuses = new Set(filters.map(button => button.dataset.rbFilter));
  let status = 'all';

  function render() {
    const terms = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const text = card.dataset.search?.toLocaleLowerCase() ?? '';
      card.hidden = (status !== 'all' && card.dataset.status !== status) ||
        (category.value !== '' && card.dataset.category !== category.value) ||
        (batch.value !== '' && card.dataset.batch !== batch.value) ||
        !terms.every(term => text.includes(term));
      if (!card.hidden) visible++;
    }
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.rbFilter === status));
    count.textContent = count.dataset.format!.replace('{count}', String(visible));
    empty.hidden = visible !== 0;
    clear.hidden = status === 'all' && !category.value && !batch.value && !search.value;
  }

  function filterHash() {
    if (!category.value && !batch.value && !search.value.trim()) return statusHashes[status] ?? '#tasks';
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (batch.value) params.set('batch', batch.value);
    if (category.value) params.set('category', category.value);
    if (search.value.trim()) params.set('q', search.value.trim());
    return '#' + params;
  }

  function updateFilterUrl() {
    history.replaceState(null, '', filterHash());
    render();
  }

  function selectValue(input: HTMLSelectElement, value: string | null) {
    input.value = [...input.options].some(option => option.value === value) ? value! : '';
  }

  function readHash() {
    const hash = location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const selectedTask = params.get('task');
    const taskUrl = selectedTask ? taskLinks.get(selectedTask) : undefined;
    if (taskUrl) {
      location.replace(taskUrl);
      return;
    }
    const named = Object.keys(statusHashes).find(key => statusHashes[key] === hash);
    const selected = named ?? params.get('status') ?? 'all';
    status = validStatuses.has(selected) ? selected : 'all';
    selectValue(category, params.get('category'));
    selectValue(batch, params.get('batch'));
    search.value = params.get('q') ?? '';
    render();
    if (hash && !['#top','#about','#tasks'].includes(hash)) {
      root.querySelector('#tasks')?.scrollIntoView();
    }
  }

  filters.forEach(button => button.addEventListener('click', () => {
    status = button.dataset.rbFilter ?? 'all';
    updateFilterUrl();
  }));
  for (const input of [category, batch]) input.addEventListener('change', updateFilterUrl);
  search.addEventListener('input', updateFilterUrl);
  clear.addEventListener('click', () => {
    status = 'all';
    category.value = batch.value = search.value = '';
    updateFilterUrl();
    search.focus();
  });

  // An already-selected anchor does not fire hashchange; reapply it on click.
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const next = new URL(anchor.href);
      if (next.pathname === location.pathname && next.hash === location.hash) readHash();
    });
  });
  window.addEventListener('hashchange', readHash);

  const hero = root.querySelector<HTMLVideoElement>('[data-rb-hero]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-rb-hero-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualPause = reducedMotion.matches;
  let heroVisible = false;

  function resumeHero() {
    if (hero && heroVisible && !manualPause && !document.hidden) {
      hero.play().catch(() => { /* User can play it with the toggle. */ });
    }
  }
  if (hero && toggle) {
    hero.controls = false;
    function syncHero() {
      const playing = !hero!.paused;
      toggle!.setAttribute('aria-pressed', String(playing));
      toggle!.setAttribute('aria-label', (playing ? toggle!.dataset.pause : toggle!.dataset.play)!);
      toggle!.textContent = playing ? 'Ⅱ' : '▶';
    }
    for (const event of ['play','pause','ended']) hero.addEventListener(event, syncHero);
    toggle.addEventListener('click', () => {
      manualPause = !hero.paused;
      if (manualPause) hero.pause();
      else hero.play().catch(() => {});
    });
    function showHeroError() {
      const error = root.querySelector<HTMLElement>('[data-rb-hero-error]');
      if (error) error.hidden = false;
      toggle!.disabled = true;
    }
    hero.addEventListener('error', showHeroError);
    hero.querySelector('source')?.addEventListener('error', showHeroError);
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) resumeHero();
      else hero.pause();
    }, { threshold: 0.18 }).observe(hero);
    reducedMotion.addEventListener('change', () => {
      manualPause = reducedMotion.matches;
      if (manualPause) hero.pause();
      else resumeHero();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) hero.pause();
      else resumeHero();
    });
  }
  readHash();
}
