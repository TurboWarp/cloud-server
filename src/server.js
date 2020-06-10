const WebSocket = require('ws');

const Room = require('./Room');
const Client = require('./Client');
const RoomList = require('./RoomList');
const ConnectionError = require('./ConnectionError');
const PingManager = require('./PingManager');
const validators = require('./validators');
const logger = require('./logger');
const RateLimiter = require('./RateLimiter');

const wss = new WebSocket.Server({
  noServer: true,
});

const rooms = new RoomList();

const pingManager = new PingManager(wss);
pingManager.start(1000 * 30);

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
  const rateLimiter = new RateLimiter(20, 1000);

  // @ts-ignore
  ws.client = client;
  pingManager.handleConnection(ws);

  function performHandshake(roomId, username, variables) {
    if (client.room) throw new ConnectionError(ConnectionError.Error, 'Already performed handshake');
    if (!validators.isValidRoomID(roomId)) throw new ConnectionError(ConnectionError.Error, 'Invalid room ID');
    if (!validators.isValidVariableMap(variables)) throw new ConnectionError(ConnectionError.Error, 'Invalid variable map');
    if (!validators.isValidUsername(username)) throw new ConnectionError(ConnectionError.Username, 'Invalid username');

    client.username = username;

    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.hasClientWithUsername(username)) {
        throw new ConnectionError(ConnectionError.Username, 'Client with provided username already exists');
      }
      if (!room.matchesVariableList(Object.keys(variables))) {
        throw new ConnectionError(ConnectionError.Incompatibility, 'Variable list does not match.');
      }
      client.setRoom(room);
      client.sendAllVariables();
    } else {
      client.setRoom(rooms.create(roomId, variables));
    }

    client.log('Joined room');
  }

  function performSet(variable, value) {
    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    // set() will perform validation on the variable name & value
    client.room.set(variable, value);

    client.room.getClients().forEach((otherClient) => {
      if (client !== otherClient) {
        otherClient.sendVariableSet(variable, value);
      }
    });
  }

  client.log('Connection opened');

  ws.on('message', (data) => {
    // Ignore data after the socket is closed
    if (ws.readyState !== ws.OPEN) {
      return;
    }

    try {
      if (rateLimiter.rateLimited()) {
        throw new ConnectionError(ConnectionError.TryAgainLater, 'Too many messages');
      }

      const message = parseMessage(data.toString());
      const kind = message.kind;

      switch (kind) {
        case 'handshake':
          performHandshake(message.id, message.username, message.variables);
          break;

        case 'set':
          performSet(message.var, message.value);
          break;

        default:
          throw new ConnectionError(ConnectionError.Error, 'Unknown message kind');
      }
    } catch (e) {
      client.error('Error handling connection', e);
      if (e instanceof ConnectionError) {
        client.close(e.code);
      } else {
        client.close(ConnectionError.Error);
      }
    }
  });

  ws.on('error', (error) => {
    client.error('** ERROR **', error);
    client.close(ConnectionError.Error);
  });

  ws.on('close', (code, reason) => {
    client.log('Connection closed: code', code, 'reason', reason);
    client.close(ConnectionError.Error);
  });

  ws.on('pong', () => {
    pingManager.handlePong(ws);
  });
});

wss.on('close', () => {
  logger.info('WebSocket closing');
  pingManager.stop();
  rooms.destroy();
});

module.exports = wss;
