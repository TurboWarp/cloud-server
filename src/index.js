const http = require('http');

const logger = require('./logger');
const wss = require('./server');
const server = http.createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});
 
server.listen(8082, function() {
  logger.info('Server started.');
});
