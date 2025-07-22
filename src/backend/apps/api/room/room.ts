import { RAW_ROOMS, ROOM_MAP } from './../index.d';
import { getDataBySheetName, getHorizontalKeys, parseHorizontalData } from '../../../_shared/google_sheet/google_sheet';
import { DEBUG, ERROR, LOG, OK } from '../../../_shared/log/log';
import { LOCATIONS, ROOM_DETECTION, ROOM_NAMES, SHEET_ID, SPEAKERS } from '../index.config';
import { normalizeData } from '../misc/misc';
import { writeFile, writeFileSync } from 'fs';

export const getRoomData = async () => {
    const sheetData = await getDataBySheetName(SHEET_ID, 'data')
    const keys = getHorizontalKeys(sheetData);
    const items: RAW_ROOMS = parseHorizontalData(sheetData);
    const rooms: ROOM_MAP = {}
    for(const key of keys){
        if(!rooms[key]) {
            rooms[key] = [];
        }
    }
    for(const item of items) {
        for(const key of keys) {
            if(!(item[key] === undefined || item[key] === null) && item[key] !== key) {
                const title = item[key];
                const parts = title.split(/---/);
                for(const part of parts) {

                    rooms[key].push({ orig: part, normalized: normalizeData(part) });
                    // rooms[key].push({ orig: item[key], normalized: normalizeData(item[key]) });
                }
            }
        }
    }
    return rooms;
}
const stripText = (text: string) => {
    return text.replace(/[\n\r]/g, '').trim();
}
export const getRoomData2 = async () => {
    const sheetData = await getDataBySheetName(SHEET_ID, 'schedule')
    const keys = getHorizontalKeys(sheetData);
    const items: RAW_ROOMS = parseHorizontalData(sheetData);
    writeFileSync('src/_data/raw-rooms.json', JSON.stringify(items, null, 4));
    const result = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let ignoreNext = false;
    for(const item of items) {
        const workshopItem: any = {}
        const keys = Object.keys(item);
        for(const key of keys) {
            const KEY = key.toLowerCase().trim();
            if(item[key]){
                const value = item[key];
                if(KEY.startsWith('workshop')){
                    workshopItem['title'] = stripText(value);
                } else if(value.match(/\d{2}\s*:\s*\d{2}/)) {
                    workshopItem['time'] = stripText(value);
                } else {
                    let found = false;
                    const lowerValue = value.toLowerCase();
                    for(const speaker of SPEAKERS){
                        if(lowerValue.indexOf(speaker) !== -1) {
                            workshopItem['speakers'] = stripText(value).replace(/\s\d+\s*$/g, '').replace(/\s[^\@|\s]+\@[^\s]+/g, '').trim()
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        for(const room of LOCATIONS){
                            if(lowerValue.indexOf(room) !== -1) {
                                workshopItem['room'] = stripText(value);
                                found = true;
                                break;
                            }
                        }
                    } else {
                    }
                }
            }
        }
        if(workshopItem.title.toLowerCase().trim() === ('extra tasks')) {
            ignoreNext = true;
        }
        if(!ignoreNext){
            if(!result[workshopItem.title]){
                result[workshopItem.title] = workshopItem;
            } else {
                LOG(ERROR, `Duplicate workshop title found: ${workshopItem.title}`);
            }
        }
        if(workshopItem.title.toLowerCase().trim() === ('workshop')) {
            ignoreNext = false;
        }
        // console.log(item);
    }
    writeFileSync('src/_data/rooms2_optimized.json', JSON.stringify(result, null, 4));
    return result;
}
export const detectItem = (workshop: string, workshopData: any) => {
    const normalizedWorkshop = normalizeData(workshop);
    const keys = Object.keys(workshopData);
    for(const key of keys) {
        const item = workshopData[key];
        const normalizedItem = normalizeData(item.title);
        if (normalizedWorkshop.indexOf(normalizedItem) !== -1) {
            // LOG(OK, `Detected item for workshop: ${normalizedWorkshop} => ${key} [${item.room} | ${item.time} | ${item.speaker}]`);
            return workshopData[key];
        }
    }
    LOG(DEBUG, `No item found for workshop: ${normalizedWorkshop}`);
    return null;
}
export const detectRoom = (workshop: string, rooms: any[]) => {
    const normalizedWorkshop = normalizeData(workshop);
    const keys = Object.keys(rooms);
    const result = []
    for(const key of keys) {
        for (const room of rooms[key]) {
            const normalizedRoom = normalizeData(room.normalized);
            if (normalizedWorkshop.indexOf(normalizedRoom) !== -1) {
                result.push({key: key, room: room, workshop: workshop, normalizedWorkshop: normalizedWorkshop, normalizedRoom: normalizedRoom});
            }
        }
    }
    if(result.length === 1){ return result[0].key; }
    if(result.length > 1) {
        for(const item of result) {
            if(item.normalizedRoom === item.normalizedWorkshop) {
                return item.key;
            }
        }
        LOG(ERROR, `Multiple rooms found for workshop: ${normalizedWorkshop}`);
    }
    LOG(DEBUG, `No room found for workshop: ${normalizedWorkshop}`);
    return null;
}