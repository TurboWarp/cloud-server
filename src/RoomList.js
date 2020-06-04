const Room = require('./Room');
const Client = require('./Client');
const logger = require('./logger');

/**
 * @typedef {string} RoomID A unique ID for a Room.
 */

class RoomList {
  constructor() {
    /** @type {Map<RoomID, Room>} */
    this.rooms = new Map();
    this.janitorInterval = setInterval(() => this.janitor(), 1000 * 30);
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
   * @throws Throws if room does not exist
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
   */
  create(id, initialData) {
    const room = new Room();
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
    const removalThreshold = Date.now() - 1000 * 30;
    // I don't know if deleting items from a map during iteration will cause issues,
    // so we'll collate the ids to remove first then remove them after.
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
