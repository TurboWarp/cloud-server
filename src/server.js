const WebSocket = require('ws');

const Client = require('./Client');
const RoomList = require('./RoomList');
const ConnectionError = require('./ConnectionError');
const ConnectionManager = require('./ConnectionManager');
const validators = require('./validators');
const logger = require('./logger');
const naughty = require('./naughty');
const config = require('./config');

const wss = new WebSocket.Server({
  noServer: true, // we setup the server on our own
  clientTracking: false, // we do our own tracking
  maxPayload: 1024 * 1024, // 1 MB should be plenty
  perMessageDeflate: config.perMessageDeflate,
});

const rooms = new RoomList();
rooms.enableLogging = true;
rooms.startJanitor();

const connectionManager = new ConnectionManager();
connectionManager.start();

logger.info(`Naughty word detector has ${naughty.getTotalBlockedPhrases()} blocked phrases from ${naughty.getTotalFilterLists()} filters`);

/**
 * @param {unknown} data
 * @returns {boolean}
 */
function isValidMessage(data) {
  // @ts-ignore
  return !!data && typeof data === 'object' && typeof data.method === 'string';
}

/**
 * Parse WebSocket message data.
 * @param {string} data Message data
 * @returns {object}
 */
function parseMessage(data) {
  const message = JSON.parse(data);
  if (!isValidMessage(message)) {
    throw new Error('Invalid message');
  }
  return message;
}

/**
 * Create a "set" message to send to clients to set a variable.
 * @param {string} name The name of the variable.
 * @param {string|number} value The variable's new value.
 * @returns {string} The stringified JSON of the message.
 */
function createSetMessage(name, value) {
  return JSON.stringify({
    method: 'set',
    name: name,
    value: value,
  });
}

wss.on('connection', (ws, req) => {
  const client = new Client(ws, req);

  connectionManager.handleConnect(client);

  function performHandshake(roomId, username) {
    if (client.room) throw new ConnectionError(ConnectionError.Error, 'Already performed handshake');
    if (!validators.isValidRoomID(roomId)) throw new ConnectionError(ConnectionError.Error, 'Invalid room ID: ' + roomId);
    if (!validators.isValidUsername(username)) throw new ConnectionError(ConnectionError.Username, 'Invalid username: '  + username);

    client.username = username;

    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      client.setRoom(room);

      // Send the data of all the variables in the room to the client.
      // This is done in one message by separating each "set" with a newline.
      /** @type {string[]} */
      const messages = [];
      room.getAllVariables().forEach((value, name) => {
        messages.push(createSetMessage(name, value));
      });
      if (messages.length > 0) {
        client.send(messages.join('\n'));
      }
    } else {
      client.setRoom(rooms.create(roomId));
    }

    client.log('Joined room');
  }

  function performCreate(variable, value) {
    performSet(variable, value);
  }

  function performDelete(variable) {
    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    client.room.delete(variable);
  }

  function performRename(oldName, newName) {
    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    if (!validators.isValidVariableValue(newName)) {
      throw new Error(`Invalid variable name: ${newName}`);
    }

    // get throws if old name does not exist
    const value = client.room.get(oldName);
    client.room.delete(oldName);
    client.room.set(newName, value);
  }

  function performSet(variable, value) {
    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    if (!validators.isValidVariableValue(value)) {
      // silently ignore
      logger.debug('Ignoring invalid value: ' + value);
      return;
    }

    if (client.room.has(variable)) {
      client.room.set(variable, value);
    } else {
      client.room.create(variable, value);
    }

    // Generate the send message only when a client will actually hear it.
    const clients = client.room.getClients();
    if (clients.length > 1) {
      const message = createSetMessage(variable, value);
      for (const otherClient of clients) {
        if (client !== otherClient) {
          otherClient.send(message);
        }
      }
    }
  }

  function processMessage(data) {
    const message = parseMessage(data.toString());
    const method = message.method;

    switch (method) {
      case 'handshake':
        performHandshake(message.project_id, message.user);
        break;

      case 'set':
        performSet(message.name, message.value);
        break;

      case 'create':
        performCreate(message.name, message.value);
        break;

      case 'delete':
        performDelete(message.name);
        break;

      case 'rename':
        performRename(message.name, message.new_name);
        break;

      default:
        throw new ConnectionError(ConnectionError.Error, 'Unknown message method: ' + method);
    }
  }

  client.log('Connection opened');

  ws.on('message', (data) => {
    // Ignore data after the socket is closed
    if (ws.readyState !== ws.OPEN) {
      return;
    }

    try {
      processMessage(data);
    } catch (error) {
      client.error('Error handling connection: ' + error);
      if (error instanceof ConnectionError) {
        client.close(error.code);
      } else {
        client.close(ConnectionError.Error);
      }
    }
  });

  ws.on('error', (error) => {
    client.error('** ERROR ** ' + error);
    client.close(ConnectionError.Error);
  });

  ws.on('close', (code) => {
    connectionManager.handleDisconnect(client);
    client.log(`Connection closed: code ${code}`);
    client.close(ConnectionError.Error);
  });

  ws.on('pong', () => {
    connectionManager.handlePong(client);
  });
});

wss.on('close', () => {
  logger.info('WebSocket server closing');
  connectionManager.stop();
  rooms.destroy();
});

module.exports = wss;
