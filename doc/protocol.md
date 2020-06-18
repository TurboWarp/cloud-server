This is the protocol used by cloud-server.

This is not compatible with the protocol used by Scratch 3.

# Shared Protocol

All messages send between the client and server use JSON to encode the message. All properties must be defined. Additional properties are ignored.

All messages being sent either way must conform to this base interface:

```ts
interface Message {
  // The type of message being sent
  kind: string;
}
```

Different types of messages are defined below

# Server -> Client Protocol

The server to client protocol supports sending multiple messages in a single data frame.
To do this, each JSON message is separated by a newline (\n). This is *not* a JSON list.
Messages should be processed in the order they were received.

## set

set messages change a variable.

```ts
interface SetMessage extends Message {
  kind: 'set';
  // The name of the variable.
  variable: string;
  // The new value of the variable.
  value: string;
}
```

## Status Codes

These are the status codes that the server sends to the client when closing a connection. The reason field is not used.

```
1xxx  Protocol Errors
  WebSocket errors.
  No special meaning is assigned to these status codes.

4000  Generic Error
  When the client violates the protocol.

4001  Incompatibility
  When the connection is unable to continue due to an unfixable compatibility issue.
  For example, when the variables provided by the client do not match those in the room.

4002  Username Error
  When there is a problem with the provided username that can be solved by changing the username.
  For example, if the name is too short, too long, already in use, or is deemed unsafe.

4003  Overloaded
  When the server or room is full and can not continue the connection.

4004  Try Again Later
  When the client has done an operation that is invalid at this time, but would have been valid if sent later.
  For example, when the client sends too many messages in a given period of time.
```

# Client -> Server Protocol

All messages sent to the server are JSON-encoded. There must be exactly one JSON object per message.

## handshake

'handshake' messages prepare the connection.
The first message from the client *must* be a handshake message.

```ts
interface HandshakeMessage extends Message {
  kind: 'handshake';
  // The ID of the room the client would like to join or create.
  room: string;
  // The client's username.
  username: string;
  // Variables known to the client, and their value.
  // This is used for:
  //  - setting the initial values of variables in a room
  //  - disconnecting the client (by Incompatibility) if the variable names provided do not match what the room has
  variables: { [s: string]: string; };
}
```

## set
'set' messages change a variable globally.
After a set is received, the server will inform all other connected clients of the change with a 'set' message.
The server may silently ignore this message, or disconnect the client if it is invalid.

```ts
interface SetMessage extends Message {
  kind: 'set';
  // The name of the variable
  variable: string;
  // The new value of the variable
  value: string;
}
```

## Status Codes

These are the status codes that a client sends to the server when closing a connection. The reason field is not used. These values are only used for logging.

```
1000  Normal Closure
  The WebSocket has closed because the intended purpose has been served.

1001  Going Away
  The connection was abruptly closed by eg. the user navigating to a different page.

4100  Username Change
  The client's username changed.
```
