module.exports = {
  // port for the server to listen on
  port: process.env.PORT || 9080,

  // enable to read x-forwarded-for
  trustProxy: process.env.TRUST_PROXY === 'true',

  // truncates some parts of connecting IP addresses
  anonymizeAddresses: process.env.ANONYMIZE_ADDRESSES === 'true',

  logging: {
    // forcibly enable console logging when NODE_ENV is set to production
    forceEnableConsoleLogging: false,

    // passed directly into winston-daily-rotate-file
    rotation: {
      filename: '%DATE%.log',
      // LOGS_DIRECTORY is used by systemd
      dirname: process.env.LOGS_DIRECTORY || 'logs',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      createSymlink: true,
    },
  },
};
