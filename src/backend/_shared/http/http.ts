/**
 * @license MIT // TODO: not MIT
 * @author Robert Willemelis
 * @module itemsHelper/backend/http
 * @version 1.0.0
 */

import { HTTPStatusBase, HTTP_STATUS } from "../../index.d";
import { command } from "../cmd/cmd";
import { ERROR, LOG, OK } from "../log/log";
import { CURL_CONFIG_STATUS, DEFAULT_TIMEOUT } from "./http.config";


export const splitLine = (line: string) => {
    const matchesColon = line.match(/^([^\s]+)\:\s(.*)/); // KEY: value
    const matchesSpace = line.match(/^([^\s]+)\s(.*)/); // KEY value
    let key = '';
    let value = '';
    if(matchesColon && matchesColon[2]){
        key = matchesColon[1];
        value = matchesColon[2];
    } else if(matchesSpace && matchesSpace[2]){
        key = matchesSpace[1];
        value = matchesSpace[2];
    }
    
    return {
        key: key,
        value: value,
    }
}
export const transformKey = (key: string) => {
    let newKey = key.toLowerCase().trim();
    if(newKey.indexOf('-') !== -1){
        const parts = newKey.split('-');
        let finalKey = '';
        parts.forEach((part:string, index: number) => {
            if(index === 0){
                finalKey = part;
            } else {
                finalKey += part.charAt(0).toUpperCase() + part.slice(1);
            }
        });
        newKey = finalKey;
    }
    return newKey;
}
export const getHttpItem = (input: string): HTTPStatusBase => {
    const httpItem: any = {};
    const lines = input.split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
        const item = splitLine(line);
        const key = transformKey(item.key);

        httpItem[`${key}`] = item.value;
        // detect httpStatus
        if(key.indexOf('http/') === 0){
            const version = key.split('/')[1];
            httpItem.protocol = 'http';
            httpItem.protocolVersion = version;
            httpItem.status = item.value.split(' ')[0];
            httpItem.statusMessage = item.value.replace(httpItem.status, '').trim();
        }
    });
    if(httpItem.status === undefined){
        httpItem.status = '0';
    }
    return httpItem;

}

const getHTTPStatus = (url: string, timeout?: number): HTTPStatusBase => {
    // const timeoutConfig = timeout? CURL_CONFIG_STATUS.replace(/(\d*\.\d*)/, timeout.toString()) : CURL_CONFIG_STATUS;
    // console.log(timeoutConfig)
    const ua = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36';
    const cmd = `curl -I ${url}  -H "${ua}" ${CURL_CONFIG_STATUS.replace(DEFAULT_TIMEOUT, `-m ${timeout || 10}`)}`;
    // console.log(cmd)
    const status = command(`${cmd}`);
    const httpItem = getHttpItem(status);
    return httpItem;
}

export const getHttpStatus = (url: string, forwarding = false, timeout?: number) => {
    const httpItem = getHttpStatusItem(url, forwarding, timeout);
    if(httpItem['maxRedirectsReached']){
        LOG(ERROR, `max redirects reached for ${url}`);
    }
    return httpItem['status'];
}
export const getHttpStatusItem = (url: string, forwarding = false, timeout?: number): HTTPStatusBase => {
    const initialUrl = url;
    const maxRedirects = 5;
    let redirects = 0;
    if(forwarding){
        while(forwarding){
            redirects += 1;
            const httpItem = getHTTPStatus(url, timeout);
            if(redirects > maxRedirects){
                httpItem['maxRedirectsReached'] = 'true';
                httpItem['lastStatus'] = httpItem['status'];
                httpItem['status'] = '0';
                httpItem['redirects'] = `${redirects}`;
                httpItem['lastLocation'] = url;
                httpItem['initialUrl'] = initialUrl;
                LOG(ERROR, `max redirects reached for ${url}`);
                return httpItem;
            } else {
                // TODO: check valid url
                const location = httpItem['location'];
                if(location){
                    url = location;
                } else {
                    forwarding = false;
                    // const status = parseInt(httpItem['status'], 10);
                    // if(status >= 200 && status < 400){
                    //     LOG(OK, `🌎 [HTTP-CHECK]: ${status} for ${initialUrl}`);
                    // } else {
                    //     LOG(ERROR, `🌎 [HTTP-CHECK]: ${status} for ${initialUrl}`);
                    // }
                    httpItem['initialUrl'] = initialUrl; // TODO: testing
                    httpItem['lastLocation'] = url; // TODO: testing
                    httpItem['redirects'] = `${redirects}`;
                    return httpItem;
                }
            }
        }
    
    } else {
        const httpItem = getHTTPStatus(url, timeout);
        httpItem['lastLocation'] = url;
        return httpItem;
    }
    return {} as HTTPStatusBase;
}

export const getConnectionTime = (url: string): string => {
    // return just time
    const start = new Date();
    const status = command(`curl -Z -w "%{time_total}" -o /dev/null -s -I ${url}`);
    // const status = command(`curl -o /dev/null -s -w '%{time_total}\\n' ${url}`);
    // const status = command(`curl -o /dev/null -s -w 'time_connect: %{time_connect}\\ntime_starttransfer: %{time_starttransfer}\\ntime_total: %{time_total}\\n' ${url}`);
    // const status = command(`curl -o /dev/null -s -w 'time_connect: %{time_connect}\\ntime_starttransfer: %{time_starttransfer}\\ntime_total: %{time_total}\\n' ${url}`);
    // const lines = status.split('\n');
    // const connectionTime = lines.map(line => {
    //     const item = splitLine(line);
    //     return item;
    // });
    // return `${status} (${new Date().getTime() - start.getTime()}ms)`;
    return status;
    // return parseFloat(status);
}