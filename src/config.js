module.exports = {
  // Port for the server to listen on
  // On unix-like platforms, this can be the path to a unix socket
  // PORT is a common environment variable used used by various hosting services.
  port: process.env.PORT || 9080,

  // The unix permissions to use when port is set to a unix socket.
  // Set to -1 to use default permissions.
  // Recommended to use an octal number (0o) so that it looks similar to what you
  // would put into chmod.
  unixSocketPermissions: 0o777,

  // The database to use. Either:
  //  - 'none' for no database
  //  - 'sqlite' to use a persistent sqlite database
  database: 'none',

  // If you're behind a reverse proxy such as nginx or Cloudflare, this can be
  // enabled so that the logs use the IP given by x-forwarded-for instead of the
  // address of the socket.
  trustProxy: false,

  // Removes IP addresses from logs
  anonymizeAddresses: false,

  // Anonymize generated usernames like "player123456" to just "player"
  anonymizeGeneratedUsernames: true,

  // Configures WebSocket per-message compression.
  // This can allow significant bandwidth reduction, but it can use a lot of CPU
  // and may cause catastrophic memory fragmentation on Linux.
  // This value is passed directly into ws's perMessageDeflate option:
  // https://github.com/websockets/ws#websocket-compression
  perMessageDeflate: false,

  // If this is set to a non-zero number, outgoing variable updates will be sent
  // in batches this many times per second instead of immediately.
  // This can significantly reduce CPU and network usage in projects with many
  // active clients.
  bufferSends: 30,

  // Enables variable renaming
  enableRename: false,

  // Enables variable deleting
  enableDelete: false,

  logging: {
    // Whether logs should be printed to the console or not.
    console: true,

    // Passed directly into winston-daily-rotate-file
    // For options, see: https://github.com/winstonjs/winston-daily-rotate-file#options
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
