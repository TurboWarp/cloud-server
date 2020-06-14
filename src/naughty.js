const NAUGHTY_WORDS = require('./badwords.json').words;

// Ignore anything non-alphabetical
const IGNORE = /[^a-z]/g;

/**
 * @param {string} text
 */
function simplify(text) {
  return text.toLowerCase().replace(IGNORE, '');
}

/**
 * Determine whether a given string of text is probably safe for most audiences.
 * Note that this is not foolproof.
 * @param {string} text The text to scan
 * @returns {boolean} true if the text is probably safe, false if the text is probably unsafe
 */
function isSafe(text) {
  text = simplify(text);

  const length = NAUGHTY_WORDS.length;
  for (var i = 0; i < length; i++) {
    if (text.indexOf(NAUGHTY_WORDS[i]) !== -1) {
      return false;
    }
  }

  return true;
}

module.exports = isSafe;
