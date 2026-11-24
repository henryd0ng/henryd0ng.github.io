import { copyText } from './robodojo-copy';

const catalog = document.querySelector<HTMLElement>('[data-rb-catalog]');
if (catalog) mountCatalog(catalog);

function mountCatalog(root: HTMLElement) {
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-rb-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-rb-card]')];
  const templates = new Map(
    [...root.querySelectorAll<HTMLTemplateElement>('[data-rb-template]')].map(template => [template.dataset.rbTemplate, template]),
  );
  const category = root.querySelector<HTMLSelectElement>('[data-rb-category]')!;
  const batch = root.querySelector<HTMLSelectElement>('[data-rb-batch]')!;
  const search = root.querySelector<HTMLInputElement>('[data-rb-search]')!;
  const count = root.querySelector<HTMLElement>('[data-rb-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-rb-empty]')!;
  const clear = root.querySelector<HTMLButtonElement>('[data-rb-clear]')!;
  const dialog = root.querySelector<HTMLDialogElement>('[data-rb-dialog]')!;
  const detail = dialog.querySelector<HTMLElement>('[data-rb-detail]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-rb-close]')!;
  const statusHashes: Record<string, string> = {
    accepted: '#accepted', in_progress: '#in-progress', not_started: '#not-started', all: '#tasks',
  };
  const validStatuses = new Set(filters.map(button => button.dataset.rbFilter));
  let status = 'all';
  let taskId: string | null = null;
  let opener: HTMLButtonElement | null = null;
  let returnHash = '#tasks';
  let leaveUrlInPlace = false;

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
    if (selectedTask && templates.has(selectedTask)) {
      if (taskId !== selectedTask || !dialog.open) {
        returnHash = filterHash();
        showTask(selectedTask, false);
      }
      return;
    }
    if (dialog.open) {
      leaveUrlInPlace = true;
      dialog.close();
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

  function playClip(button: HTMLButtonElement) {
    const video = detail.querySelector<HTMLVideoElement>('[data-rb-clip-video]');
    const error = detail.querySelector<HTMLElement>('[data-rb-clip-error]');
    const source = detail.querySelector<HTMLAnchorElement>('[data-rb-source]');
    if (!video || !button.dataset.rbClip) return;
    video.pause();
    if (error) error.hidden = true;
    if (source) source.href = button.dataset.rbClip;
    const note = detail.querySelector('[data-rb-clip-note]');
    if (note) note.textContent = [button.dataset.kind, button.dataset.notice].filter(Boolean).join(' · ');
    video.poster = button.dataset.poster ?? '';
    video.src = button.dataset.rbClip;
    video.load();
    for (const clip of detail.querySelectorAll('[data-rb-clip]')) {
      clip.setAttribute('aria-pressed', String(clip === button));
    }
    video.play().catch(() => { /* The native controls are available if autoplay is blocked. */ });
  }

  function showTask(id: string, updateUrl: boolean) {
    const template = templates.get(id);
    if (!template) return;
    hero?.pause();
    detail.querySelector<HTMLVideoElement>('video')?.pause();
    taskId = id;
    detail.replaceChildren(template.content.cloneNode(true));
    if (updateUrl) history.pushState({ rbTask: id }, '', '#task=' + encodeURIComponent(id));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
    const video = detail.querySelector<HTMLVideoElement>('[data-rb-clip-video]');
    video?.addEventListener('error', () => {
      const error = detail.querySelector<HTMLElement>('[data-rb-clip-error]');
      if (error) error.hidden = false;
    });
    const first = detail.querySelector<HTMLButtonElement>('[data-rb-clip]');
    if (first) playClip(first);
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

  root.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('[data-rb-open]');
    if (!button?.dataset.rbOpen) return;
    opener = button;
    returnHash = filterHash();
    showTask(button.dataset.rbOpen, true);
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    detail.querySelector<HTMLVideoElement>('video')?.pause();
    detail.replaceChildren();
    taskId = null;
    if (!leaveUrlInPlace) {
      if (history.state?.rbTask) history.back();
      else history.replaceState(null, '', returnHash);
    }
    leaveUrlInPlace = false;
    opener?.focus({ preventScroll: true });
    opener = null;
    resumeHero();
  });
  detail.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    const clip = event.target.closest<HTMLButtonElement>('[data-rb-clip]');
    if (clip) playClip(clip);
    const copy = event.target.closest<HTMLButtonElement>('[data-rb-copy-link]');
    if (copy) {
      const direct = new URL(location.href);
      direct.hash = 'task=' + encodeURIComponent(taskId ?? '');
      const ok = await copyText(direct.href);
      const message = ok ? copy.dataset.copied : copy.dataset.copyError;
      copy.textContent = message ?? '';
      const live = detail.querySelector('[data-rb-copy-status]');
      if (live) live.textContent = message ?? '';
    }
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
    if (hero && heroVisible && !manualPause && !dialog.open && !document.hidden) {
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
