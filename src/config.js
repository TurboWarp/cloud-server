module.exports = {
  port: process.env.PORT || 9080,
  trustProxy: process.env.TRUST_PROXY === 'true',
  anonymizeAddresses: process.env.ANONYMIZE_ADDRESSES === 'true',
};
