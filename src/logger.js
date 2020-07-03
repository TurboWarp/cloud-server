const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('./config');
const environment = require('./environment');

const logger = winston.createLogger({
  level: environment.isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
});

logger.add(new winston.transports.DailyRotateFile(config.logging.rotation));

if ((environment.isDevelopment || config.logging.forceEnableConsoleLogging) && !environment.isTest) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

module.exports = logger;
