# Shared Protocol

All messages send between the client and server (bi-directional) are JSON objects.

All messages being sent either way must conform to this interface:

```ts
interface Message {
  // The type of message being sent
  kind: string;
}
```

Different types of messages are defined below

# Server -> Client Protocol

All messages sent to the client are JSON-encoded.
Multiple messages may sent in a single data frame.
If this is the case, each JSON object will be separated by a newline (\n).
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

# Client -> Server Protocol

All messages sent to the server are JSON-encoded.
There must be exactly one JSON object per message.

All messages must conform to:

```ts
interface Message {
  kind: string;
}
```

## handshake

'handshake' messages prepare the connection.
The first message from the client *must* be a handshake message.

```ts
interface HandshakeMessage {
  kind: 'handshake'
  // The ID of the room the client would like to join or create.
  room: string;
  // The client's username.
  username: string;
  // Variables known to the client, and their value.
  variables: { [s: string]: string; };
}
```

## set
'set' messages change a variable globally.
After a set is received, the server will inform all other connected clients of the change with a 'set' message.
The server may silently ignore this message, or disconnect the client if it is invalid.

```ts
interface SetMessage {
  kind: 'set';
  // The name of the variable
  variable: string;
  // The new value of the variable
  value: string;
}
```

# Status Codes

```
1xxx  Protocol Errors
  Autoreconnect: yes

4000  Generic error
  When the client violates the protocol.
  For example, if you send a 'set' before a 'handshake', or try to change the value of variables that don't exist.
  Autoreconnect: yes

4001  Incompatibility
  When the connection is unable to continue due to a compatibility issue.
  For example, when the variables provided by the client do not match those in the room.
  Autoreconnect: no

4002  Username error
  When there is a problem with the provided username that can be solved by changing the username.
  For example, if the name is too short, too long, already in use, or is deemed unsafe.
  Autoreconnect: no

4003  Overloaded
  When the server is overloaded and refuses to accept new connections.
  Autoreconnect: yes

4004  Try Again Later
  When the client has done something wrong that has caused them to be kicked.
  The client is free to try again.
  Autoreconnect: yes
```