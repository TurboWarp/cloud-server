/*
Example client for Node.js

You must first update the USER_AGENT variable below.

Dependencies:
npm i ws

Use setVariable("☁ variable", "1") to set variables.
Use getVariable("☁ variable") to read variables.
*/

const WebSocket = require('ws');

// You are required to provide a valid User-Agent header. Please include:
//  - contact information (Scratch profile, email, GitHub issues page, etc.)
//  - name of bot library and version (if applicable)
// For example: my-cool-cloud-variable-bot v2.0 by https://scratch.mit.edu/users/TestMuffin
// See https://docs.turbowarp.org/cloud-variables#advanced for more information.
const USER_AGENT = '';

// Removing this if statement will not make your bot work. The user-agent is validated server-side.
if (!USER_AGENT) {
  throw new Error('You are required to provide a valid User-Agent header! See `const USER_AGENT = ...` and the comment above it near the start of this file.');
}

const ws = new WebSocket("wss://clouddata.turbowarp.org", {
  headers: {
    'user-agent': USER_AGENT
  }
});
const variables = {};

function setVariable(name, value) {
  console.log(`Setting variable: ${name} = ${value}`);
  variables[name] = value;
  ws.send(JSON.stringify({
    method: "set",
    name,
    value
  }));
}

function getVariable(name) {
  return variables[name];
}

ws.onopen = () => {
  console.log("Performing handshake");

  // Tell the server which project you want to connect to.
  ws.send(JSON.stringify({
    method: "handshake",
    project_id: "1234567",
    user: "ExampleUsername"
  }));

  // To set a variable:
  // You must do this AFTER handshake
  setVariable("☁ variable", "1");

  // Use setInterval to constantly update a variable
  setInterval(() => {
    setVariable("☁ variable", Math.random());
  }, 1000);
};

ws.onmessage = (event) => {
  // Process updates from the server.
  for (const message of event.data.split("\n")) {
    const obj = JSON.parse(message);
    if (obj.method === "set") {
      variables[obj.name] = obj.value;
      console.log(`Server set variable: ${obj.name} = ${obj.value}`);
    }
  }
};

ws.onclose = () => {
  console.log("Server closed connection");
};

ws.onerror = () => {
  console.log("Error!");
};
