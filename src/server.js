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

  function log(...args) {
    console.log(`[${client.ip} "${client.username}"]`, ...args);
  }

  function sendAllVariables() {
    client.room.getAllVariables().forEach((value, name) => {
      client.sendVariableSet(name, value);
    });
  }

  function performConnect(roomId, username, variables) {
    if (client.isConnected) throw new Error('Already connected');
    if (!Checkers.checkRoomID(roomId)) throw new Error('Invalid room ID');
    if (!Checkers.checkUsername(username)) throw new Error('Invalid username');
    if (!Checkers.checkVariableMap(variables)) throw new Error('Invalid variable map');

    client.username = username;

    if (rooms.has(roomId)) {
      client.room = rooms.get(roomId);
      log('Joined existing room: ' + roomId);
      sendAllVariables();
    } else {
      client.room = rooms.create(roomId, variables);
      log('Created new room: ' + roomId);
    }
    client.room.addClient(client);

    client.isConnected = true;
  }

  function performSet(variable, value) {
    if (!client.isConnected) throw new Error('No room setup yet');
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
    log('Connection closed');
    if (client.isConnected) {
      client.isConnected = false;
      client.room.removeClient(client);
      client.room = null;
    }
  });
});
