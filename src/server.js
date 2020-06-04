const WebSocket = require('ws');

const Room = require('./Room');
const Client = require('./Client');
const RoomList = require('./RoomList');
const ConnectionError = require('./ConnectionError');
const validators = require('./validators');
const logger = require('./logger');

const wss = new WebSocket.Server({
  noServer: true,
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
    let prefix = '[' + client.ip;
    if (client.username !== null) {
      prefix += ' "' + client.username + '"';
    }
    if (client.room !== null) {
      prefix += ' in ' + client.room.id;
    }
    prefix += ']';
    logger.info(prefix, ...args);
  }

  function performConnect(roomId, username, variables) {
    if (client.room) throw new ConnectionError.RoomError('Already has room');
    if (!validators.isValidRoomID(roomId)) throw new ConnectionError.RoomError('Invalid room ID');
    if (!validators.isValidUsername(username)) throw new ConnectionError.UsernameError('Invalid username');
    if (!validators.isValidVariableMap(variables)) throw new Error('Invalid variable map');

    client.username = username;

    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.hasClientWithUsername(username)) {
        throw new ConnectionError.UsernameError('Client with username already exists');
      }
      client.setRoom(room);
      client.sendAllVariables();
    } else {
      client.setRoom(rooms.create(roomId, variables));
    }

    log('Joined room');
  }

  function performSet(variable, value) {
    if (!client.room) throw new ConnectionError.RoomError('No room setup yet');

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

        case 'set':
          performSet(message.var, message.value);
          break;

        default:
          throw new Error('Unknown message type');
      }
    } catch (e) {
      log('Error handling connection', e);
      if (e instanceof ConnectionError) {
        client.close(e.code);
      } else {
        client.close(ConnectionError.DEFAULT_ERROR_CODE);
      }
    }
  });

  ws.on('error', (error) => {
    log('** ERROR **', error);
    client.destroy();
  });

  ws.on('close', () => {
    client.destroy();
    log('Connection closed');
  });
});

wss.on('close', () => {
  logger.info('Server Closing');
  rooms.destroy();
});

module.exports = wss;
