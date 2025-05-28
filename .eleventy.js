const markdownIt = require("markdown-it");
const config = require("./project.config.js");

const { svgFilter } = require('./src/setup/filters/svg.filter.js');
const { routeFilter } = require('./src/setup/filters/route.filter.js');
const { prettyDateFilter } = require("./src/setup/filters/prettyDate.filter.js");
const { mergeFilter } = require("./src/setup/filters/merge.filter.js");
const { dateTimeFilter } = require("./src/setup/filters/dateTime.filter.js");
const { viteScriptTag, viteLegacyScriptTag, viteLinkStylesheetTags } = require("./src/setup/shortcodes/vite.shortcode.js");

const TEMPLATE_ENGINE = config.TEMPLATE_ENGINE;

// This will change both Eleventy's pathPrefix, and the one output by the
// vite-related shortcodes below. Double-check if you change this, as this is only a demo :)
const PATH_PREFIX = config.PATH_PREFIX;

module.exports = function (eleventyConfig) {
  // eleventyConfig.addPassthroughCopy({ static: '.' });

  // eleventyConfig.addWatchTarget('./items');
  eleventyConfig.addWatchTarget('./src/frontend/');

  // static asset pathes
  config.STATIC_ASSETS.forEach(ASSET => {
    eleventyConfig.addPassthroughCopy(ASSET);
  });
  
  // Disable whitespace-as-code-indicator, which breaks a lot of markup
  const configuredMdLibrary = markdownIt({ html: true }).disable("code");
  eleventyConfig.setLibrary("md", configuredMdLibrary);


  // get project variables as global config
  eleventyConfig.addNunjucksGlobal('config', config);

  // nunjucks filters
  eleventyConfig.addNunjucksFilter('route', routeFilter);
  eleventyConfig.addNunjucksFilter('prettyDate', prettyDateFilter);
  eleventyConfig.addNunjucksFilter("merge", mergeFilter);
  eleventyConfig.addNunjucksFilter("svg", svgFilter);
  eleventyConfig.addNunjucksFilter("dateTime", dateTimeFilter);

  // Read Vite's manifest.json, and add script tags for the entry files
  // You could decide to do more things here, such as adding preload/prefetch tags
  // for dynamic segments
  // NOTE: There is some hard-coding going on here, with regard to the assetDir
  // and location of manifest.json
  // you could probably read vite.config.js and get that information directly
  // @see https://vitejs.dev/guide/backend-integration.html
  eleventyConfig.addNunjucksAsyncShortcode("viteScriptTag", viteScriptTag);
  eleventyConfig.addNunjucksAsyncShortcode("viteLegacyScriptTag", viteLegacyScriptTag );
  eleventyConfig.addNunjucksAsyncShortcode("viteLinkStylesheetTags", viteLinkStylesheetTags );

 

  return {
    templateFormats: ["md", TEMPLATE_ENGINE, "html"],
    pathPrefix: PATH_PREFIX,
    markdownTemplateEngine: TEMPLATE_ENGINE,
    htmlTemplateEngine: TEMPLATE_ENGINE,
    dataTemplateEngine: TEMPLATE_ENGINE,
    passthroughFileCopy: true,
    dir: {
      input: config.INPUT_CONTENT,
      output: config.OUTPUT_DIR,
      // NOTE: These two paths are relative to dir.input
      // @see https://github.com/11ty/eleventy/issues/232
      layouts: config.LAYOUTS,
      includes: config.INCLUDES,
      data: config.DATA_DIR,
    },
  };
};
