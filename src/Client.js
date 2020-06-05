const Room = require('./Room');
const config = require('./config');
const logger = require('./logger');

/**
 * Get the remote IP address of a request.
 * @param {import('http').IncomingMessage} req
 * @returns {string} The IP address
 */
function getIP(req) {
  const socketAddress = req.socket.remoteAddress || '???';

  if (config.trustProxy) {
    let header = req.headers['x-forwarded-for'];
    if (Array.isArray(header)) {
      header = header[0];
    }
    if (!header) {
      return socketAddress;
    }
    const remoteAddress = header.split(/\s*,\s*/)[0];
    return remoteAddress || socketAddress;
  }

  return socketAddress;
}

class Client {
  /**
   * @param {import('ws')} ws The WebSocket connection
   * @param {import('http').IncomingMessage} req The HTTP request
   */
  constructor(ws, req) {
    /** The WebSocket connection */
    this.ws = ws;
    /** The connecting IP */
    this.ip = getIP(req);
    /**
     * The Room this client is connected to.
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
   * Log a message with a prefix including the IP and username of this client.
   * @param {any[]} args
   */
  log(...args) {
    let prefix = '[' + this.ip;
    if (this.username !== null) {
      prefix += ' "' + this.username + '"';
    }
    if (this.room !== null) {
      prefix += ' in ' + this.room.id;
    }
    prefix += ']';
    logger.info(prefix, ...args);
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
   * Close the connection to this client and send one final message to the client.
   * @param {number} [code] The error code to send
   */
  close(code) {
    // Close connection, inform client
    if (this.ws.readyState === this.ws.OPEN) {
      if (code) {
        this.ws.close(code);
      } else {
        this.ws.close();
      }
      this.ws = null;
    }
    // Remove from room
    if (this.room) {
      this.room.removeClient(this);
      this.room = null;
    }
  }

  /**
   * Set the room that this client connects to and join it.
   * @param {Room} room
   */
  setRoom(room) {
    this.room = room;
    this.room.addClient(this);
  }
}

module.exports = Client;
