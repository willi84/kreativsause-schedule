import { write } from 'fs';
import { command } from "../../_shared/cmd/cmd";
import { fileExists, readFile, writeFileSync } from "../../_shared/fs/fs";
import { getHttpStatusItem } from "../../_shared/http/http";
import { DEBUG, LOG, OK, WARNING } from "../../_shared/log/log";
import { IDS } from "./inde.config";
const HTMLParser = require('node-html-parser');


const IS_DEV = process.env.NODE_ENV === 'development';
console.log(`Running in ${IS_DEV ? 'development' : 'production'} mode`);

const PAGE = 'https://flaeminger.kreativsause.de/programm-2025/'
const scheduleUrl = [`${PAGE}`]


const removeHtmlTags = (htmlString: string) => {
    if (!htmlString) {
        return '';
    }
    return htmlString.replace(/<[^>]*>/g, '');
}
const linkChecker = (linkHref: string) => {
                
    let statusItem: { isValid: boolean, status: string, redirects?: string[], lastLocation?: string, initialUrl?: string }; 
    const httpStatus = getHttpStatusItem(linkHref, false, 10);
    const num = parseInt(httpStatus.status, 10);
    if(num !== 200){
        const httpStatusRedirects = getHttpStatusItem(linkHref, true, 10);
        const newStatus  = httpStatusRedirects.status;
        const numNewStatus = parseInt(newStatus, 10);
        if(numNewStatus !== 200){
            console.log(httpStatusRedirects)
            console.log(httpStatusRedirects.lastLocation);
            console.log(httpStatusRedirects.initialUrl);
            console.log('----')
            statusItem = { isValid: false, status: newStatus === '0' ? 'unknown' : newStatus, redirects: httpStatusRedirects.redirects, lastLocation: httpStatusRedirects.lastLocation, initialUrl: httpStatusRedirects.initialUrl };
            LOG(WARNING, `Link ${linkHref} returned status ${numNewStatus} for ${httpStatusRedirects.lastLocation}`);
            
        } else {
            statusItem = { isValid: true,  status: newStatus, redirects: httpStatusRedirects.redirects, lastLocation: httpStatusRedirects.lastLocation, initialUrl: httpStatusRedirects.initialUrl };
            LOG(OK, `Link ${linkHref} returned status ${numNewStatus} for ${httpStatusRedirects.lastLocation}`);
        }
        // const newUrl  httpStatusRedirects.lastLocat
        // const numStatusRedirects = parseInt(httpStatusRedirects.status, 10);
        // if(numStatusRedirects !== 200){
        //     console.log(httpStatus);
        //     LOG(WARNING, `Link ${linkHref} returned status ${httpStatus.code}`);
        //     data.warnings.push(`Link ${linkHref} returned status ${httpStatus.code}`);
        // } else {
        //     LOG(OK, `Link ${linkHref} returned status ${httpStatus.code}`);
        // }
    } else {
        statusItem = { isValid: true, status: httpStatus.status, redirects: '0', lastLocation: httpStatus.lastLocation, initialUrl: httpStatus.initialUrl };
        LOG(OK, `Link ${linkHref} returned status ${httpStatus.status}`);
    }
    return statusItem;
}


const getPageData = (url: string) => {
    const httpStatus = getHttpStatusItem(url, false, 10);
    const cmd = `curl -s ${url}`;
    console.log(url);
    const html = command(`curl -s ${url}`);
    // writeFileSync('tmp.html', html);
    var root = HTMLParser.parse(html);

    const workshopData = {}
    const articles = root.querySelectorAll('article');
    for (const article of articles) {
        const id = article.getAttribute('data-id');
        const titleElement = article.querySelector('h2');
        let title = titleElement ? titleElement.text.trim() : 'No Title';
        // get cost from []
        const costInfo = title.match(/\[(.*?)\]/);
        let costs = '';
        const warnings = [];
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
        const slug = article.querySelector('a').getAttribute('href');
        const details = getWorkshopDetails(slug);
        // filter warnings from details
        const finalDetails = {};
        for(const key in details) {
            if(key === 'speakers'){
                console.log(details[key])
            }
            if (key !== 'warnings'){
                finalDetails[key] = details[key]; 
            } else {
                for(const warning of details.warnings) {
                    warnings.push(warning);
                }
            }
        }
        workshopData[id] = {
            id,
            title,
            kosten: costs,
            // description,
            // date,
            // time,
            // speakers: [],
            // tags: [],
            slug: slug,
            ...finalDetails,
            warnings: warnings,
            // stage: article.querySelector('.stage') ? article.querySelector('.stage').text.trim() : '',
        }
        if(workshopData[id].year === '2025') {
            // links

            // for(const link of details.links) {
            //     const linkHref = link.href;
            //     const linkText = link.text;
            //     if(linkHref && linkHref !== '') {
            //         const statusItem = linkChecker(linkHref);
            //         if(!statusItem.isValid) {
            //             workshopData[id].warnings.push(`Link ${linkHref} returned status ${statusItem.status}`);
            //             LOG(WARNING, `Link ${linkHref} returned status ${statusItem.status}`);
            //         } else {
            //             workshopData[id].links = workshopData[id].links || [];
            //             workshopData[id].links.push({
            //                 text: linkText,
            //                 href: linkHref,
            //                 status: statusItem.status,
            //                 redirects: statusItem.redirects,
            //                 lastLocation: statusItem.lastLocation,
            //                 initialUrl: statusItem.initialUrl,
            //             });
            //         }
            //     } else {
            //         LOG(WARNING, `No href found for link: ${linkText}`);
            //     }
            // }
        }

    }
    LOG(OK, `Found ${articles.length} articles on page ${url}`);
    // writeFileSync('tmp.json', JSON.stringify(json, null, 4));
    
    return workshopData;
}
export type WORKSHOP_ITEM = {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    slug?: string;
    category?: string[];
    tags?: string[];
    register?: string;
    organizer?: string;
    venue?: string;
}
const getWorkshopDetails = (url: string) => {
    const data = {
        sections: [],
        warnings: [],
        speakers: [],
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
                            data.category = categoryParts.map(cat => cat.trim());
                            data.days = [];
                            for (const cat of data.category) {
                                if (cat.toLowerCase().indexOf('veranstaltungstag') !== -1) {
                                    const year = cat.match(/\d{4}/);
                                    if (year && year.length > 0) {
                                        data.year = year[0];
                                    }
                                } else {
                                    const day = cat.replace(/\d+/, '').toLowerCase().trim();
                                    const days = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
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
                            data.tags = tagsParts.map(tag => tag.trim());
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
    .filter(el => el.innerText.trim().length > 0 )
                                        .filter(el => !el.classList.contains('iee_event_meta'))
                                        .filter(el => !el.getAttribute('id')?.startsWith('iee-eventbrite-checkout-widget'));
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
                    const n = m[1].match(/und/)
                    if(n && n.length > 0) {
                        const names = m[1].split('und').map(name => name.trim());
                        for(const name of names) {
                            if(name && name !== '') {
                                data.speakers.push(name.replace(/[\.|!]*$/, '').trim());
                            }
                        }
                    } else {
                        if(m[1] && m[1] !== '') {
                            data.speakers.push(m[1].replace(/[\.|!]*$/, '').trim());
                        }
                    }
                    // console.log(data.speakers);
                }
            }

            if (text && text !== '' && !stop) {
                data.description.push(text);
            }
        }
    }
    if(data.speakers.length === 0) {
        LOG(WARNING, `no speakers found for ${url}`);
    } else {
console.log(data);
    }

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
  
    
    return data;
}
const getWebsiteData = (url: string, properties: string[]) => {
    const mainData = getPageData(url);
    
    
    return mainData;
}
const processData = (data: any) => {
    const finalData = {
        data: {},
        days: ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'],
    };
    // sort by day and time
    for (const key in data) {
        const item = data[key];
        const day = item.days[0];
        if(!finalData.data[day]) {
            finalData.data[day] = [];
        }
        // bring to unix value the format Juli 21 2025 1:30 pm
        const startTimeInt = item.startTime ? new Date(`${item.startDate} ${item.year} ${item.startTime}`).getTime() : 0;
        const endTimeInt = item.endTime ? new Date(`${item.endDate} ${item.year} ${item.endTime}`).getTime() : 0;
        item['startTimeInt'] = startTimeInt;
        item['endTimeInt'] = endTimeInt;
        if(item.year === '2025') {
            finalData.data[day].push(item);
        }
        
    }
    // sort by time
    for (const day in finalData.data) {
        finalData.data[day].sort((a: any, b: any) => {
            const aTime = a.startTime ? a.startTime.split(':').map(Number) : [0, 0];
            const bTime = b.startTime ? b.startTime.split(':').map(Number) : [0, 0];
            return aTime[0] - bTime[0] || aTime[1] - bTime[1];
        });
    }
    return finalData;
}
        

const hasFile = fileExists('src/_data/orig.json')
if(!hasFile) {
    const cached = readFile('src/_data/orig.json');
    const json = cached ? JSON.parse(cached) : {};
    const hasItems = Object.keys(json).length > 0;
    if(hasItems && IS_DEV){
        LOG(OK, `Using cached data from src/_data/orig.json`);
    } else {
        LOG(WARNING, `No cached data found in src/_data/orig.json`);
        const origData = getWebsiteData(scheduleUrl[0], ['schedule', 'tags']);
        const finalData = processData(origData);
            const cwd = process.cwd();
            writeFileSync(`${cwd}/src/_data/optimized.json`, JSON.stringify(finalData, null, 4));
            writeFileSync(`${cwd}/src/_data/orig.json`, JSON.stringify(finalData, null, 4));
    }
} 