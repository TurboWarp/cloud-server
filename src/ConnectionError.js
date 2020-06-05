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

ConnectionError.ProtocolError = 1002;
ConnectionError.UnsupportedData = 1003;
ConnectionError.PolicyViolation = 1008;
ConnectionError.InternalError = 1011;
ConnectionError.TryAgainLater = 1013;

module.exports = ConnectionError;
