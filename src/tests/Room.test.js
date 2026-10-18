const {test} = require('node:test');
const assert = require('node:assert/strict');
const Room = require('../Room');
const Client = require('../Client');

test('constructor', () => {
  const room = new Room('1234');
  assert.strictEqual(room.id, '1234');
});

test('clients', () => {
  const room = new Room('1234');
  const client1 = new Client(null, null);
  const client2 = new Client(null, null);
  room.addClient(client1);
  room.addClient(client2);
  assert.throws(() => room.addClient(client1));
  assert.throws(() => room.addClient(client2));
  assert.strictEqual(room.getClients().length, 2);
  assert.ok(room.getClients().includes(client1));
  assert.ok(room.getClients().includes(client2));
  room.removeClient(client1);
  assert.strictEqual(room.getClients().length, 1);
  assert.ok(!room.getClients().includes(client1));
  assert.ok(room.getClients().includes(client2));
  room.removeClient(client2);
  assert.strictEqual(room.getClients().length, 0);
  assert.ok(!room.getClients().includes(client1));
  assert.ok(!room.getClients().includes(client2));
  assert.throws(() => room.removeClient(client1));
  assert.throws(() => room.removeClient(client2));
});

test('create', () => {
  const room = new Room('1234');
  room.create('☁ variable', '123');
  assert.throws(() => room.create('☁ variable', '123'));
});

test('delete', () => {
  const room = new Room('1234');
  assert.throws(() => room.delete('☁ variable'));
  room.create('☁ variable', '123');
  assert.strictEqual(room.has('☁ variable'), true);
  room.delete('☁ variable');
  assert.strictEqual(room.has('☁ variable'), false);
});

test('maxVariables', () => {
  const room = new Room('1234');
  for (var i = 0; i < room.maxVariables; i++) {
    room.create('☁ variable' + i, '1234');
  }
  assert.throws(() => room.create('☁ too many exist', '1234'));
});

test('has', () => {
  const room = new Room('1234');
  assert.strictEqual(room.has('☁ foo'), false);
  assert.strictEqual(room.has('☁ bar'), false);
  room.create('☁ foo', '123');
  assert.strictEqual(room.has('☁ foo'), true);
  assert.strictEqual(room.has('☁ bar'), false);
  room.create('☁ bar', '123');
  assert.strictEqual(room.has('☁ foo'), true);
  assert.strictEqual(room.has('☁ bar'), true);
});

test('set', () => {
  const room = new Room('1234');
  assert.throws(() => room.set('☁ doesnt exist', '123'));
  assert.throws(() => room.set('☁ foo', 'invalid value'));
  assert.throws(() => room.set('invalid name', '123'));
  room.create('☁ foo', '123');
  room.create('☁ bar', '456');
  const vars = room.getAllVariables();
  assert.strictEqual(vars.size, 2);
  assert.strictEqual(vars.get('☁ foo'), '123');
  assert.strictEqual(vars.get('☁ bar'), '456');
  room.set('☁ foo', '789');
  room.set('☁ bar', '123');
  const vars2 = room.getAllVariables();
  assert.strictEqual(vars2.size, 2);
  assert.strictEqual(vars2.get('☁ foo'), '789');
  assert.strictEqual(vars2.get('☁ bar'), '123');
});

test('get', () => {
  const room = new Room('1234');
  assert.throws(() => room.get('☁ foo'));
  room.create('☁ foo', '1234');
  assert.strictEqual(room.get('☁ foo'), '1234');
});

test('maxClients', () => {
  const room = new Room('1234');
  room.maxClients = 10;
  for (var i = 0; i < room.maxClients; i++) {
    room.addClient(new Client(null, null));
  }
  assert.throws(() => room.addClient(new Client(null, null)));
});
