const logger = require('./logger');
const Client = require('./Client');

/**
 * Time, in milliseconds, for connections to be considered timed out.
 */
const TIMEOUT = 1000 * 30;

class ConnectionManager {
  constructor() {
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
    this.clients.forEach((client) => {
      if (!client.respondedToPing) {
        // Clients that have not responded to the most recent ping are considered dead.
        client.timedOut('no pong');
        return;
      }

      if (client.room === null) {
        if (client.connectedAt < Date.now() - TIMEOUT) {
          // Clients that have not joined a room in a reasonable time are considered dead.
          client.timedOut('no handshake');
          return;
        }
      }

      // Clients are sent a ping, and expected to respond to the ping by the time the next ping will be sent.
      client.ping();
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
    client.respondedToPing = true;
  }

  /**
   * Start the ConnectionManager's periodic check.
   */
  start() {
    if (this.interval) {
      throw new Error('Already started');
    }
    this.interval = setInterval(this.update, TIMEOUT);
  }

  /**
   * Stop the ConnectionManager from running.
   */
  stop() {
    if (!this.interval) {
      throw new Error('Not started');
    }
    clearInterval(this.interval);
  }
}

module.exports = ConnectionManager;
