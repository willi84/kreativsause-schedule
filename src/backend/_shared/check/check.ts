
export const getType = (input: any) => {
    switch(typeof input){
        case 'object':
            if (input === null) {
                return 'null';
            } else if(input instanceof Date){
                return 'date';
            } else {
               return  (Array.isArray(input) === true) ? 'array' : 'object';
            }
        default:
            return typeof input;
    }
}