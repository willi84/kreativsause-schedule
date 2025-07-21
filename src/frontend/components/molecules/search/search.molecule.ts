type FilterMap = { [key: string]: Set<string> };

export const updateGetParam = (key: string, value: string) => {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  history.replaceState({}, '', url);
}

export const setActiveButton = (buttons: NodeListOf<HTMLButtonElement>, activeButton: HTMLButtonElement) => {
  buttons.forEach(b => b.classList.remove('btn-outline-primary'));
  buttons.forEach(b => b.classList.add('btn-outline-secondary'));
  activeButton.classList.add('btn-outline-primary');
  activeButton.classList.remove('btn-outline-secondary');
}
export const createFilter = () => {
  const filterContainer = document.querySelector('.filter-type-container');
  const allFilters = [];
  const filterItems = document.querySelectorAll<HTMLElement>('[data-filter]');
  for(const item of filterItems) {
    const value = item.getAttribute('data-filter');
    if(allFilters.indexOf(value) === -1) {
      allFilters.push(value);
      const btn = document.createElement('span');
      btn.classList.add('badge', 'btn-outline-secondary', 'filter-btn', 'mx-1');
      if(value !== 'date'){
        btn.classList.add('filter-btn--active');
      }
      btn.setAttribute('data-filter-type', value);
      btn.innerText = value;
      filterContainer?.append(btn);
      if(value === 'date') {
       document.querySelectorAll('[data-filter="date"]').forEach(dateItem => {
          dateItem.classList.add('hidden');
        });
      }
    }
  }
  const allFilterButtons = filterContainer?.querySelectorAll('.filter-btn');
  const allFilterItems = document.querySelectorAll<HTMLElement>('[data-filter]');
allFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if(btn.classList.contains('filter-btn--active')) {
        btn.classList.remove('filter-btn--active');
        allFilterItems.forEach(item => {
          if(item.getAttribute('data-filter') === btn.getAttribute('data-filter-type')) {
            item.classList.add('hidden');
          } else {
            item.classList.remove('hidden');
          }
        })
      } else {
        btn.classList.add('filter-btn--active');
        allFilterItems.forEach(item => {
          if(item.getAttribute('data-filter') === btn.getAttribute('data-filter-type')) {
            item.classList.remove('hidden');
          }
        })
      }
      
    });
  });
  
}

export const createSearch = (target: string, uid: string, source: string) => {
  const body = document.body;
  const viewSwitches = document.querySelectorAll('[data-view]');
  const url = new URL(window.location.href);
  const defaultView = url.searchParams.get('view') || 'standard-view';
   updateGetParam('view', defaultView);
  body.classList.remove('standard-view', 'compact-view');
  body.classList.add(defaultView);
  const activeBtn = document.querySelector<HTMLButtonElement>(`[data-view="${defaultView}"]`);
  setActiveButton(viewSwitches, activeBtn);
  createFilter();

  viewSwitches.forEach(btn => {
    const isStandardView = body.classList.contains('standard-view');
    if (isStandardView) {
      btn.classList.add('active-view');
    }
    btn.addEventListener('click', () => {
      setActiveButton(viewSwitches, btn);
      // btn.classList.remove('active-view');
      const newView = btn.getAttribute('data-view');
      const oldView = body.classList.contains('standard-view') ? 'standard-view' : 'compact-view';
      console.log(`Switching from ${oldView} to ${newView}`);
      if(oldView !== newView) {
        body.classList.remove(oldView);
        body.classList.add(newView);
        updateGetParam('view', newView);
        
        
      }
    });
  });
  const searchAreas = document.querySelectorAll(`[${target}="${uid}"]`);
  for (const searchArea of searchAreas) {
    const urlParams = new URLSearchParams(window.location.search);
    const activeFilters: FilterMap = { tag: new Set(), stage: new Set(), speaker: new Set() };
  
    const updateSearch = (term: string) => {
      console.log(`Updating search with term: ${term}`);
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
      const tables = document.querySelectorAll<HTMLElement>('.day-table');
      tables.forEach(table => {
        const numShown = table.querySelectorAll<HTMLElement>('.talk-card:not(.hidden)').length;
        if(numShown === 0){
          table.classList.add('hidden');
          const day = table.getAttribute('data-day');
          const dayHeader = document.querySelectorAll(`.day-table-headline[data-day="${day}"]`);
          for(const header of dayHeader) {
            header.classList.add('hidden');
          }
        } else {
          table.classList.remove('hidden');
          const day = table.getAttribute('data-day');
          const dayHeader = document.querySelectorAll(`.day-table-headline[data-day="${day}"]`);
          for(const header of dayHeader) {
            header.classList.remove('hidden');
          }
        }
      });
    };
  
    const input = searchArea?.querySelector<HTMLInputElement>('input');
    input?.addEventListener('keyup', e => updateSearch((e.target as HTMLInputElement).value));
    if (urlParams.has('search')) {
      const val = urlParams.get('search')!;
      if (input) {
        console.log(val)
        input.value = val;
        updateSearch(val);
      }
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
