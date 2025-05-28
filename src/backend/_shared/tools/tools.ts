export const replaceAll = (input: string, search: string, replacement: string): string => {
    return input.split(search).join(replacement);
}

export const detectTypeFromString = (rawValue: string) => {
    const value = rawValue.toLowerCase().trim()
    const booleans = ['true', 'false'];
    let isBoolean = false;
    booleans.forEach((bool: string) => {
        if(bool === value.toLowerCase().trim()){
            isBoolean = true;
        }
    });
    try {
        // check if value just consists of those
        const numberValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ','];
        let testValue = value;
        numberValues.forEach(num => {
            testValue = replaceAll(testValue, num, '');
        });
        const isNumber = testValue.trim() === '';
        if(isNumber){
            return 'number';
        }
    } catch(e: any) {
    }
    if(isBoolean){
        return 'boolean';
    } else {
        return 'string'
    }
    // TODO: Array, urls, number, object
}
export const detectType = (value: any) => {
    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && !isArray;
    if(isObject){
        return 'object';
    } else if(isArray){
        return 'array'
    } else {
        return typeof value;
    }
}

export const deepMerge = <T>(target: T, source: T): T => {
    if (target === null || typeof target !== 'object' || source === null || typeof source !== 'object') {
            return source;
        }
    
        const merged: any = { ...target };
    
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && typeof target[key] === 'object') {
                    merged[key] = deepMerge(target[key], source[key]);
                } else {
                    merged[key] = source[key];
                }
            }
        }
    
        return merged as T;
    }