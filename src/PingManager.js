const logger = require('./logger');

class PingManager {
  /**
   * @param {import('ws').Server} wss The WebSocket server
   */
  constructor(wss) {
    /**
     * The WebSocket server.
     * @private
     */
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
        // terminate will call the onclose handler
        ws.terminate();

        /** @type {import('./Client')} */
        // @ts-ignore
        const client = ws.client;
        // client could be null at this point
        if (client) {
          client.log('Timed out');
        }

        return;
      }
  
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
   * 
   * @param {number} ms The time, in milliseconds, between checks.
   */
  start(ms) {
    if (this.interval) {
      throw new Error('already started');
    }
    this.interval = setInterval(this.update, ms);
  }

  /**
   * Stop the PingManager from running.
   */
  stop() {
    if (!this.interval) {
      throw new Error('not started');
    }
    clearInterval(this.interval);
  }
}

module.exports = PingManager;
