import { forbiddenWords } from '../../../config';

export const normalizeData = (input: string) => {
    let output = input;
    output = output.replace(/\(Treffpunkt[^\)]*\)/ig, '');
    output = output.replace(/\d+\s*TN/ig, '');
    output = output.replace(/\s+/g, '').trim().toLowerCase();
    output = output.replace(/\\n/g, '');
    output = output.replace(/\n/g, '');
    output = output.replace(/\\t/g, '');
    output = output.replace(/\t/g, '');
    output = output.replace(/\\r/g, '');
    output = output.replace(/\r/g, '');
    output = output.replace(/[\.|,|\?|\!|\)|\()|\&|:|\-|–|\/]/g, '');
    output = output.replace('---', '');
    
    const words = output.split(' ');
    for(const word of words) {
        if(forbiddenWords.indexOf(word) !== -1){
            output = output.replace(word, '');
        } 
    }

    return output.replace(/\s+/g, ' ').trim();
}