const naughty = require('./naughty');
const fetch = require('node-fetch');
const logger = require('./logger');
const config = require('./config');
const https = require('https');

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

const MIN_ACCOUNT_AGE = 1000 * 60 * 60 * 24;

const USER_AGENT = 'https://github.com/TurboWarp/cloud-server';

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
  return ANONYMIZE.test(username) || username === 'player';
}

const agent = new https.Agent({
  keepAlive: true
});

/**
 * @param {unknown} username
 * @returns {username is string} True if the username is valid. The username can be assumed to be a string
 * if it is valid.
 */
function isValidUsername(username) {
  return (
    typeof username === 'string' &&
    username.length >= MIN_LENGTH &&
    username.length <= MAX_LENGTH &&
    VALID_REGEX.test(username) &&
    !naughty(username)
  );
}

/**
 * @param {string} username
 * @returns {Promise<boolean>}
 */
function isValidScratchAccount(username) {
  if (isGenerated(username)) {
    return Promise.resolve(true);
  }

  const start = Date.now();
  return fetch(API.replace('$username', username), {
    timeout: 1000 * 10,
    headers: {
      'user-agent': USER_AGENT
    },
    agent
  })
    .then((res) => {
      if (res.ok) {
        return res.json()
          .then((data) => {
            const joined = new Date(data.history.joined);
            const age = Date.now() - joined.valueOf();
            return age >= MIN_ACCOUNT_AGE;
          });
      }
      if (res.status === 404 || res.status === 400) {
        return false;
      }
      throw new Error(`Unexpected status code: ${res.status}`);
    })
    .catch((err) => {
      logger.error(err);
      return true;
    })
    .then((valid) => {
      const end = Date.now();
      const time = end - start;
      logger.info(`${username} is ${valid ? 'valid' : 'invalid'} (${Math.round(time)}ms)`);
      return valid;
    });
};

module.exports.parseUsername = parseUsername;
module.exports.isGenerated = isGenerated;
module.exports.isValidUsername = isValidUsername;
module.exports.isValidScratchAccount = isValidScratchAccount;
