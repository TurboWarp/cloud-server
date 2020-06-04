const isSafe = require('./naughty');

/** A required prefix that must appear at the beginning of all variable's names. */
const VARIABLE_NAME_CLOUD_PREFIX = '☁ ';
/** The maximum length of a variable's name. */
const VARIABLE_NAME_MAX_LENGTH = 100;

/** The maximum length of a variable's value. */
const VALUE_MAX_LENGTH = 1024;
/** Regex for values to match. */
const VALUE_REGEX = /^[0-9]+$/;

/** Maximum length of usernames. */
const USERNAME_MAX_LENGTH = 30;
/** Regex for usernames to match. */
const USERNAME_REGEX = /^[a-z0-9_-]+$/i;

/**
 * @param {unknown} username
 * @returns {boolean}
 */
module.exports.isValidUsername = function(username) {
  return typeof username === 'string' && username.length > 0 && username.length < USERNAME_MAX_LENGTH && USERNAME_REGEX.test(username) && isSafe(username);
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
  return !!object && typeof object === 'object';
};

/**
 * @param {unknown} name
 * @returns {boolean}
 */
module.exports.isValidVariableName = function(name) {
  return typeof name === 'string' && name.startsWith(VARIABLE_NAME_CLOUD_PREFIX) && name.length < VARIABLE_NAME_MAX_LENGTH && isSafe(name);
};

/**
 * @param {unknown} value
 * @returns {boolean}
 */
module.exports.isValidVariableValue = function(value) {
  return typeof value === 'string' && value.length < VALUE_MAX_LENGTH && VALUE_REGEX.test(value);
};
