const http = require('http');
const client = require('@prometheus-io/client');
const logger = require('./logger');

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});

const clients = new client.Gauge({
  name: 'cloud_clients',
  help: 'Connected clients'
});

const rooms = new client.Gauge({
  name: 'cloud_rooms',
  help: 'Rooms'
});

const connections = new client.Counter({
  name: 'cloud_connections_total',
  help: 'Connections'
});

const refused = new client.Counter({
  name: 'cloud_connections_refused_total',
  help: 'Refused connections',
  labelNames: ['reason']
});

const errors = new client.Counter({
  name: 'cloud_errors_total',
  help: 'Connection errors',
  labelNames: ['code']
});

const timeouts = new client.Counter({
  name: 'cloud_timeouts_total',
  help: 'Timed out connections',
  labelNames: ['reason']
});

const messages = new client.Counter({
  name: 'cloud_messages_total',
  help: 'Messages received',
  labelNames: ['method']
});

const forwarded = new client.Counter({
  name: 'cloud_forwarded_sets_total',
  help: 'Variable sets forwarded to other clients'
});

// Start counters at 0 instead of blank
refused.inc({
  reason: 'insecure'
}, 0);
for (const code of [4000, 4002, 4003, 'socket_error']) {
  errors.inc({code}, 0);
}
for (const reason of ['no pong', 'no handshake']) {
  timeouts.inc({reason}, 0);
}
for (const method of ['handshake', 'set', 'create', 'delete', 'rename']) {
  messages.inc({method}, 0);
}

function getLowCardinalityPath(req) {
  // Explicit route name
  if (req.metricsRoute) {
    return req.metricsRoute;
  }
  // Fallback - don't let 404 explode cardinality
  return 'other';
}

function middleware(req, res, next) {
  const end = httpDuration.startTimer();
  res.on('close', () => {
    try {
      const labels = {
        method: req.method,
        route: getLowCardinalityPath(req),
        status: res.writableFinished ? res.statusCode : 'aborted'
      };
      httpRequests.inc(labels);
      end(labels);
    } catch (error) {
      logger.error('Metrics error: ' + error);
    }
  });
  next();
}

function listen() {
  if (!process.env.METRICS_PORT) {
    return;
  }

  const port = +process.env.METRICS_PORT;
  client.collectDefaultMetrics();

  const metricsServer = http.createServer((_req, res) => {
    client.register.metrics()
      .then((body) => {
        res.setHeader('Content-Type', client.register.contentType);
        res.end(body);
      })
      .catch((error) => {
        logger.error('' + ((error && error.stack) || error));
        res.statusCode = 500;
        res.end();
      });
  });

  metricsServer.listen(port, '127.0.0.1', () => {
    logger.info('Metrics on port: ' + port);
  });
}

module.exports = {
  clients,
  rooms,
  connections,
  refused,
  errors,
  timeouts,
  messages,
  forwarded,
  middleware,
  listen
};
