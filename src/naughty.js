// This file contains many words that some may find disturbing.

const NAUGHTY_WORDS = [
  // All words here MUST be lowercase.
  // TODO: more words
  // TODO: see if we can store these somewhere else that might be a bit less obvious
  'bitch',
  'fuck',
  'shit',
];

// Ignore anything non-alphabetical
const IGNORE = /[^a-z]/g;

/**
 * Determine whether a given string of text is probably safe for most audiences.
 * Note that this is not foolproof.
 * @param {string} text The text to scan
 * @returns {boolean} true if the text is probably safe, false if the text is definitely unsafe
 */
function isSafe(text) {
  text = text.toLowerCase().replace(IGNORE, '');

  for (const word of NAUGHTY_WORDS) {
    if (text.includes(word)) {
      return false;
    }
  }

  return true;
}

module.exports = isSafe;
