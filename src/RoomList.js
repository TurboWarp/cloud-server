const Room = require('./Room');
const ConnectionError = require('./ConnectionError');
const logger = require('./logger');

/** Delay between janitor runs. */
const JANITOR_INTERVAL = 1000 * 30;
/** Time a room must be empty for before it may be removed by the janitor. */
const JANITOR_THRESHOLD = 1000 * 30;

/**
 * @typedef {import('./Room').RoomID} RoomID
 */

class RoomList {
  constructor() {
    /**
     * Map of RoomID to the Room with that ID.
     * @type {Map<RoomID, Room>}
     * @private
     */
    this.rooms = new Map();
    /**
     * Maximum amount of rooms that can exist at once.
     * @type {number}
     */
    this.maxRooms = 100;
    this.janitor = this.janitor.bind(this);
    /** @private */
    this.janitorInterval = setInterval(this.janitor, JANITOR_INTERVAL);
  }

  /**
   * Whether a Room exists in this list
   * @param {RoomID} id
   * @returns {boolean} Whether the room exists
   */
  has(id) {
    return this.rooms.has(id);
  }

  /**
   * Get a Room
   * @param {RoomID} id 
   * @returns {Room}
   * @throws Will throw if room does not exist
   */
  get(id) {
    const room = this.rooms.get(id);
    if (room === null) {
      throw new Error('Room does not exist');
    }
    return room;
  }

  /**
   * Create a new Room
   * @param {RoomID} id The room ID
   * @param {{ [s: string]: string }} initialData The variables to create and their value
   * @returns {Room} A new room
   * @throws Will throw if there are too many rooms.
   */
  create(id, initialData) {
    if (this.rooms.size >= this.maxRooms) {
      throw new ConnectionError(ConnectionError.TryAgainLater, 'Too many rooms');
    }
    const room = new Room(id);
    for (const key of Object.keys(initialData)) {
      room.createVar(key, initialData[key]);
    }
    this.rooms.set(id, room);
    logger.info('Created room: ' + id);
    return room;
  }

  /**
   * Remove a Room
   * @param {RoomID} id The ID of the Room
   * @throws Will throw if the room does not exist, or if the room has clients connected.
   */
  removeRoom(id) {
    const room = this.get(id);
    if (room.getClients().length > 0) {
      throw new Error('Clients are connected to this room');
    }
    this.rooms.delete(id);
    logger.info('Removed room: ' + id);
  }

  /**
   * Scan for dormant rooms and remove them.
   */
  janitor() {
    const removalThreshold = Date.now() - JANITOR_THRESHOLD;
    // I don't know if deleting items from a map during iteration will cause issues,
    // so we'll collect the ids to remove first then remove them after.
    /** @type {RoomID[]} */
    const idsToRemove = [];
    for (const [id, room] of this.rooms.entries()) {
      if (room.getClients().length === 0) {
        if (room.lastDisconnectTime < removalThreshold) {
          idsToRemove.push(id);
        }
      }
    }
    for (const id of idsToRemove) {
      this.removeRoom(id);
    }
  }

  /**
   * Delete this RoomList.
   */
  destroy() {
    clearInterval(this.janitorInterval);
  }
}

module.exports = RoomList;
