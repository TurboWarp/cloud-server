const WebSocket = require('ws');
const Room = require('./Room');
const Client = require('./Client');
const RoomList = require('./RoomList');
const Checkers = require('./checkers');
const Reasons = require('./reasons');

const wss = new WebSocket.Server({
  port: 8082,
});

const rooms = new RoomList();

/**
 * @param {unknown} data 
 */
function isValidMessage(data) {
  // @ts-ignore
  return !!data && typeof data === 'object' && typeof data.kind === 'string';
}

/**
 * Parse WebSocket message data.
 * @param {string} data Message data
 */
function parseMessage(data) {
  const message = JSON.parse(data);
  if (!isValidMessage(message)) {
    throw new Error('Invalid message');
  }
  return message;
}

wss.on('connection', (ws, req) => {
  const client = new Client(ws, req);

  /**
   * Log a message with a prefix including the IP and username of the client.
   * @param {any[]} args
   */
  function log(...args) {
    console.log(`[${client.ip} "${client.username}"]`, ...args);
  }

  function performConnect(roomId, username, variables) {
    if (client.room) throw new Error('Already has room');
    if (!Checkers.isValidRoomID(roomId)) throw new Error('Invalid room ID');
    if (!Checkers.isValidUsername(username)) throw new Error('Invalid username');
    if (!Checkers.isValidVariableMap(variables)) throw new Error('Invalid variable map');

    client.username = username;

    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.hasClientWithUsername(username)) {
        throw new Error('Client with username already exists');
      }
      client.room = room;
      client.sendAllVariables();
      log('Joined existing room: ' + roomId);
    } else {
      client.room = rooms.create(roomId, variables);
      log('Created new room: ' + roomId);
    }
    client.room.addClient(client);
  }

  function performSet(variable, value) {
    if (!client.room) throw new Error('No room setup yet');

    client.room.set(variable, value);
    client.room.getClients().forEach((otherClient) => {
      if (otherClient !== client) {
        otherClient.sendVariableSet(variable, value);
      }
    });
  }

  log('Connection opened');

  ws.on('message', (data) => {
    try {
      const message = parseMessage(data.toString());
      const kind = message.kind;

      switch (kind) {
        case 'connect':
          performConnect(message.id, message.username, message.variables);
          break;

        case 'set_var':
          performSet(message.var, message.value);
          break;

        default:
          throw new Error('Unknown message type');
      }
    } catch (e) {
      log('Error handling connection', e);
      client.close(Reasons.ERROR);
    }
  });

  ws.on('close', () => {
    client.destroy();
    log('Connection closed');
  });
});
