const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('./config');
const environment = require('./environment');

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: environment.isDevelopment ? 'debug' : 'info',
  format: format
});

if (config.logging.rotation) {
  logger.add(new winston.transports.DailyRotateFile(config.logging.rotation));
}

if (config.logging.console && !environment.isTest) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      // Include color when logging to console, not when logging to file (results in ugly escape codes)
      winston.format.colorize(),
      format
    )
  }));
}

module.exports = logger;
