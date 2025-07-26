// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_framework/css/index.css';
import { createSearch } from './components/molecules/search/search.molecule';

console.log('Frontend main.ts loaded');
createSearch('data-search', 'talks', '[data-talk]');


function updateLiveTalks() {
  const now = Date.now() ; // Unix timestamp in Sekunden
  document.querySelectorAll('.talk-card').forEach(card => {
      const start = parseInt(card.getAttribute('data-start-time'), 10);
      const end = parseInt(card.getAttribute('data-end-time'), 10);
      
      if (!isNaN(start) && !isNaN(end)) {
        card.classList.add('debug')
        // console.log(`${now} vs ${start} - ${end}`);
        if(now > start && now > end){

            card.setAttribute('data-talk-status', 'done');
        } else if(now >= start && now <= end) {
        console.log(`Talk ${card.getAttribute('data-talk')} is live!`);
        card.setAttribute('data-talk-status', 'live');
    } else {
        card.setAttribute('data-talk-status', 'upcoming');
      }
    }
  });
}

// Initial check
updateLiveTalks();

// Wiederhole alle 60 Sekunden
setInterval(updateLiveTalks, 60000);
