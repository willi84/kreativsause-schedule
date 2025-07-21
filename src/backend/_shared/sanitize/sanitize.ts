export const normalizeMenuData = (menu: string) => {
    const input = menu.replace(/\s+/g, ' ').trim();
    let data = input; 
    // remove .pdf, .docx, .doc from menu data
    data = data.replace(/\.pdf/ig, ' ');
    data = data.replace(/\.docx/g, ', ');
    data = data.replace(/\.doc/g, ', ');

    // remove double commas and trailing commas
    data = data.replace(/,\s,/g, ',');
    data = data.replace(/,\s*$/, '')
    // remove trailing spaces or underscores
    data = data.replace(/_\s*$/, '')
    data = data.replace(/_/g, ' ');
    // detect camelcase words and split them
    data = data.replace(/([a-z])([A-Z])/g, '$1 $2');

    // avoid such kombis Suppe,Frisches Baguette
    data = data.replace(/,([a-z])/g, ', $1');
    data = data.replace(/\s+,\s+/, ', ');
    data = data.replace(/,\s*$/, '')
    data = data.replace(/,\s+/g, ', ');

    // foo,bar => foo, bar
    data = data.replace(/([a-zA-Z0-9]),([a-zA-Z0-9])/g, '$1, $2');

    return data;
}

export const lowTrim = (str: string) => {
    if (str === null || str === undefined) {
        return '';
    }
    return str.toLowerCase().trim();
}
export const removeSpaces = (str: string) => {
    str = str
        .replace(/^\s+/ig, '')
        .replace(/\n/g, '')
        .replace(/\t/g, '')
        .replace(/\r/g, '')
        .replace(/\s+/ig, ' ')
        return str;
}

export const removeEmptyItems = (items: any) => {
    if (!Array.isArray(items)) {
        return [];
    } else if(items.length === 0) {
        return [];
    }

    return items
        .map(item => typeof item === 'string' ? item.trim() : item)
        .filter(item => item)
}