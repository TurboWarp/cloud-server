const WebSocket = require('ws');
const Room = require('./Room');
const RoomList = require('./RoomList');
const checkers = require('./checkers');

const wss = new WebSocket.Server({
  port: 8082,
});

const rooms = new RoomList();

/**
 * Get the remote IP address of a request.
 * @param {import('http').IncomingMessage} req
 */
function getIP(req) {
  return req.socket.remoteAddress;
}

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
  const connectionData = {
    /** @type {string} */
    ip: getIP(req),

    /** @type {boolean} */
    isConnected: false,

    /** @type {string} */
    username: '?',

    /** @type {?Room} */
    room: null,
  };

  function log(...args) {
    console.log(`[${connectionData.ip} "${connectionData.username}"]`, ...args);
  }

  function send(data) {
    ws.send(JSON.stringify(data));
  }

  function sendAllVariables() {
    connectionData.room.getAllVariables().forEach((value, name) => {
      send({ kind: 'set_var', var: name, value: value })
    });
  }

  function performConnect(roomId, username, variables) {
    if (connectionData.isConnected) throw new Error('Already connected');
    if (!checkers.checkRoomID(roomId)) throw new Error('Invalid room ID');
    if (!checkers.checkUsername(username)) throw new Error('Invalid username');
    if (!checkers.checkVariableMap(variables)) throw new Error('Invalid variable map');

    connectionData.username = username;

    if (rooms.has(roomId)) {
      connectionData.room = rooms.get(roomId);
      log('Joined existing room: ' + roomId);
      sendAllVariables();
    } else {
      connectionData.room = rooms.create(roomId, variables);
      log('Created new room: ' + roomId);
    }
    connectionData.room.addClient(ws);

    connectionData.isConnected = true;
  }

  function performSet(variable, value) {
    if (!connectionData.isConnected) throw new Error('No room setup yet');
    connectionData.room.set(variable, value);
    connectionData.room.getClients().forEach((client) => {
      if (client !== ws) {
        send({ kind: 'set_var', var: variable, value: value });
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
      send({ kind: 'error', reason: 'unknown' });
      ws.close();
    }
  });

  ws.on('close', () => {
    log('Connection closed');
    if (connectionData.isConnected) {
      connectionData.isConnected = false;
      connectionData.room.removeClient(ws);
      connectionData.room = null;
    }
  });
});
