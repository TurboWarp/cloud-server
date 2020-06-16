const logger = require('./logger');
const Client = require('./Client');

/** The time, in milliseconds, between ping checks. */
const TIMEOUT = 1000 * 30;

class ConnectionManager {
  /**
   * @param {import('ws').Server} wss The WebSocket server
   */
  constructor(wss) {
    /** @private */
    this.wss = wss;
    /** @private */
    this.interval = null;
    this.update = this.update.bind(this);
    /**
     * All connected clients.
     * @type {Set<Client>}
     * @private
     */
    this.clients = new Set();
  }

  /**
   * @private
   */
  update() {
    if (this.clients.size > 0) {
      logger.info(`Pinging ${this.clients.size} clients...`);
    }
    this.clients.forEach(function(client) {
      if (client.isAlive === false) {
        // Socket has not responded to the previous ping request, and is probably dead.
        // terminate will call the onclose handler to cleanup the connection
        client.ws.terminate();
        client.log('Timed out');
        return;
      }

      // We will send a ping to the client.
      // When we receive a pong, isAlive will be set to true.
      // This gives the client until the next update to respond, this should be plenty long for any living connection.
      client.isAlive = false;
      client.ws.ping();
    });
  }

  /**
   * Handle a connection from a client.
   * @param {Client} client The Client connecting.
   */
  handleConnect(client) {
    this.clients.add(client);
  }

  /**
   * Handle a disconnection from a client.
   * @param {Client} client The Client disconnecting.
   */
  handleDisconnect(client) {
    this.clients.delete(client);
  }

  /**
   * Handle a pong from a client.
   * @param {Client} client The WebSocket server the pong is from
   */
  handlePong(client) {
    client.isAlive = true;
  }

  /**
   * Start the PingManager's periodic check.
   */
  start() {
    if (this.interval) {
      throw new Error('Already started');
    }
    this.interval = setInterval(this.update, TIMEOUT);
  }

  /**
   * Stop the PingManager from running.
   */
  stop() {
    if (!this.interval) {
      throw new Error('Not started');
    }
    clearInterval(this.interval);
  }
}

module.exports = ConnectionManager;
