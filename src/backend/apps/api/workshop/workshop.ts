import { command } from '../../../_shared/cmd/cmd';
import { DEBUG, LOG, WARNING } from '../../../_shared/log/log';
import { removeHtmlTags } from '../../../_shared/sanitize/sanitize';
import { DAYS, IDS } from '../index.config';
import { WORKSHOP_BASE, WORKSHOP_ITEM } from './../index.d';
const HTMLParser = require('node-html-parser');

export const remainingTickets = () => {
    // const remaininTickets = root.querySelector('[data-testid="remaining-tickets-grey"]');
    // if (remaininTickets) {
    //     const remainingText = removeHtmlTags(remaininTickets.innerHTML).trim();
    //     if (remainingText) {
    //         const num = remainingText.match(/\d+/);
    //         if (num && num.length > 0) {
    //             data.remainingTickets = parseInt(num[0], 10);
    //         } else {
    //             console.log(`No number found in remaining tickets text: ${remainingText}`);
    //         }
    //     }
    // }
}

export const getWorkshopDetails = (url: string, base: WORKSHOP_BASE) => {
    const data: WORKSHOP_ITEM = {
        sections: [],
        warnings: [],
        speakers: [],
        category: [],
        id: base.id,
        title: base.title,
    }
    const html = command(`curl -s ${url}`);
    var root = HTMLParser.parse(html);
    // wait till rendered
    const detailsElement = root.querySelector('.iee_organizermain .details');
    LOG(DEBUG, url)

    const sections  = detailsElement ? detailsElement.querySelectorAll('strong') : [];
    for (const section of sections) {
        const sectionTitle = section.text.replace(/:/g, '').toLowerCase().trim();
        let found = false;
        for(const key in IDS) {
            if (IDS[key].includes(sectionTitle)) {
                found = true;
                data.sections.push(sectionTitle);
                if(found){
                    const valueElement = section.querySelector(' + p, + a');
                    if(!valueElement || !valueElement.text) {
                        LOG(WARNING, `No value found for section: ${sectionTitle}`);
                        data.warnings.push(`No value found for section: ${sectionTitle}`);
                        continue;
                    }
                    const value = valueElement.text.trim();
                    switch (key) {
                        case 'date':
                            // data.date = section.nextSibling ? section.nextSibling.text.trim() : '';
                            data.startDate = value; // Assuming start date is the same as date
                            data.endDate = value; // Assuming end date is the same as date
                            break;
                        case 'time':
                            const partsTime = value ? value.split('-') : [];
                            data.startTime = partsTime[0] ? partsTime[0].trim() : '';
                            data.endTime = partsTime[1] ? partsTime[1].trim() : '';
                            // data.time = value ? value.text.trim() : '';
                            break;
                        case 'start':
                            const startParts = value ? value.trim().split('-') : [];
                            data.startDate = startParts[0] ? startParts[0].trim() : '';
                            data.startTime = startParts[1] ? startParts[1].trim() : '';
                            break;
                        case 'end':
                            const endParts = value ? value.trim().split('-') : [];
                            data.endDate = endParts[0] ? endParts[0].trim() : '';
                            data.endTime = endParts[1] ? endParts[1].trim() : '';
                            break;
                        case 'category':
                            const categoryParts = value ? value.split(',') : [];
                            data.category = [...categoryParts.map((cat: string) => cat.trim())];
                            data.days = [];
                            for (const cat of data?.category) {
                                if (cat.toLowerCase().indexOf('veranstaltungstag') !== -1) {
                                    const year = cat.match(/\d{4}/);
                                    if (year && year.length > 0) {
                                        data.year = year[0];
                                    }
                                } else {
                                    const day = cat.replace(/\d+/, '').toLowerCase().trim();
                                    const days = [...DAYS];
                                    if (day) {
                                        if( days.indexOf(day) === -1) {
                                            LOG(WARNING, `Unexpected day format: ${day}`);
                                        } else {
                                            data.days.push(day);
                                        }
                                    }

                                }
                            }
                            if (data.days.length === 0) {
                                LOG(WARNING, `No day found in category: ${value}`);
                                data.warnings.push(`No day found in category: ${value}`);
                            }
                            break;
                        case 'tags':
                            const tagsParts = value ? value.split(',') : [];
                            data.tags = tagsParts.map((tag: string) => tag.trim());
                            break;
                        case 'register':
                            data.register = value ? value.trim() : '';
                            break;
                        case 'organizer':
                            data.organizer = value ? value.trim() : '';
                            break;
                    }
                }
            }
        }
        if (!found) {
            data.warnings.push(`Section not found: ${sectionTitle}`);
            LOG(WARNING, `Section not found: ${sectionTitle}`);
        }
    }
    const images = root.querySelectorAll('img');
    data.images = [];
    for (const image of images) {
        const src = image.getAttribute('src');
        if (src) {
            data.images.push(src);
        }
    }

    const venue = root.querySelector('.iee_organizermain .venue');
    if (venue) {
        const venueText = removeHtmlTags(venue.innerHTML).trim();
        if (venueText) {
            const venueParts = venueText.split(/\n/);
            data.venue = venueParts.map(part => part.replace(/\\t/g, '').trim())
                .filter(part => part.length > 0)
                .filter(part => part.toLowerCase() !== 'venue');
        }
    }
    data.description = [];
    data.links = [];
    const descriptionElements = root.querySelectorAll('.entry-content > div')
                .filter((el: HTMLElement) => el.innerText.trim().length > 0 )
                .filter((el: HTMLElement) => !el.classList.contains('iee_event_meta'))
                .filter((el: HTMLElement) => !el.getAttribute('id')?.startsWith('iee-eventbrite-checkout-widget'));
    for (const descElement of descriptionElements) {
        const paragraphs = descElement.querySelectorAll('p');
        let stop = false;
        for (const paragraph of paragraphs) {
            const text = removeHtmlTags(paragraph.innerHTML).trim();
            const sign = 'Bitte reserviere Dir nur dann einen Platz'
            if(text.toLowerCase().startsWith(sign.toLowerCase())) {
                stop = true;
                break;
            }
            const hasLinks = paragraph.querySelectorAll('a');
            for (const hasLink of hasLinks) {
                const linkHref = hasLink.getAttribute('href');
                const linkText = removeHtmlTags(hasLink.innerHTML).trim();
                data.links.push({
                    text: linkText,
                    href: linkHref,
                });
                
            }
            const phrases = ['veranstaltet von', 'angeleitet von', 'gestaltet von', 'geleitet von'];
            for(const phrase of phrases) {
                const regexNames = new RegExp(`${phrase.replace(/\s/g, '\\s')}\\s(.*)$`, 'i');
                // const regexNames = /(gestaltet|angeleitet)\svon\s(.*)$/;
                if(text.match(regexNames)){
                    const m = text.match(regexNames);
                    if(m && m.length > 1) {
                        const n = m[1].match(/und/)
                        if(n && n.length > 0) {
                            const names = m[1].split('und').map(name => name.trim());
                            for(const name of names) {
                                if(name && name !== '') {
                                    // data.speakers.push(name.replace(/[\.|!]*$/, '').trim());
                                }
                            }
                        } else {
                            if(m[1] && m[1] !== '') {
                                // data.speakers.push(m[1].replace(/[\.|!]*$/, '').trim());
                            }
                        }
                    }
                }
            }

            if (text && text !== '' && !stop) {
                data.description.push(text);
            }
        }
    }
    // if(data.speakers.length === 0) {
    //     LOG(WARNING, `no speakers found for ${url}`);
    // } else {
    // }

    // remainingTickets();
  
    
    return data;
}

export const getTitleCosts = (title: string) => {
    const warnings: string[] = [];
    const costInfo = title.match(/\[(.*?)\]/);
    let costs = '';
    if (costInfo && costInfo.length > 1) {
        const costText = costInfo[1].trim();
        const isFree = ['kostenlos', 'free', 'gratis'].includes(costText.toLowerCase());
        if (isFree) {
            costs = 'free';
        } else {
            costs = costText;
        }
        title = title.replace(costInfo[0], '').trim();
    } else {
        // LOG(WARNING, `No cost found for workshop: ${title}`);
        const costs2 = title.match(/\((.*?)\)/);
        if (costs2 && costs2.length > 1) {
            const costText = costs2[1].trim();
            const isFree = ['kostenlos', 'free', 'gratis'].includes(costText.toLowerCase());
            if (isFree) {
                costs = 'free';
                if(costText !== 'FREE'){
                    warnings.push(`invalid format for free costs`);
                }
            } else {
                costs = costText;
            }
            warnings.push(`Found cost in parentheses`);
            title = title.replace(costs2[0], '').trim();
        } else {
            warnings.push(`No cost found for workshop: ${title}`);
            // LOG(WARNING, `No cost found for workshop: ${title}`);
        }
    }
    return {
        title: title,
        costs: costs,
        warnings: warnings,
    }
}
