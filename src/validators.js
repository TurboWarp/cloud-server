const naughty = require('./naughty');

/** A required prefix that must appear at the beginning of all variable's names. */
const VARIABLE_NAME_CLOUD_PREFIX = '☁ ';
/** The maximum length of a variable's name. Scratch does not seem to restrict this but we don't want overly long variable names regardless. */
const VARIABLE_NAME_MAX_LENGTH = 512;

/** The maximum length of a variable's value. */
const VALUE_MAX_LENGTH = 2048;

/** Maximum length of usernames, inclusive. */
const USERNAME_MAX_LENGTH = 20;
/** Minimum length of usernames, inclusive. */
const USERNAME_MIN_LENGTH = 3;
/** Regex for usernames to match. Letters, numbers, -, and _ */
const USERNAME_REGEX = /^[a-z0-9_-]+$/i;

/**
 * @param {unknown} username
 * @returns {boolean}
 */
module.exports.isValidUsername = function(username) {
  return typeof username === 'string' && username.length >= USERNAME_MIN_LENGTH && username.length <= USERNAME_MAX_LENGTH && USERNAME_REGEX.test(username) && !naughty(username);
};

/**
 * @param {unknown} id
 * @returns {boolean}
 */
module.exports.isValidRoomID = function(id) {
  return typeof id === 'string' && id.length > 0 && /^\d+$/.test(id);
};

/**
 * Determine whether an object is a valid map-like for variables.
 * The variable name and values are not validated.
 * The presence of at least one entry is validated.
 * @param {unknown} object
 * @returns {boolean}
 */
module.exports.isValidVariableMap = function(object) {
  // TODO: the Object.prototype.toString is there to ensure that this is an object.
  // It may be better to use !Array.isArray because all we really care about is not allowing arrays.
  return typeof object === 'object' && !!object && Object.prototype.toString.call(object) === '[object Object]' && Object.keys(object).length >= 1;
};

/**
 * @param {unknown} name
 * @returns {boolean}
 */
module.exports.isValidVariableName = function(name) {
  return typeof name === 'string' && name.startsWith(VARIABLE_NAME_CLOUD_PREFIX) && name.length > VARIABLE_NAME_CLOUD_PREFIX.length && name.length < VARIABLE_NAME_MAX_LENGTH;
};

/**
 * @param {unknown} value
 * @returns {boolean}
 */
module.exports.isValidVariableValue = function(value) {
  if (!(typeof value === 'string' && value.length < VALUE_MAX_LENGTH)) {
    return false;
  }

  var length = value.length;
  // catch some special cases
  if (value === '.' || value === '-') {
    return false;
  }

  var seenDecimal = false;
  var exponent = false;
  var i = 0;
  // 45 = -
  if (value.charCodeAt(0) === 45) i++;

  for (; i < length; i++) {
    var char = value.charCodeAt(i);
    // 46 = .
    if (char === 46) {
      // only a single decimal is allowed, and never allowed within an exponent
      if (seenDecimal || exponent) return false;
      seenDecimal = true;
    } else if (char === 101) { // 101 = e
      // only one exponent is allowed
      if (exponent) return false;
      exponent = true;
      i++;
      char = value.charCodeAt(i);
      // e is expected to be followed by + (43) or - (45)
      if (char !== 43 && char !== 45) {
        return false;
      }
    } else {
      // 48 = 0
      // 57 = 9
      // all the numbers are between these
      if (char < 48 || char > 57) return false;
    }
  }

  return true;
};
