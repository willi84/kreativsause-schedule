// const fetch = require("node-fetch");
import { SHEET_JSON_TEMPLATE } from '../../_shared/config';
import { lowTrim, removeEmptyItems } from '../sanitize/sanitize';
import { getType } from '../check/check';
import { ERROR, LOG } from '../log/log';
// import fs = require('fs'); // use fs-extra for better file handling

export const getSheetUrl = (DOCUMENT_ID, sheetName) => {
    return SHEET_JSON_TEMPLATE.replace('{DOCUMENT_ID}', DOCUMENT_ID).replace('{sheetName}', sheetName);
}


export const getDataBySheetName = async (DOCUMENT_ID, sheetName) => {
    const url = getSheetUrl(DOCUMENT_ID, sheetName);
    const startTime = new Date().getTime();
    const response = await fetch(url);
    if (!response.ok) {
        LOG(ERROR, `getDataBySheetName: HTTP error! status: ${response.status} for sheet: ${sheetName} in time: ${new Date().getTime() - startTime}ms`);
        return {};
        // throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const jsonText = text ?  text.match(/\{.*\}/s)[0] : '{}'; // extract JSON from the response text
    const data = JSON.parse(jsonText);
    // fs.writeFileSync('mock.sheetData.json', JSON.stringify(data, null, 2));
    return data;
}

export const getGlobalData = async (logs, DOCUMENT_ID) => {
    const sheetNameGlobal = "global"; // 👈 use the actual tab name of the 2nd shee
    const globalData = await getDataBySheetName(logs, DOCUMENT_ID, sheetNameGlobal);
    const data = {};
    if(!globalData || !globalData.table || !globalData.table.rows) {
        logs.error(`getGlobalData: no data found for sheet: ${sheetNameGlobal}`);
        return data; // return empty object if no data found
    }
    const newData = await getData(logs, DOCUMENT_ID, sheetNameGlobal, true);
    // console.log(newData);
    const keys = newData.keys || Object.keys(newData.items[0] );
    for(const item of newData.items) {
        const key = item[keys[0]]; // first key is the key
        const value = item[keys[1]]; // second key is the value
        if(value !== undefined){
            data[key] = value; // add to data object
            // console.log(`getGlobalData: key ${key} has no value`);
        }
    }
    
    if(Object.keys(data).length === 0) {
        logs.error('no global data sets');
    }
    return data;
}
export const getValue = (item, isNumber = false) => {
    const type = getType(item);
    if(!item || type !== 'object' || Object.keys(item).length === 0 ) return null;
    return isNumber ? (item.v || item.f) : (item.f || item.v); // formatted value or raw value
}
export const getHorizontalKeys = (data ) => {
    if(!data || !data.table || !data.table.cols || !data.table.rows) {
        return [];
    }
    const labels = data.table.cols.map(col => col.label);
    const columnNames = removeEmptyItems(labels);
    if(columnNames.length > 0) {
        return columnNames;
    } else { // no idea why they sometimes empty
        const firstRow = data.table.rows[0];
        if(!firstRow || !firstRow.c) return [];
        const rowItems = firstRow.c.map(col => col.v);
        return removeEmptyItems(rowItems);
    }
}



export const getValueByCol = (item, opts) => {
    const doLowTrim = opts && opts.lowTrim || false;
    const type = opts && opts.type || 'string';
    const isNumber = type === 'number';
    const value = getValue(item, isNumber);
    if(value === undefined || value === null) return null;
    if(type === 'number') {
        const v = parseFloat(value);
        if(item.v && item.f && v.toString() !== item.f) {
            // return parse
            // console.log(v)
            // console.log(`v: ${v}, f: ${item.f}, value: ${value} => str: ${v.toString()}`);
            // console.log(item)
        }
        return parseFloat(value); // TODO: check if number and not float issues
    }
    return doLowTrim ? lowTrim(value) : value;
}

export const getColumnIndexes = (data) => {
    const columnNames = getHorizontalKeys(data);
    const result = {};
    for(let i = 0; i < columnNames.length; i++) {
        const colName = columnNames[i];
        result[colName] = i;
    }
    return result;
}

export const getItem = (element, cols, config) => {
    const columns = Object.keys(cols);
    const result = {};
    for(let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const conf = config[column] || {};
        const value = getValueByCol(element.c[cols[column]], conf);
        result[column] = value;
    }
    return result;
}



export const parseHorizontalData = (data) => {
    const colNames = getHorizontalKeys(data);
    // console.log('colNames');
    const result = [];
    for (const [index, row] of data.table.rows.entries()) {
        // console.log(`index: ${index}`);
        // const key = getValue(row.c[0]);
        // console.log(`key: ${key}`); 

        // if(!result[key]) {
        //     result[key] = {};
        // }
        const item = {};
        for(const i in colNames) {
            const colName = colNames[i];
            // console.log(`colName: ${colName}`);
            const valueItem = row.c[i];
            if(valueItem){
                const value = getValue(valueItem);
                // console.log(value);
                if(!item[colName]) {
                    item[colName] = value;
                }
            } else {
                item[colName] = null;
            }
        }
        result.push(item);
        //         if(resultIsArray === true) {
        //             result[key][colName].push(value);
        //         } else {
        //             result[key][colName] = value;
        //         }
        //     }
        // }
    }
    // console.log(result);
    return result;
}

export const getData = async (logs, DOCUMENT_ID, sheetName, includeFirstRow = false ) => {
    const data = await getDataBySheetName(logs, DOCUMENT_ID, sheetName);
    const colNames = await getHorizontalKeys(data);
    const items = []
    for (const [index, row] of data.table.rows.entries()) {
        const item = {};
        for(const i in colNames) {
            const colName = colNames[i];
            // console.log(`colName: ${colName}`);
            const valueItem = row.c[i];
            if(valueItem){
                const value = getValue(valueItem);
                if(!item[colName]) {
                    item[colName] = value;
                }
            } else {
                item[colName] = null;
            }
        }
        if(!(includeFirstRow === false && index === 0)){
            items.push(item);
        }
    }
    return { items: items, keys: colNames}
}
export const getDictionary = (data) => {
    const keys = data.keys;
    const items = data.items;
    const result = {};
    for(const item of items) {
        const ID = keys[0] // first key is the key
        const id = item[ID];
        if(!result[id]){
            result[id] = {};
        }
        for(const key of keys) {
            result[id][key] = item[key];
        }
    }
    return result;
}
export const getHorizontalData = async (logs, DOCUMENT_ID, sheetName, includeFirstRow = false, resultIsArray = false) => {
    const data = await getData(logs, DOCUMENT_ID, sheetName);
    if(!data) {
        logs.error(`getHorizontalData: no data found for sheet: ${sheetName}`);
        return [];
    }
    const result = getDictionary(data);
    return result;
}




// exports.getValueByCol = getValueByCol;