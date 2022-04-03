module.exports = {
  // port for the server to listen on
  // on unix-like platforms, this can be the path to a unix socket
  port: process.env.PORT || 9080,

  // the unix permissions to use for unix sockets
  // set to -1 to disable permission changing
  // make sure to use an octal (`0o`) instead of just a regular number
  unixSocketPermissions: 0o777,

  // enable to read x-forwarded-for
  trustProxy: process.env.TRUST_PROXY === 'true',

  // removes IP addresses from logs
  anonymizeAddresses: process.env.ANONYMIZE_ADDRESSES === 'true',

  // anonymize generated usernames like "player123456"
  anonymizeGeneratedUsernames: true,

  // change this to an object to enable the WebSocket per-message deflate extension
  perMessageDeflate: false,

  // If set to a non-zero number, sends will be buffered to this many per second
  // This can significantly improve performance
  bufferSends: 60,

  enableRename: false,

  enableDelete: false,

  logging: {
    console: true,

    // passed directly into winston-daily-rotate-file
    // see here for options: https://github.com/winstonjs/winston-daily-rotate-file#options
    rotation: {
      filename: '%DATE%.log',
      // LOGS_DIRECTORY is used by systemd services with the LogsDirectory= directive
      dirname: process.env.LOGS_DIRECTORY || 'logs',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      createSymlink: true,
    },
  },
};
