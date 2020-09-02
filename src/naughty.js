const fs = require('fs');
const pathUtil = require('path');

/**
 * ATTENTION!
 *
 * Do not add entries to the lists here.
 * Put your filter lists inside `src/filters`, they will be loaded automatically.
 */

/**
 * A list of the names of the loaded filters.
 * @type {string[]}
 */
const LOADED_FILTERS = [];

/**
 * A list of regular expressions that cannot match a string for it to be considered safe.
 * @type {RegExp[]}
 */
const FILTERS = [];

/**
 * Load a filter.
 * @param {string} name The name of the filter.
 * @param {string} contents The contents of the filter.
 */
function loadFilter(name, contents) {
  LOADED_FILTERS.push(name);

  contents.split('\n')
    .map((i) => i.trim()) // remove whitespace around lines
    .filter((i) => i && !i.startsWith('#')) // ignore empty lines and comments
    .map((i) => new RegExp(i, 'i')) // convert to regular expression
    .forEach((filter) => FILTERS.push(filter));
}

/**
 * Return whether a file should be read as a filter list.
 * @param {string} fileName The name of the file.
 */
function isFilterList(fileName) {
  return fileName.endsWith('.filter');
}

/**
 * Load all filters from the filters directory.
 */
function loadFilters() {
  const FILTER_DIRECTORY = pathUtil.join(__dirname, 'filters');
  const filterNames = fs.readdirSync(FILTER_DIRECTORY).filter((fileName) => isFilterList(fileName));
  for (const filterName of filterNames) {
    const fullPath = pathUtil.join(FILTER_DIRECTORY, filterName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    loadFilter(filterName, fileContents);
  }
}

/**
 * Determine whether a given string of text is probably safe for most audiences.
 * Note that this is not foolproof.
 * @param {string} text The text to scan
 * @returns {boolean} true if the text is naughty.
 */
function naughty(text) {
  // Remove non alphanumerics
  text = text.replace(/[^a-z0-9]/gi, '');

  const length = FILTERS.length;
  for (var i = 0; i < length; i++) {
    if (FILTERS[i].test(text)) {
      return true;
    }
  }

  return false;
}

naughty.getTotalBlockedPhrases = () => FILTERS.length;
naughty.getTotalFilterLists = () => LOADED_FILTERS.length;

loadFilters();

module.exports = naughty;
