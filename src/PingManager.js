const logger = require('./logger');

/** The time, in milliseconds, between ping checks. */
const TIMEOUT = 1000 * 30;

class PingManager {
  /**
   * @param {import('ws').Server} wss The WebSocket server
   */
  constructor(wss) {
    /** @private */
    this.wss = wss;
    /** @private */
    this.interval = null;
    this.update = this.update.bind(this);
  }

  /**
   * @private
   */
  update() {
    const clients = this.wss.clients;
    if (clients.size > 0) {
      logger.info(`Pinging ${clients.size} clients...`);
    }
    clients.forEach(function(ws) {
      // @ts-ignore
      if (ws.isAlive === false) {
        // Socket has not responded to ping for a long time, and is probably dead.
        // terminate will call the onclose handler to cleanup the connection
        ws.terminate();

        /** @type {import('./Client')} */
        // @ts-ignore
        const client = ws.client;
        // maybe client could be null if the connection started but was never processed?
        if (client) {
          client.log('Timed out');
        } else {
          logger.info('Timed out connection without a client');
        }

        return;
      }

      // We will send a ping to the client.
      // When we receive a pong, isAlive will be set to true.
      // This gives the client until the next update to respond, this should be plenty long for any living connection.

      // @ts-ignore
      ws.isAlive = false;
      ws.ping();
    });
  }

  /**
   * Handle a connection from a client.
   * @param {import('ws')} ws The WebSocket server
   */
  handleConnection(ws) {
    // @ts-ignore
    ws.isAlive = true;
  }

  /**
   * Handle a pong from a client.
   * @param {import('ws')} ws The WebSocket server the pong is from
   */
  handlePong(ws) {
    // @ts-ignore
    ws.isAlive = true;
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

module.exports = PingManager;
