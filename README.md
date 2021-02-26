# cloud-server

A cloud data server for Scratch 3. Used by [forkphorus](https://forkphorus.github.io/) and [TurboWarp](https://turbowarp.org/).

It uses a protocol very similar to Scratch 3's cloud variable protocol. See doc/protocol.md for further details.

## Restrictions

This server does not implement long term variable storage. All data is stored only in memory (never on disk) and are removed promptly when rooms are emptied or the server restarts.

This server also does not implement history logs.

## Setup

Needs Node.js and npm.

```
git clone https://github.com/TurboWarp/cloud-server
cd cloud-server
npm install
npm start
```

By default the server is listening on ws://localhost:9080/. To change the port or enable wss://, read below.

To use a local cloud variable server in forkphorus, you can use the `chost` URL parameter, for example: https://forkphorus.github.io/?chost=ws://localhost:9080/

You can do a similar thing in TurboWarp with the `cloud_host` URL parameter: https://turbowarp.org/?cloud_host=ws://localhost:9080/

## Configuration

HTTP requests are served static files in the `public` directory.

### src/config.js

src/config.js is the configuration file for cloud-server.

The `port` property (or the `PORT` environment variable) configures the port to listen on.

On unix-like systems, port can also be a path to a unix socket. By default cloud-server will set the permission of unix sockets to `777`. This can be configured with `unixSocketPermissions`.

If you use a reverse proxy, set the `trustProxy` property (or `TRUST_PROXY` environment variable) to `true` so that logs contain the user's IP address instead of your proxy's.

Set `anonymizeAddresses` to `true` if you want IP addresses to be not be logged.

Set `perMessageDeflate` to an object to enable "permessage-deflate", which uses compression to reduce the bandwidth of data transfers. This can lead to poor performance and catastrophic memory fragmentation on Linux (https://github.com/nodejs/node/issues/8871). See here for options: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback (look for `perMessageDeflate`)

You can configure logging with the `logging` property of src/config.js. By default cloud-server logs to stdout and to files in the `logs` folder. stdout logging can be disabled by setting `logging.console` to false. File logging is configured with `logging.rotation`, see here for options: https://github.com/winstonjs/winston-daily-rotate-file#options. Set to false to disable.

### Production setup

cloud-server is considered production ready as it has been in use in a production environment for months without issue. That said, there is no warranty. If a bug in cloud-server results in you losing millions of dollars, tough luck. (see LICENSE for more details)

You should probably be using a reverse proxy such as nginx or caddy in a production environment.

In this setup cloud-server should listen on a high port such as 9080 (or even a unix socket), and your proxy will handle HTTP(S) connections and forward requests to the cloud server. You should make sure that the port that cloud-server is listening on is not open.

Here's a sample nginx config that uses SSL to secure the connection:

```cfg
server {
        listen 443 ssl http2;
        ssl_certificate /path/to/your/ssl/cert;
        ssl_certificate_key /path/to/your/ssl/key;
        server_name clouddata.yourdomain.com;
        location / {
                proxy_pass http://127.0.0.1:9080;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```

You may also want to make a systemd service file for the server, but this is left as an exercise to the reader.
