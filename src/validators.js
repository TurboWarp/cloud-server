/** A required prefix that must appear at the beginning of all variable's names. */
const VARIABLE_NAME_CLOUD_PREFIX = '☁ ';
/** The maximum length of a variable's name. Scratch does not seem to restrict this but we don't want overly long variable names regardless. */
const VARIABLE_NAME_MAX_LENGTH = 1024;

/** The maximum length of a variable's value. */
const VALUE_MAX_LENGTH = 100000;

/**
 * @param {unknown} id
 * @returns {boolean}
 */
module.exports.isValidRoomID = function(id) {
  return typeof id === 'string' && id.length > 0 && /^\d+$/.test(id);
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
  if (typeof value === 'number') {
    // If the value is a number, we don't have to parse it because we already know it's valid.
    // NaN and [-]Infinity are not valid, however.
    return !Number.isNaN(value) && Number.isFinite(value) && value.toString().length <= VALUE_MAX_LENGTH;
  }

  if (typeof value === 'string') {
    if (value.length > VALUE_MAX_LENGTH) {
      return false;
    }

    // catch some special cases
    if (value === '.' || value === '-') {
      return false;
    }

    var length = value.length;
    var seenDecimal = false;
    var i = 0;
    // 45 = -
    if (value.charCodeAt(0) === 45) i++;

    for (; i < length; i++) {
      var char = value.charCodeAt(i);
      // 46 = .
      if (char === 46) {
        if (seenDecimal) return false;
        seenDecimal = true;
      } else {
        // 48 = 0
        // 57 = 9
        // all the numbers are between these
        if (char < 48 || char > 57) return false;
      }
    }

    return true;
  }

  return false;
};
