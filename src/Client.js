const Room = require('./Room');
const address = require('./address');
const {parseUsername} = require('./username');
const logger = require('./logger');

class Client {
  /**
   * @param {?import('ws')} ws The WebSocket connection
   * @param {?import('http').IncomingMessage} req The HTTP request
   */
  constructor(ws, req) {
    /**
     * The WebSocket connection
     * @type {?import('ws')}
     */
    this.ws = ws;
    /**
     * The connecting IP
     */
    this.ip = address.getAddress(req);
    /**
     * The Room this client is connected to.
     * @type {?Room}
     */
    this.room = null;
    /**
     * The username of the Client.
     * This value is only valid if room !== null
     */
    this.username = '';
    /**
     * The time when this Client was created.
     * @readonly
     */
    this.connectedAt = Date.now();
    /**
     * Whether this client has responded to most recent ping request yet.
     */
    this.respondedToPing = true;
    /**
     * The prefix used in log messages.
     * @private
     */
    this.logPrefix = '[]';
    this.updateLogPrefix();
  }

  /**
   * Update the log prefix of this client.
   * @private
   */
  updateLogPrefix() {
    this.logPrefix = '[' + this.ip;
    if (this.username !== '') {
      this.logPrefix += ' "' + this.username + '"';
    }
    if (this.room !== null) {
      this.logPrefix += ' in ' + this.room.id;
    }
    this.logPrefix += ']';
  }

  /**
   * Log a message including some metadata about this client.
   * @param {string} message
   */
  log(message) {
    logger.info(this.logPrefix + ' ' + message);
  }

  /**
   * Log a warning message including some metadata about this client.
   * @param {string} message
   */
  warn(message) {
    logger.warn(this.logPrefix + ' ' + message);
  }

  /**
   * Log an error message including some metadata about this client.
   * @param {string} message
   */
  error(message) {
    logger.error(this.logPrefix + ' ' + message);
  }

  /**
   * Send a message to the client.
   * @param {import('ws').Data} data The data to send.
   */
  send(data) {
    if (this.ws === null) {
      this.log('Cannot send message; ws is null');
      return;
    }
    if (this.ws.readyState !== this.ws.OPEN) {
      this.log('Cannot send message; readyState ' + this.ws.readyState);
      return;
    }
    this.ws.send(data);
  }

  /**
   * Close the connection to this client with a given error code and remove from connected room.
   * @param {number} code The error code to send
   */
  close(code) {
    // Close connection, inform client
    if (this.ws !== null) {
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
    room.addClient(this);
    this.room = room;
    this.updateLogPrefix();
  }

  /**
   * Set the username of this client.
   * @param {string} username The new username
   */
  setUsername(username) {
    this.username = parseUsername(username);
    this.updateLogPrefix();
  }

  /**
   * Send a ping message to this Client.
   */
  ping() {
    this.respondedToPing = false;
    if (this.ws !== null) {
      this.ws.ping();
    }
  }

  /**
   * @param {string} reason Reason for time out, included in logs.
   */
  timedOut(reason) {
    if (this.ws !== null) {
      // terminate will then run the proper onclose handlers
      this.ws.terminate();
    } else {
      this.log(`Timed out but not connected: ${reason}`);
    }
    this.log(`Timed out: ${reason}`);
  }
}

module.exports = Client;
