# cloud-server

A configurable cloud data server for Scratch 3.

Used by:

 - [TurboWarp](https://turbowarp.org/)
 - [forkphorus](https://forkphorus.github.io/)

## Setup

Requires Node.js and npm.

```
git clone https://github.com/TurboWarp/cloud-server
cd cloud-server
npm ci
npm start
```

By default, the server listens on ws://localhost:9080/. This is good enough for local testing, but if you want to deploy this on a real website, you will probably need to setup a secure wss://.

To test locally in TurboWarp, use the `cloud_host` URL parameter: https://turbowarp.org/?cloud_host=ws://localhost:9080/

To test locally in forkphorus, uses the `chost` URL parameter: https://forkphorus.github.io/?chost=ws://localhost:9080/

## Configuration

HTTP requests are served static files in the `public` directory.

Edit src/config.js for additional settings. There's a lot of stuff in there and it's all documented. We will highlight a couple important settings below:

### Database

By default, cloud-server does not use a database, so any variables will be lost when no one has been in a project for a short while or the server restarts.

In src/config.js, you can change the `database` option to `'sqlite'` to instead persist variables in an sqlite database. Variables are saved when a room is automatically deleted for being empty and on a periodic schedule set by `TODO`. If the server dies unexpectedly, anything that wasn't yet saved will not be saved.

## Production setup

For this section, we will assume you have complete access to a Linux machine as this is the ideal environment for cloud-server.

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
