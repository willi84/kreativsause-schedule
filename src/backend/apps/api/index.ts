import { command } from "../../_shared/cmd/cmd";
import { fileExists, readFile, writeFileSync } from "../../_shared/fs/fs";
import { getHttpStatusItem } from "../../_shared/http/http";
import { DEBUG, ERROR, LOG, OK, WARNING } from "../../_shared/log/log";
import { DAYS, IDS, SHOW_DEV, ROOM_NAMES, PROGRAM_URL } from "./index.config";
import { WORKSHOP_ITEM, WORKSHOP_BASE, ROOM_MAPPING, WORKSHOP_DATA, WORKSHOP_ITEMS, WORKSHOP_ITEM_ELEMENT } from './index.d';
import { getTitleCosts, getWorkshopDetails } from './workshop/workshop';
import { detectItem, detectRoom, getRoomData, getRoomData2 } from './room/room';
import { sortArrayByTime } from '../../_shared/sanitize/sanitize';
import { normalizeData } from './misc/misc';
const HTMLParser = require('node-html-parser');
const MAX = 1005;


const IS_DEV = SHOW_DEV;
console.log(`Running in ${IS_DEV ? 'development' : 'production'} mode`);

const PAGE = PROGRAM_URL
const scheduleUrl = [`${PAGE}`]






const getPageData = (url: string) => {
    let i = 0;
    const httpStatus = getHttpStatusItem(url, false, 10);
    const cmd = `curl -s ${url}`;
    const html = command(`curl -s ${url}`);
    // writeFileSync('tmp.html', html);
    var root = HTMLParser.parse(html);

    const workshopData: WORKSHOP_ITEM_ELEMENT = {}
    const articles = root.querySelectorAll('article');
    for (const article of articles) {
        if( i > MAX){
            // LOG(WARNING, `Skipping article ${i} on page ${url}`);
            continue;
        }
        const id = article.getAttribute('data-id');
        const titleElement = article.querySelector('h2');
        let title = titleElement ? titleElement.text.trim() : 'No Title';
        // get cost from []
        
        const detailItem = getTitleCosts(title);
        title = detailItem.title;
        const costs = detailItem.costs;
        const warnings: string[] = detailItem.warnings;
        if(costs && costs !== '') {
            title = title.replace(/\[(.*?)\]/, '').trim();  
        }
       
        const slug = article.querySelector('a').getAttribute('href');
        const details: WORKSHOP_ITEM = getWorkshopDetails(slug, {id, title});
        if(details.year === '2025') {
            i += 1;
        }
        // merge warnings
        for(const key in details) {
            if (key === 'warnings'){
                for(const warning of details.warnings) {
                    warnings.push(warning);
                }
            }
        }
        workshopData[id] = {
            kosten: costs,
            slug: slug,
            ...details,
            warnings: warnings,
        }

    }
    LOG(OK, `Found ${articles.length} articles on page ${url}`);
    // writeFileSync('tmp.json', JSON.stringify(json, null, 4));
    
    return workshopData;
}


const getWebsiteData = (url: string, properties: string[]) => {
    const mainData = getPageData(url);
    
    
    return mainData;
}
const processData = (data: any, workshopData: any) => {
    const finalData: WORKSHOP_DATA = {
        data: {},
        days: [...DAYS],
    };
    const debugData = {
        titles: [],
        workshopData: []
    }
    const keys1 = Object.keys(workshopData);
    for(const key1 of keys1) {
        const item2 = workshopData[key1];
        const normalizedItem = normalizeData(item2.title);
        debugData.workshopData.push({ normalized: normalizedItem, item: item2 });
    }
    const roomsNames: ROOM_MAPPING = {...ROOM_NAMES }
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
            const detectedItem = detectItem(item.title, workshopData);
            if(detectedItem) {
                item['room'] = detectedItem.room || 'unknown';
                item['speakers'] = [ detectedItem.speakers || 'unknown'];
                item['time'] = detectedItem.time || 'unknown';
                if(!item['title']){
                    item['title'] = detectedItem.title || 'No Title';
                }
            }
            // const detectedRoom = detectRoom(item.title, rooms);
            // if(detectedRoom) {
            //     LOG(OK, `Detected room ${detectedRoom} for workshop: ${item.title}`);
            //     item.room = {
            //         name: detectedRoom,
            //         orig: roomsNames[detectedRoom],
            //     }
            // } else {
            //     LOG(WARNING, `No room found for workshop: ${item.title}`);  
            //     item.room = {
            //         name: 'unknown',
            //         orig: 'unknown',
            //     }
            // }
            finalData.data[day].push(item);
        }
        
    }
    writeFileSync('src/_data/debug.json', JSON.stringify(debugData, null, 4));
    // sort by time
    for (const day in finalData.data) {
        finalData.data[day] = sortArrayByTime(finalData.data[day], 'startTime');
        
    }
    return finalData;
}
        


// async iife


const main = (workshopData: any) => {
    LOG(WARNING, `No cached data found in src/_data/orig.json`);
            const origData = getWebsiteData(scheduleUrl[0], ['schedule', 'tags']);
            const finalData = processData(origData, workshopData);
                const cwd = process.cwd();
                writeFileSync(`${cwd}/src/_data/optimized.json`, JSON.stringify(finalData, null, 4));
                writeFileSync(`${cwd}/src/_data/orig.json`, JSON.stringify(finalData, null, 4));
}

(async () => {
    // const rooms = await getRoomData();
    // writeFileSync('src/_data/rooms.json', JSON.stringify(rooms, null, 4));
    const workshopData = await getRoomData2();
    writeFileSync('src/_data/rooms2.json', JSON.stringify(workshopData, null, 4));

    const hasFile = fileExists('src/_data/orig.json')
    if(hasFile) {
        const cached = readFile('src/_data/orig.json');
        const json = cached ? JSON.parse(cached) : {};
        const hasItems = Object.keys(json).length > 0;
        if(hasItems && IS_DEV){
            LOG(OK, `Using cached data from src/_data/orig.json`);
        } else {
            main(workshopData);
        }
    }  else {
        main(workshopData)
    }
})();
