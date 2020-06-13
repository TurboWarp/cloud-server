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

## Configuration

HTTP requests are served static files from the public directory.

Change the PORT environment variable (or PORT in src/config.js) to change the port.

If you use a proxy such as nginx set the TRUST_PROXY environment variable (or TRUST_PROXY in src/config.js) to `true` to make log messages include the correct IP addresses.
