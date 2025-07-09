type FilterMap = { [key: string]: Set<string> };

export const createSearch = (target: string, uid: string, source: string) => {
  const searchArea = document.querySelector(`[${target}="${uid}"]`);
  const urlParams = new URLSearchParams(window.location.search);
  const activeFilters: FilterMap = { tag: new Set(), stage: new Set(), speaker: new Set() };

  const updateSearch = (term: string) => {
    const value = term.toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>('.talk-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const searchable = card.querySelectorAll<HTMLElement>('.talk-value');
      const texts = Array.from(searchable).map(el => el.textContent?.toLowerCase() || '');
      const matchesSearch = value === '' || texts.some(t => t.includes(value));

      const matchesFilters = Object.entries(activeFilters).every(([key, values]) => {
        if (values.size === 0) return true;
        return Array.from(values).some(v => card.innerHTML.toLowerCase().includes(v.toLowerCase()));
      });

      const show = matchesSearch && matchesFilters;
      card.classList.toggle('hidden', !show);

      if (show) {
        visibleCount++;
        searchable.forEach(el => el.classList.add('hidden'));
        card.querySelectorAll<HTMLElement>('.talk-search').forEach((el, i) => {
          const original = searchable[i]?.textContent || '';
          el.classList.remove('hidden');
          el.innerHTML = getHighlightedText(original, value);
        });
      } else {
        searchable.forEach(el => el.classList.remove('hidden'));
        card.querySelectorAll<HTMLElement>('.talk-search').forEach(el => {
          el.classList.add('hidden');
          el.innerHTML = '';
        });
      }
    });

    const noResult = searchArea?.querySelector<HTMLElement>('.search__no-result');
    const searchItem = noResult?.querySelector<HTMLElement>('.search__value');
    if (noResult) {
      noResult.classList.toggle('search__info--hidden', visibleCount > 0);
      if (searchItem) searchItem.textContent = value;
    }

    const url = new URL(window.location.href);
    value ? url.searchParams.set('search', value) : url.searchParams.delete('search');
    history.replaceState({}, '', url);
  };

  const input = searchArea?.querySelector<HTMLInputElement>('input');
  input?.addEventListener('keyup', e => updateSearch((e.target as HTMLInputElement).value));
  if (urlParams.has('search')) {
    const val = urlParams.get('search')!;
    if (input) {
      input.value = val;
      updateSearch(val);
    }
  }

  document.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filterType!;
      const value = btn.dataset.filterValue!;
      const set = activeFilters[type];

      if (set.has(value)) {
        set.delete(value);
        btn.classList.remove('active');
      } else {
        set.add(value);
        btn.classList.add('active');
      }

      updateSearch(input?.value || '');
    });
  });

  document.querySelectorAll<HTMLElement>('[data-toggle-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-toggle-filter')!;
      const container = document.getElementById(`filter-${type}`);
      if (!container) return;

      container.querySelectorAll<HTMLButtonElement>('.filter-btn').forEach((btn, i) => {
        if (i >= 10) btn.style.display = 'inline-block';
      });

      btn.remove();
    });
  });
};

export const getHighlightedText = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  return text.split(new RegExp(`(${searchTerm})`, 'gi')).map(part =>
    part.toLowerCase() === searchTerm.toLowerCase()
      ? `<span class="search-match">${part}</span>`
      : part
  ).join('');
};
