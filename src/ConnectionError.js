class ConnectionError extends Error {
  /**
   * ConnectionError is an error with some special handling from the server.
   * @param {string} code Error code. May describe a general type of error. This may be shown to the user.
   * @param {string} message Error message. Should include more details. This is not shown to the user.
   */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/** Default error code when a non-ConnectionError is thrown. */
ConnectionError.DEFAULT_ERROR_CODE = 'error';

ConnectionError.UsernameError = class UsernameError extends ConnectionError {
  constructor(message) { super('username', message); }
};
ConnectionError.RoomError = class RoomError extends ConnectionError {
  constructor(message) { super('room', message); }
};

module.exports = ConnectionError;
