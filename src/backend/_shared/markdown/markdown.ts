import { URL_KEYS } from "../../config";
import { replaceAll } from "../tools/tools";

export const getUrl = (value: string) => {

    let newValue = value;
    newValue =  replaceAll(newValue, '"', '');
    newValue =  replaceAll(newValue, "'", '');
    newValue =  newValue.replace(/,$/, '');
    newValue = newValue.trim();
    return newValue.trim();
}
export const getValue = (line: string): string => {
    const items = line.split(':');
    const key = items[0];
    const regex = new RegExp("^" + key + ':');
    const value = line.replace(regex, '');
    return value.trim();
}

const readMetadata = (content: string) => {
    const regex = /---(.*?)---/s;
    const match = regex.exec(content);
    const result: Array<any> = [];
    if(match){
        const lines = match[1].trim().split('\n');
        lines.forEach((line: string) => {
            const item = line.split(':');
            const key = item[0].trim();
            let value = getValue(line);
            const isUrl = URL_KEYS.indexOf(key) !== -1;
            if(isUrl){
                value = getUrl(value);
            }
            result.push({key: key, value: value}); 
        });
    }
    return result;
}

export const readMDFile = (content: string) => {
    return readMetadata(content);
}