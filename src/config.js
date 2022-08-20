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

  // The maximum length of a variable value to allow. Values longer than this will
  // be silently ignored.
  maxValueLength: 100000,

  // Whether to allow variable values that aren't numbers.
  allowNonNumberValues: false,

  // The maximum number of variables to allow in one room. Additional variables will
  // not be allowed.
  maxVariablesPerRoom: 20,

  // The maximum number of people that can be connected to a room at the same time.
  // If another person tries to connect, their connection will be closed.
  maxClientsPerRoom: 128,

  // If this is set to true, the server will validate usernames by talking to the
  // Scratch API to check that an account with that username exists. Usernames that
  // do not exist will be rejected.
  validateUsernames: false,

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

  // emptyRoomLife is the maximum-ish time, in seconds, a room will be kept in memory while no
  // one is connected to it before it is automatically deleted. Depending on what the
  // database option is set to, the variables will either be lost forever or saved to disk.
  // (real maximum will be slightly higher: see emptyRoomLifeInterval below)
  emptyRoomLife: 60 * 60,

  // emptyRoomLife is enforced by a periodic timer. emptyRoomLife is multiplied by
  // emptyRoomLifeInterval to determine how often this timer should run.
  // For example, if emptyRoomLife is 60 minutes (3600 seconds) and this is 0.1, there will be
  // 0.1 * 60 minutes = 6 minutes (360 seconds) between each check. This will allow a room
  // to actually be empty for 66 minutes before being removed.
  emptyRoomLifeInterval: 0.1,

  // The maximum number of cloud variable rooms that can exist at once.
  // Empty rooms are included in this limit until they are removed by emptyRoomLife and
  // emptyRoomLifeInterval.
  maxRooms: 1024,

  // If you're behind a reverse proxy such as nginx or Cloudflare, this can be
  // enabled so that the logs use the IP given by x-forwarded-for instead of the
  // address of the socket.
  trustProxy: false,

  // Removes IP addresses from logs
  anonymizeAddresses: false,

  // Anonymize generated usernames like "player123456" to just "player" in logs.
  anonymizeGeneratedUsernames: true,

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
