/*
Example client for Node.js

Dependencies:
npm i ws

Use setVariable("☁ variable", "1") to set variables.
Use getVariable("☁ variable") to read variables.
*/

const WebSocket = require('ws');

const ws = new WebSocket("wss://clouddata.turbowarp.org");
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
