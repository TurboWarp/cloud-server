# cloud-server

This is a cloud data server for [forkphorus](https://forkphorus.github.io/).

## This is not

 - a reimplementation of the Scratch cloud data server (protocols have several differences)
 - a "permanent" or "long term" data server, all "rooms" are removed when they are empty for a while

## Setup

Needs Node.js and npm.

```
git clone https://github.com/forkphorus/cloud-server
cd cloud-server
npm install
npm start
```

By default the server is listening on ws://localhost:9080/. To change the port or enable wss://, read below.

To enable use of this server in forkphorus, you can use the `chost` URL parameter, for example: https://forkphorus.github.io/?chost=ws://localhost:9080/

## Configuration

HTTP requests are served static files from the public directory.

Change the PORT environment variable (or PORT in src/config.js) to change the port.

### Reverse proxy

In a production setup, you should use a reverse proxy like nginx.

In this setup cloud-server should listen on a high port like 9080, and your proxy will listen on a low port (80 or 443 for ws:// and wss:// respectively) and forward requests to the cloud server. You should make sure that the port that cloud-server is listening on is not forwarded.

Set the TRUST_PROXY environment variable (or TRUST_PROXY in src/config.js) to `true` to make the server use the correct IP addresses.

Here's a sample nginx config that uses SSL to secure the connection:

```cfg
server {
        listen 443 ssl http2; # or listen 80; if not using ssl
        listen [::]:443 ssl http2; # or listen [::]:80; if not using ssl
        ssl_certificate /path/to/your/ssl/cert; # remove if not using ssl
        ssl_certificate_key /path/to/your/ssl/key; # remove if not using ssl
        server_name clouddata.yourdomain.com; # update to your domain name
        location / {
                proxy_pass http://127.0.0.1:9080; # change port for your setup
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```
