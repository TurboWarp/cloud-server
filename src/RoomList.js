const Room = require('./Room');
const ConnectionError = require('./ConnectionError');
const logger = require('./logger');

/** Delay between janitor runs. */
const JANITOR_INTERVAL = 1000 * 60;
/** Time a room must be empty for before it may be removed by the janitor. */
const JANITOR_THRESHOLD = 1000 * 60 * 60;
/** Maximum amount of rooms that can exist at once. Empty rooms are included in this limit. */
const MAX_ROOMS = 16384;

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
    this.maxRooms = MAX_ROOMS;
    /** Enable or disable logging of events to the console. */
    this.enableLogging = false;
    this.janitor = this.janitor.bind(this);
    /** @private */
    this.janitorInterval = null;
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
    if (!room) {
      throw new Error('Room does not exist');
    }
    return room;
  }

  /**
   * Create a new Room
   * @param {RoomID} id The room ID
   * @returns {Room} A new room
   * @throws Will throw if there are too many rooms.
   */
  create(id) {
    if (this.rooms.size >= this.maxRooms) {
      // TODO: it may be worthwhile to call janitor() and check again
      throw new ConnectionError(ConnectionError.Overloaded, `Too many rooms to fit ${id}`);
    }
    if (this.has(id)) {
      throw new Error('Room already exists');
    }
    const room = new Room(id);
    // It is important we update the room ID map at the end as setRoomData may throw.
    this.rooms.set(id, room);
    if (this.enableLogging) {
      logger.info('Created room: ' + id);
    }
    return room;
  }

  /**
   * Remove a Room
   * @param {RoomID} id The ID of the Room
   * @throws Will throw if the room does not exist, or if the room has clients connected.
   */
  remove(id) {
    const room = this.get(id);
    if (room.getClients().length > 0) {
      throw new Error('Clients are connected to this room');
    }
    this.rooms.delete(id);
    if (this.enableLogging) {
      logger.info('Removed room: ' + id);
    }
  }

  /**
   * Scan for dormant rooms and remove them.
   * @private
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
      this.remove(id);
    }
  }

  /**
   * Begin the janitor timer.
   */
  startJanitor() {
    this.janitorInterval = setInterval(this.janitor, JANITOR_INTERVAL)
  }

  /**
   * Delete this RoomList.
   * Stops the janitor timer, if it is started.
   */
  destroy() {
    if (this.janitorInterval) {
      clearInterval(this.janitorInterval);
    }
  }
}

module.exports = RoomList;
