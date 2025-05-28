export const createSearch = (target: string, uid: string, source: string) => {

    const searchArea = document.querySelector(`[${target}="${uid}"]`);
    if(searchArea){
        const input: HTMLInputElement | null = searchArea?.querySelector('input')
        input?.addEventListener('keyup', (e) => {
            const skills = document.querySelectorAll(source);
            const target = e.target as HTMLInputElement;
            if(target.value === '') {
                // reset search
                for(const skill of skills) {
                    skill.classList.remove('hidden');
                    const valueItem = skill.querySelector('.talk-value');
                    const placeholder = skill.querySelector('.talk-search');
                    valueItem?.classList.remove('hidden');
                    placeholder?.classList.add('hidden')
                }
            } else {
                let i = 0
                for(const skill of skills) {
                    const valueItem = skill.querySelector('.talk-value') as HTMLElement;
                    const placeholder = skill.querySelector('.talk-search') as HTMLElement;
                    const skillValue: string = valueItem?.innerText;
                    if(skill.textContent?.toLowerCase().includes(target.value.toLowerCase())) {
                        skill.classList.remove('hidden');
                        valueItem?.classList.add('hidden')
                        skill.querySelector('.talk-search')?.classList.remove('hidden')
                        if(placeholder){
                            const html = getHighlightedText(skillValue, target.value)
                            placeholder.innerHTML = `${html}`
                        }
                        i += 1;
                    } else {
                        valueItem?.classList.remove('hidden')
                        placeholder?.classList.add('hidden');
                        skill.classList.add('hidden');
                        // placeholder.innerHTML = '';
                    }
                }
                const noResultItem: HTMLElement | null = searchArea?.querySelector('.search__no-result');
                if(noResultItem){
                    console.log('noresult')
                    const searchItem: HTMLElement | null = noResultItem.querySelector('.search__value');
                    if(i === 0){
                        if(searchItem !== null){
                            searchItem.innerText = `${target.value}`;
                        }
                        noResultItem?.classList.remove('search__info--hidden');
                    } else {
                        noResultItem?.classList.add('search__info--hidden')
                    }
                }
            }
        });
    }
}

export const getHighlightedText = (text: string, searchTerm: string) => {
    if(searchTerm === '') return text;
    // Split the text by the highlight term
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? `<span class="search-match">${part}</span>` : part
    ).join('');
}
