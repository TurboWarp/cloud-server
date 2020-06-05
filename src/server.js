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
    if (client.room) throw new ConnectionError(ConnectionError.ProtocolError, 'Already has room');
    if (!validators.isValidRoomID(roomId)) throw new ConnectionError(ConnectionError.ProtocolError, 'Invalid room ID');
    if (!validators.isValidUsername(username)) throw new ConnectionError(ConnectionError.ProtocolError, 'Invalid username');
    if (!validators.isValidVariableMap(variables)) throw new ConnectionError(ConnectionError.ProtocolError, 'Invalid variable map');

    client.username = username;

    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.hasClientWithUsername(username)) {
        throw new ConnectionError(ConnectionError.PolicyViolation, 'Client with username already exists');
      }
      client.setRoom(room);
      client.sendAllVariables();
    } else {
      client.setRoom(rooms.create(roomId, variables));
    }

    client.log('Joined room');
  }

  function performSet(variable, value) {
    if (!client.room) throw new ConnectionError(ConnectionError.ProtocolError, 'No room setup yet');

    client.room.set(variable, value);
    client.room.getClients().forEach((client) => {
      client.sendVariableSet(variable, value);
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
          throw new ConnectionError(ConnectionError.ProtocolError, 'Unknown message type');
      }
    } catch (e) {
      client.log('Error handling connection', e);
      if (e instanceof ConnectionError) {
        client.close(e.code);
      } else {
        client.close(ConnectionError.InternalError);
      }
    }
  });

  ws.on('error', (error) => {
    client.log('** ERROR **', error);
    client.close(ConnectionError.InternalError);
  });

  ws.on('close', (code, reason) => {
    client.log('Connection closed. code', code, 'reason', reason);
    client.close(ConnectionError.InternalError);
  });

  ws.on('pong', () => {
    pingManager.handlePong(ws);
  });
});

wss.on('close', () => {
  logger.info('Server closing');
  pingManager.stop();
  rooms.destroy();
});

module.exports = wss;
