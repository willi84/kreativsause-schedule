const FS = require("fs");
const svgFilter = (fileName, dimension, css_extend, opts) => {
    let content = FS.readFileSync(`./src/frontend/assets/${fileName}`).toString();
    const ariaHidden = opts && opts.hasOwnProperty('ariaHidden') === true ? `aria-hidden="${opts.ariaHidden}"` : '';
    const focusable = opts && opts.hasOwnProperty('focusable') === true  ? `focusable="${opts.focusable}"` : '';
    const css = css_extend ? `class="${css_extend}"` : '';
    const size = typeof dimension === 'number' ? [dimension, dimension] : dimension;
    let dimensions = '';
    if(dimension){
      content = content.replace(/width="[^"]+"/, "");
      content = content.replace(/height="[^"]+"/, "");
      dimensions = `width="${size[0]}" height="${size[1]}"`
    } else {
    }
    content = content.replace('<svg ', `<svg ${dimensions} ${css}  ${ariaHidden} ${focusable}`);
    return content;

  };
exports.svgFilter = svgFilter;