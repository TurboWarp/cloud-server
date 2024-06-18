const WebSocket = require('ws');

const Client = require('./Client');
const RoomList = require('./RoomList');
const ConnectionError = require('./ConnectionError');
const ConnectionManager = require('./ConnectionManager');
const validators = require('./validators');
const usernameUtils = require('./username');
const isProjectBlocked = require('./room-filters');
const logger = require('./logger');
const naughty = require('./naughty');
const config = require('./config');
const stats = require('./stats');

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

/** @type {Map<Client, [string, string | number][]>} */
const bufferedUpdates = new Map();
function sendBuffered() {
  if (bufferedUpdates.size === 0) {
    return;
  }
  for (const [client, updates] of bufferedUpdates.entries()) {
    const dataToSend = updates
      .map(([name, value]) => createSetMessage(name, value))
      .join('\n');
    stats.recordBytesSent(client, dataToSend.length);
    client.send(dataToSend);
  }
  bufferedUpdates.clear();
}

function sendSetMessageToClient(client, name, value) {
  if (config.bufferSends) {
    let clientMessages = bufferedUpdates.get(client);
    if (!clientMessages) {
      clientMessages = [];
      bufferedUpdates.set(client, clientMessages);
    }

    // If there is already a buffered update for this variable, replace it
    for (const message of clientMessages) {
      if (message[0] === name) {
        message[1] = value;
        return;
      }
    }

    // Otherwise, add a new buffered update
    clientMessages.push([name, value]);
  } else {
    const dataToSend = createSetMessage(name, value);
    stats.recordBytesSent(client, dataToSend.length);
    client.send(dataToSend);
  }
}

if (config.bufferSends) {
  setInterval(sendBuffered, 1000 / config.bufferSends);
}

wss.on('connection', (ws, req) => {
  // We know of at least one library that sends Scratch session tokens to us for no reason.
  // As this is putting accounts at unnecessary risk, refuse to accept the connection until they fix their code.
  // It's not important for us to really parse cookies, we just want it to be hard to do the wrong thing.
  if (req.headers.cookie && req.headers.cookie.startsWith('scratchsessionsid=')) {
    logger.info('A connection closed for security reasons.');
    // Sending an invalid message to the client should hopefully trigger a warning somewhere for them to see.
    ws.send('The cloud data library you are using is putting your Scratch account at risk by sending us your login token for no reason. Change your Scratch password immediately, then contact the maintainers of that library for further information. This connection is being refused to protect your security.');
    ws.close(4005);
    return;
  }

  if (!req.headers['user-agent']) {
    logger.info('A connection was closed for lacking a valid user-agent.');
    ws.send('Please provide a valid User-Agent header as required by https://docs.turbowarp.org/cloud-variables#advanced. If you use a cloud variable library, contact the author to find out how to do that.');
    ws.close(4006);
    return;
  }

  const client = new Client(ws, req);

  let isHandshaking = false;
  let processAfterHandshakeQueue = [];

  connectionManager.handleConnect(client);

  async function performHandshake(roomId, username) {
    if (client.room) throw new ConnectionError(ConnectionError.Error, 'Already performed handshake');
    if (isHandshaking) throw new ConnectionError(ConnectionError.Error, 'Already handshaking');
    isHandshaking = true;
    if (!validators.isValidRoomID(roomId)) {
      const roomToLog = `${roomId}`.substr(0, 100);
      throw new ConnectionError(ConnectionError.Error, 'Invalid room ID: ' + roomToLog);
    }
    if (isProjectBlocked(roomId)) {
      throw new ConnectionError(ConnectionError.ProjectUnavailable, 'Project blocked: ' + roomId);
    }
    if (!await usernameUtils.isValidUsername(username)) {
      const usernameToLog = `${username}`.substr(0, 100);
      throw new ConnectionError(ConnectionError.Username, 'Invalid username: '  + usernameToLog);
    }
    if (!client.ws || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    client.setUsername(username);

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

    // @ts-expect-error
    client.log(`Joined room (peers: ${client.room.getClients().length})`);

    stats.recordConnection(client);

    isHandshaking = false;
    for (const data of processAfterHandshakeQueue) {
      processWithErrorHandling(data);
    }
    processAfterHandshakeQueue.length = 0;
  }

  function performCreate(variable, value) {
    performSet(variable, value);
  }

  function performDelete(variable) {
    if (!config.enableDelete) {
      return;
    }

    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    client.room.delete(variable);
  }

  function performRename(oldName, newName) {
    if (!config.enableRename) {
      return;
    }

    if (!client.room) throw new ConnectionError(ConnectionError.Error, 'No room setup yet');

    if (!validators.isValidVariableName(newName)) {
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

    const clients = client.room.getClients();
    for (const otherClient of clients) {
      if (client !== otherClient) {
        sendSetMessageToClient(otherClient, variable, value);
      }
    }
  }

  async function processMessage(data) {
    const message = parseMessage(data.toString());
    const method = message.method;

    if (method === 'handshake') {
      await performHandshake('' + message.project_id, message.user)
      return;
    }

    if (isHandshaking) {
      processAfterHandshakeQueue.push(data);
      return;
    }

    switch (method) {
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

  async function processWithErrorHandling(data) {
    try {
      stats.recordBytesReceived(client, data.length);
      await processMessage(data);
    } catch (error) {
      client.error('Error handling connection: ' + error);
      if (error instanceof ConnectionError) {
        client.close(error.code);
      } else {
        client.close(ConnectionError.Error);
      }
    }
  }

  client.log('Connection opened');

  ws.on('message', (data, isBinary) => {
    // Ignore data after the socket is closed
    if (ws.readyState !== ws.OPEN) {
      return;
    }
    if (isBinary) {
      return;
    }

    processWithErrorHandling(data);
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
