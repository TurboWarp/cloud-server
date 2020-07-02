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
 * A list of phrases that cannot be used.
 * @type {string[]}
 */
const BLOCKED_PHRASES = [];

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
    .map((i) => simplify(i)) // case insensitive, remove non-alphabetical
    .forEach((word) => BLOCKED_PHRASES.push(word));
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
 * Simplify some text for consistent filtering.
 * @param {string} text The text to simplify.
 */
function simplify(text) {
  return text.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Determine whether a given string of text is probably safe for most audiences.
 * Note that this is not foolproof.
 * @param {string} text The text to scan
 * @returns {boolean} true if the text is naughty.
 */
function naughty(text) {
  text = simplify(text);

  const length = BLOCKED_PHRASES.length;
  for (var i = 0; i < length; i++) {
    if (text.indexOf(BLOCKED_PHRASES[i]) !== -1) {
      return true;
    }
  }

  return false;
}

naughty.getTotalBlockedPhrases = () => BLOCKED_PHRASES.length;
naughty.getTotalFilterLists = () => LOADED_FILTERS.length;

loadFilters();

module.exports = naughty;
