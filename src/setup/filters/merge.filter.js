const mergeFilter = (object, opts) => {
    const newObject = {...object};
    const keys = Object.keys(opts);
    if(keys.length > 0){
      keys.forEach(key => {
        newObject[key] = opts[key];
      });
    }
    // console.log(newObject)
    return newObject;
}
exports.mergeFilter = mergeFilter;