const isSafe = require('./naughty');

/** A required prefix that must appear at the beginning of all variable's names. */
const VARIABLE_NAME_CLOUD_PREFIX = '☁ ';
/** The maximum length of a variable's name. Scratch does not seem to restrict this but it may be a good idea regardless. */
const VARIABLE_NAME_MAX_LENGTH = 100;

/** The maximum length of a variable's value. */
const VALUE_MAX_LENGTH = 1024;

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
  return typeof username === 'string' && username.length >= USERNAME_MIN_LENGTH && username.length <= USERNAME_MAX_LENGTH && USERNAME_REGEX.test(username) && isSafe(username);
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
 * @param {unknown} object
 * @returns {boolean}
 */
module.exports.isValidVariableMap = function(object) {
  return !!object && typeof object === 'object' && Object.prototype.toString.call(object) === '[object Object]';
};

/**
 * @param {unknown} name
 * @returns {boolean}
 */
module.exports.isValidVariableName = function(name) {
  return typeof name === 'string' && name.startsWith(VARIABLE_NAME_CLOUD_PREFIX) && name.length > VARIABLE_NAME_CLOUD_PREFIX.length && name.length < VARIABLE_NAME_MAX_LENGTH && isSafe(name);
};

/**
 * @param {unknown} value
 * @returns {boolean}
 */
module.exports.isValidVariableValue = function(value) {
  if (!(typeof value === 'string' && value.length < VALUE_MAX_LENGTH && !Number.isNaN(+value))) {
    return false;
  }

  var seenDecimal = false;
  var length = value.length; // caching value.length can slightly help performance
  if (length === 0) {
    return true;
  }

  // skip negative sign, if any
  var i = 0;
  if (value.charAt(0) === '-') i++;

  for (; i < length; i++) {
    var char = value.charAt(i);

    // Only allow one decimal
    if (char === '.') {
      if (seenDecimal) {
        return false;
      }
      seenDecimal = true;
    } else {
      if (!(char === '0' || char === '1' || char === '2' || char === '3' || char === '4' || char === '5' || char === '6' || char === '7' || char === '8' || char === '9')) {
        return false;
      }
    }
  }
  return true;
};
