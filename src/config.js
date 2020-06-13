module.exports = {
  port: process.env.PORT || 9080,
  trustProxy: process.env.TRUST_PROXY === 'true' || true,
};
