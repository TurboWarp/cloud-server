const config = require('./config');
const ipAnonymize = require('ip-anonymize')

/**
 * Extract the value of the x-forwarded-for header.
 * @param {import('http').IncomingHttpHeaders} headers The request headers.
 * @returns {?string} The value of x-forwarded-for.
 */
function getForwardedFor(headers) {
  const header = /** @type {string} */ (headers['x-forwarded-for']);
  if (!header || typeof header !== 'string') {
    return null;
  }
  // extract the first IP
  const remoteAddress = header.split(/\s*,\s*/)[0];
  return remoteAddress || null;
}

/**
 * Anonymize an address by removing some of the bits.
 * @param {string} address The address to anonymize.
 * @returns {?string} Anonymized address.
 */
function anonymizeAddress(address) {
  return ipAnonymize(address, 16, 48);
}

/**
 * Get the remote IP address of a request.
 * Follows config values set in config.js.
 * @param {?import('http').IncomingMessage} req The incoming HTTP(S) request.
 * @returns {string} Human readable IP address.
 */
function getAddress(req) {
  if (req === null) {
    return '(req missing)';
  }

  let address = req.socket.remoteAddress || '(remoteAddress missing)';

  if (config.trustProxy) {
    const forwardedFor = getForwardedFor(req.headers);
    if (forwardedFor !== null) {
      address = forwardedFor;
    }
  }

  if (config.anonymizeAddresses) {
    const anonymized = anonymizeAddress(address);
    if (anonymized !== null) {
      address = anonymized;
    }
  }

  return address;
}

module.exports.getForwardedFor = getForwardedFor;
module.exports.getAddress = getAddress;
module.exports.anonymizeAddress = anonymizeAddress;
