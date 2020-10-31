class ConnectionError extends Error {
  /**
   * ConnectionError is an error with some special handling from the server.
   * @param {number} code WebSocket status code.
   * @param {string} message Error message. Should include more details than the status code. This is not shown to the user.
   */
  constructor(code, message) {
    super(`${message} (code ${code})`);
    this.code = code;
  }
}

// See protocol.md
ConnectionError.Error = 4000;
ConnectionError.Username = 4002;
ConnectionError.Overloaded = 4003;

module.exports = ConnectionError;
