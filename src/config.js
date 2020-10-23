module.exports = {
  // port for the server to listen on
  port: process.env.PORT || 9080,

  // change to >0 to change permission of unix sockets
  unixSocketPermissions: -1,

  // enable to read x-forwarded-for
  trustProxy: process.env.TRUST_PROXY === 'true',

  // truncates some parts of connecting IP addresses
  anonymizeAddresses: process.env.ANONYMIZE_ADDRESSES === 'true',

  // change this to an object to enable the WebSocket per-message deflate extension
  // note: this can cause significant performance penalty and catastrophic memory fragmentation (https://github.com/nodejs/node/issues/8871)
  // see here for parameters: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
  perMessageDeflate: false,

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
