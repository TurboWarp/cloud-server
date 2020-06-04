const Room = require('./Room');

/**
 * Get the remote IP address of a request.
 * @param {import('http').IncomingMessage} req
 * @returns {string} The IP address
 */
function getIP(req) {
  return req.socket.remoteAddress || '???';
}

class Client {
  /**
   * @param {import('ws')} ws The WebSocket connection
   * @param {import('http').IncomingMessage} req The HTTP request
   */
  constructor(ws, req) {
    this.ws = ws;
    /** Whether this client is connected to a room. */
    this.isConnected = false;
    /** The connecting IP */
    this.ip = getIP(req);
    /** The username of the Client. */
    this.username = '';
    /**
     * The room this client is connected to.
     * @type {Room}
     */
    this.room = null;
  }

  /**
   * Send data to this client.
   * @param {object} data JS object to send. Will be stringified
   */
  send(data) {
    this.ws.send(JSON.stringify(data));
  }

  /**
   * Send a 'set variable' message to this Client.
   * @param {string} name The variable's name
   * @param {string} value The variable's value
   */
  sendVariableSet(name, value) {
    this.send({
      kind: 'set_var',
      var: name,
      value: value,
    });
  }

  /**
   * Close the connection to this client.
   * @param {string} error The reason to send
   */
  close(error) {
    this.send({
      kind: 'error',
      reason: error,
    });
    this.ws.close();
  }
}

module.exports = Client;
