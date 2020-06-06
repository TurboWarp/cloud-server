class ConnectionError extends Error {
  /**
   * ConnectionError is an error with some special handling from the server.
   * @param {number} code WebSocket error code. See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
   * @param {string} message Error message. Should include more details. This is not shown to the user.
   */
  constructor(code, message) {
    super(`${message} (code ${code})`);
    this.code = code;
  }
}

ConnectionError.Error = 4000;
ConnectionError.Incompatibility = 4001;
ConnectionError.Username = 4002;
ConnectionError.Overloaded = 4003;
ConnectionError.TryAgainLater = 4004;

module.exports = ConnectionError;
