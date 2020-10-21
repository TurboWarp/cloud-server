This is the protocol used by cloud-server.

It is based on the protocol used by Scratch 3, but not exactly the same. A client compatible with Scratch 3's protocol should be compatible with cloud-server.

## Overview

Clients connect to the server with a WebSocket connection. Messages are encoded as text frames containing JSON objects.

If the client sends something invalid or does an invalid operation, the connection will be closed.

## Handshake

When a client connects to the server, it should first send a handshake message containing project ID and username:

```json
{
  "method": "handshake",
  "project_id": "1234567",
  "user": "ExampleUsername"
}
```

If the handshake was unsuccessful, the connection will be closed. If it was successful, there will be no response.

## Sending updates

### set

Clients send variable updates to the server:

```json
{
  "method": "set",
  "name": "☁ variable",
  "value": "123"
}
```

If the variable value is invalid, the message will be ignored. If the variable does not exist, it will be created.

### create

Create is treated the same as set:

```json
{
  "method": "create",
  "name": "☁ variable",
  "value": "123"
}
```

### rename

Variables can be renamed:

```json
{
  "method": "rename",
  "name": "☁ variable",
  "new_name": "☁ other variable"
}
```

### delete

Variables can be deleted:

```json
{
  "method": "delete",
  "name": "☁ variable"
}
```

### user and project_id

All messages sent from Scratch 3 also contain the `user` and `project_id` properties. cloud-server ignores these properties, except on "handshake" messages, where they are required.

## Receiving updates

When cloud-server receives an update from a client, it will send a set message to every other client connected to that room:

```json
{
  "method": "set",
  "name": "☁ variable",
  "value": "456"
}
```

Multiple set messages may be sent in one message using newlines (`\n`)

## Status Codes

### Server -> Client

```
4000  Generic Error
  When the client violates the protocol.

4002  Username Error
  When there is a problem with the provided username that can be solved by changing the username.
  For example, if the name is too short, too long, already in use, or is deemed unsafe.

4003  Overloaded
  When the server or room is full and can not continue the connection.
```

### Client -> Server

```
4100  Username Change
  The client's username changed.
```
