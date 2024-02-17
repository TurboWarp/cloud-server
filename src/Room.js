/**
 * @typedef {import('./Client')} Client
 */

/**
 * @typedef {string} RoomID A unique ID for a Room.
 */

/**
 * @typedef {string|number} Value A value stored in a variable in a Room.
 */

class Room {
  /**
   * @param {RoomID} id
   */
  constructor(id) {
    /**
     * Unique ID given to this room.
     * @type {RoomID}
     * @readonly
     */
    this.id = id;
    /**
     * The variables that are within this room.
     * @type {Map<string, Value>}
     * @private
     * @readonly
     */
    this.variables = new Map();
    /**
     * Clients connected to this room.
     * @type {Client[]}
     * @private
     */
    this.clients = [];
    /**
     * The time of the last client disconnect.
     */
    this.lastDisconnectTime = -1;
    /**
     * Maximum number of variables that can be within this room.
     */
    this.maxVariables = 128;
    /**
     * Maximum number of clients that can be connected to this room.
     */
    this.maxClients = 128;
  }

  /**
   * Add a new client.
   * @param {Client} client The client to add
   * @throws Will throw if client is already added, or there are too many clients connected.
   */
  addClient(client) {
    if (this.clients.includes(client)) {
      throw new Error(`Client is already added to room ${this.id}`);
    }
    if (this.clients.length >= this.maxClients) {
      throw new Error(`Too many clients are connected to room ${this.id}`);
    }
    this.clients.push(client);
  }

  /**
   * Remove a client.
   * @param {Client} client The client to remove
   * @throws Will throw if the client is not part of this room.
   */
  removeClient(client) {
    const index = this.clients.indexOf(client);
    if (index === -1) {
      throw new Error(`Client is not part of room ${this.id}`);
    }
    this.clients.splice(index, 1);
    this.lastDisconnectTime = Date.now();
  }

  /**
   * Get all connected clients.
   * @returns {Client[]} All connected clients.
   */
  getClients() {
    return this.clients;
  }

  /**
   * Get a map of all variables.
   * @returns {Map<string, Value>} All variables, and their value.
   */
  getAllVariables() {
    return this.variables;
  }

  /**
   * Create a new variable.
   * This method does not inform clients of the change.
   * @param {string} name The name of the variable
   * @param {string} value The value of the variable
   * @throws Will throw if the variable already exists, or there are too many variables.
   */
  create(name, value) {
    if (this.has(name)) {
      throw new Error('Variable already exists');
    }
    if (this.variables.size >= this.maxVariables) {
      throw new Error('Too many variables');
    }
    this.variables.set(name, value);
  }

  /**
   * Set an existing variable to a new value.
   * This method does not inform clients of the change.
   * @param {string} name The name of the variable
   * @param {Value} value The value of the variable
   * @throws Will throw if the variable does not exist.
   */
  set(name, value) {
    if (!this.has(name)) {
      throw new Error('Variable does not exist');
    }
    this.variables.set(name, value);
  }

  /**
   * Delete a variable.
   * @param {string} name The name of the variable
   * @throws Will throw if the variable does not exist.
   */
  delete(name) {
    if (!this.has(name)) {
      throw new Error('Variable does not exist');
    }
    this.variables.delete(name);
  }

  /**
   * Get a variable.
   * @param {string} name The name of the variable
   * @returns {Value} Variable value.
   * @throws Will throw if the variable does not exist.
   */
  get(name) {
    const value = this.variables.get(name);
    if (typeof value === 'undefined') {
      throw new Error('Variable does not exist');
    }
    return value;
  }

  /**
   * Determine whether this room has a variable of a given name.
   * @param {string} name The name of the variable
   */
  has(name) {
    return this.variables.has(name);
  }
}

module.exports = Room;
