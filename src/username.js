const naughty = require('./naughty');
const fetch = require('node-fetch');
const logger = require('./logger');
const config = require('./config');

/** Maximum length of usernames, inclusive. */
const MAX_LENGTH = 20;
/** Minimum length of usernames, inclusive. */
const MIN_LENGTH = 1;
/** Regex for usernames to match. */
const VALID_REGEX = /^[a-z0-9_-]+$/i;
/** URL to fetch username metadata from. */
const API = 'https://trampoline.turbowarp.org/proxy/users/$username';
/** Regex of usernames to anonymize. */
const ANONYMIZE = /^player\d{1,9}$/i;

/**
 * Anonymize a generated username, or return it unmodified
 * @param {string} username The username
 * @returns {string} Anonymized username or original username.
 */
function parseUsername(username) {
  if (config.anonymizeGeneratedUsernames && isGenerated(username)) {
    return 'player';
  }
  return username;
}

/**
 * Determine if a username is randomly generated or not.
 * @param {string} username The username to test.
 * @returns {boolean} true if the username was probably randomly generated.
 */
function isGenerated(username) {
  return ANONYMIZE.test(username);
}

/**
 * @param {unknown} username
 * @returns {Promise<boolean>}
 */
function isValidUsername(username) {
  if (
    typeof username !== 'string' ||
    username.length < MIN_LENGTH ||
    username.length > MAX_LENGTH ||
    !VALID_REGEX.test(username) ||
    naughty(username)
  ) {
    return Promise.resolve(false);
  }
  if (isGenerated(username)) {
    return Promise.resolve(true);
  }
  return fetch(API.replace('$username', username), {
    headers: {
      referer: 'username-validation.clouddata.turbowarp.org'
    }
  })
    .then((res) => {
      if (res.ok) {
        return true;
      }
      if (res.status === 404) {
        return false;
      }
      throw new Error(`Unexpected status code: ${res.status}`);
    })
    .catch((err) => {
      logger.error(err);
      return true;
    });
};

module.exports.parseUsername = parseUsername;
module.exports.isGenerated = isGenerated;
module.exports.isValidUsername = isValidUsername;
