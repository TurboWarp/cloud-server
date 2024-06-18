const http = require('http');
const fs = require('fs');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');

const logger = require('./logger');
const config = require('./config');
const wss = require('./server');

// We serve static files over HTTP
const serve = serveStatic('public');
const server = http.createServer(function handler(req, res) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
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

const port = config.port;
server.listen(port, function() {
  // Update permissions of unix sockets
  if (typeof port === 'string' && port.startsWith('/') && config.unixSocketPermissions >= 0) {
    fs.chmod(port, config.unixSocketPermissions, function(err) {
      if (err) {
        logger.error('could not chmod unix socket: ' + err);
        process.exit(1);
      }
    });
  }
  logger.info('Server started on port: ' + port);
});
