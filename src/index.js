const http = require('http');
const process = require('process');
const static = require('node-static');

const logger = require('./logger');
const config = require('./config');

const wss = require('./server');
const fileServer = new static.Server('./public', {
  serverInfo: 'https://github.com/forkphorus/cloud-server',
});
const server = http.createServer(function(req, res) {
  // Serve static files over HTTP
  req.addListener('end', function() {
    fileServer.serve(req, res);
  }).resume();
});

server.on('upgrade', function upgrade(request, socket, head) {
  // Forward these requests to the WebSocket server.
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

server.on('close', function() {
  // TODO: this code never seems to actually run
  logger.info('Server closing');
  wss.close();
});
 
server.listen(config.port, function() {
  logger.info('Server started on port: ' + config.port);
});
