const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');

const logger = require('./logger');
const config = require('./config');
const wss = require('./server');

// We serve static files over HTTP
const serve = serveStatic('public');
const server = http.createServer(function handler(req, res) {
  // @ts-ignore
  serve(req, res, finalhandler(req, res));
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
