const Room = require('./Room');
const config = require('./config');
const logger = require('./logger');

/**
 * Get the remote IP address of a request.
 * This may be configured to trust a proxy and return the proxy's forwarded-for IP instead of the actual remote IP
 * @param {?import('http').IncomingMessage} req
 * @returns {string} The IP address
 */
function getIP(req) {
  if (req === null) {
    return '(req missing)';
  }

  const socketAddress = req.socket.remoteAddress || '(remoteAddress missing)';

  if (config.trustProxy) {
    const header = /** @type {string} */ (req.headers['x-forwarded-for']);
    if (!header || typeof header !== 'string') {
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
    this.ip = getIP(req);
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
  }

  /**
   * Get the prefix used in log messages.
   * @private
   * @returns {string}
   */
  getLogPrefix() {
    let prefix = '[' + this.ip;
    if (this.username !== '') {
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
   * Send a message to the client.
   * @param {import('ws').Data} data The data to send.
   */
  send(data) {
    if (this.ws === null || this.ws.readyState !== this.ws.OPEN) {
      this.log('Cannot send message');
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

  /**
   * Send a ping message to this Client.
   */
  ping() {
    this.respondedToPing = false;
    if (this.ws !== null) {
      this.ws.ping();
    }
  }

  timedOut() {
    if (this.ws !== null) {
      // terminate will then run the proper onclose handlers
      this.ws.terminate();
    } else {
      this.log('Timed out but not connected?');
    }
    this.log('Timed out');
  }
}

module.exports = Client;
