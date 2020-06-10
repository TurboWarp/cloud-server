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
    const header = /** @type {string} */ (req.headers['x-forwarded-for']);
    if (!header) {
      return socketAddress;
    }
    // extract the first IP
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
   * Get the prefix used in log messages.
   * @private
   * @returns {string}
   */
  getLogPrefix() {
    let prefix = '[' + this.ip;
    if (this.username !== null) {
      prefix += ' "' + this.username + '"';
    }
    if (this.room !== null) {
      prefix += ' in ' + this.room.id;
    }
    prefix += ']';
    return prefix;
  }

  /**
   * Log a message including some metadata about this client.
   * @param {...any} args
   */
  log(...args) {
    logger.info(this.getLogPrefix(), ...args);
  }

  /**
   * Log a warning message including some metadata about this client.
   * @param {...any} args
   */
  warn(...args) {
    logger.warn(this.getLogPrefix(), ...args);
  }

  /**
   * Log an error message including some metadata about this client.
   * @param {...any} args
   */
  error(...args) {
    logger.error(this.getLogPrefix(), ...args);
  }

  /**
   * Whether the client can receive messages.
   * @private
   * @returns {boolean}
   */
  canSendMessage() {
    return this.ws !== null && this.ws.readyState === this.ws.OPEN;
  }

  /**
   * Send a message to the client.
   * @param {object} data JSON object to send.
   * @private
   */
  send(data) {
    if (!this.canSendMessage()) {
      this.log('Cannot send message');
      return;
    }
    this.ws.send(JSON.stringify(data));
  }

  /**
   * Send multiple messages to the client with a single message.
   * @param {object[]} data List of JSON objects to send.
   * @private
   */
  sendMany(data) {
    if (!this.canSendMessage()) {
      this.log('Cannot send message');
      return;
    }
    // When sending multiple messages, each message is separated by a newline.
    this.ws.send(
      data.map((i) => JSON.stringify(i)).join('\n')
    );
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
   * Send multiple 'set variable' messages to this Client with a single message.
   * @param {[string, string][]} changes List of tuple with name, value of changed variables
   */
  sendManyVariableSet(changes) {
    this.sendMany(
      changes.map((i) => ({
        kind: 'set',
        var: i[0],
        value: i[1],
      }))
    );
  }

  /**
   * Send a 'set variable' for each of the variables of the connected room.
   */
  sendAllVariables() {
    const commands = [];
    this.room.getAllVariables().forEach((value, name) => {
      commands.push([name, value]);
    });
    this.sendManyVariableSet(commands);
  }

  /**
   * Close the connection to this client and send one final message to the client.
   * @param {number} code The error code to send
   */
  close(code) {
    // Close connection, inform client
    if (this.ws !== null && this.ws.readyState === this.ws.OPEN) {
      this.ws.close(code);
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
   * @throws Will throw if the client is already in a room.
   */
  setRoom(room) {
    if (this.room !== null) {
      throw new Error('Already joined a room');
    }
    this.room = room;
    this.room.addClient(this);
  }
}

module.exports = Client;
