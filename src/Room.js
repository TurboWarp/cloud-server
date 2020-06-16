const validators = require('./validators');
const ConnectionError = require('./ConnectionError');

/**
 * @typedef {import('./Client')} Client
 */

/**
 * @typedef {string} RoomID A unique ID for a Room.
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
     * @type {Map<string, string>}
     * @private
     * @readonly
     */
    this.variables = new Map();
    /**
     * Clients connected to this room.
     * @type {Set<Client>}
     * @private
     */
    this.clients = new Set();
    /**
     * The time of the last client disconnect.
     * @type {number}
     */
    this.lastDisconnectTime = -1;
    /**
     * Maximum number of variables that can be within this room.
     * @type {number}
     */
    this.maxVariables = 10;
    /**
     * Maximum number of clients that can be connected to this room.
     */
    this.maxClients = 100;
  }

  /**
   * Add a new client.
   * @param {Client} client The client to add
   * @throws Will throw if client is already added, or there are too many clients connected.
   */
  addClient(client) {
    if (this.clients.has(client)) {
      throw new Error('Client is already added to this Room.');
    }
    if (this.clients.size >= this.maxClients) {
      throw new ConnectionError(ConnectionError.Overloaded, 'Too many clients are connected to this room.');
    }
    this.clients.add(client);
  }

  /**
   * Remove a client.
   * @param {Client} client The client to remove
   * @throws Will throw if the client is not part of this room.
   */
  removeClient(client) {
    if (!this.clients.has(client)) {
      throw new Error('Client is not part of this Room.');
    }
    this.clients.delete(client);
    this.lastDisconnectTime = Date.now();
  }

  /**
   * Get all connected clients.
   * @returns {Set<Client>} All connected clients.
   */
  getClients() {
    return this.clients;
  }

  /**
   * Get a map of all variables.
   * @returns {Map<string, string>} All variables, and their value.
   */
  getAllVariables() {
    return this.variables;
  }

  /**
   * Create a new variable.
   * This method does not inform clients of the change.
   * @param {string} name The name of the variable
   * @param {string} value The value of the variable
   * @throws Will throw if name or value are invalid, the variable already exists, or there are too many variables.
   */
  create(name, value) {
    if (!validators.isValidVariableName(name)) {
      throw new Error('Invalid variable name');
    }
    if (!validators.isValidVariableValue(value)) {
      throw new Error('Invalid value');
    }
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
   * @param {string} value The value of the variable
   * @throws Will throw if name or value are invalid, or the variable does not exist.
   */
  set(name, value) {
    if (!this.has(name)) {
      throw new Error('Variable does not exist');
    }
    if (!validators.isValidVariableName(name)) {
      throw new Error('Invalid variable name');
    }
    if (!validators.isValidVariableValue(value)) {
      throw new Error('Invalid value');
    }
    this.variables.set(name, value);
  }

  /**
   * Determine whether this room has a variable of a given name.
   * @param {string} name The name of the variable
   */
  has(name) {
    return this.variables.has(name);
  }

  /**
   * Determine whether a username is already in use by a client connected to this room.
   * @param {string} username The username to search for
   * @returns {boolean}
   */
  hasClientWithUsername(username) {
    // usernames are compared case insensitively
    username = username.toLowerCase();
    for (const client of this.clients) {
      if (client.username.toLowerCase() === username) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine whether a list of variable names matches the names of the variables in this room.
   * Case sensitive, order doesn't matter.
   * @param {string[]} variables The list of variable names. Must not contain duplicates.
   * @returns {boolean}
   */
  matchesVariableList(variables) {
    if (variables.length !== this.variables.size) {
      return false;
    }
    for (const variableName of this.getAllVariables().keys()) {
      if (variables.indexOf(variableName) === -1) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Room;
