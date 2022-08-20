const config = require('../config');
const logger = require('../logger');

if (config.database === 'none') {
  logger.info('Using ephemeral database (none)');
  module.exports = require('./none');
} else if (config.database === 'sqlite') {
  logger.info('Using sqlite database');
  module.exports = require('./sqlite');
} else {
  throw new Error(`Unknown database: ${config.database}`);
}
