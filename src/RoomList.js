const Room = require('./Room');

/**
 * @typedef {string} RoomID A unique ID for a Room.
 */

class RoomList {
  constructor() {
    /** @type {Map<RoomID, Room>} */
    this.rooms = new Map();
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
    return room;
  }
}

module.exports = RoomList;
