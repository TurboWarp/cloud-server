const http = require('http');
const process = require('process');

const logger = require('./logger');
const config = require('./config');

const wss = require('./server');
const server = http.createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});
 
server.listen(config.port, function() {
  logger.info('Server started on port: ' + config.port);
});

server.on('close', function() {
  logger.info('Server closing');
  wss.close();
});

function exit() {
  server.close();
}

process.on('exit', exit);
process.on('SIGINT', exit);
process.on('SIGTERM', exit);
