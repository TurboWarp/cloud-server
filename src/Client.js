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
    /** The connecting IP */
    this.ip = getIP(req);
    /**
     * The room this client is connected to.
     * @type {Room}
     */
    this.room = null;
    /**
     * The username of the Client.
     * This value is only valid if room != null
     * @type {string}
     */
    this.username = null;
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
      kind: 'set',
      var: name,
      value: value,
    });
  }

  /**
   * Send a 'set variable' for each of the variables of the connected room.
   */
  sendAllVariables() {
    this.room.getAllVariables().forEach((value, name) => {
      this.sendVariableSet(name, value);
    });
  }

  /**
   * Close the connection to this client.
   * @param {string} error The reason to send
   */
  close(error) {
    this.send({
      kind: 'close',
      reason: error,
    });
    this.ws.close();
  }

  /**
   * Set the room that this client connects to and join it.
   * @param {Room} room
   */
  setRoom(room) {
    this.room = room;
    this.room.addClient(this);
  }

  /**
   * Put this Client in an unrepairable, destructed state.
   */
  destroy() {
    if (this.room) {
      this.room.removeClient(this);
    }
    this.room = null;
  }
}

module.exports = Client;
