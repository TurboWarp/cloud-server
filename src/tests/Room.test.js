const Room = require('../Room');
const Client = require('../Client');

jest.mock('../Client.js');

test('constructor', () => {
  const room = new Room('1234');
  expect(room.id).toBe('1234');
});

test('clients', () => {
  const room = new Room('1234');
  const client1 = new Client(null, null);
  const client2 = new Client(null, null);
  room.addClient(client1);
  room.addClient(client2);
  expect(() => room.addClient(client1)).toThrow();
  expect(() => room.addClient(client2)).toThrow();
  expect(room.getClients()).toHaveLength(2);
  expect(room.getClients()).toContain(client1);
  expect(room.getClients()).toContain(client2);
  room.removeClient(client1);
  expect(room.getClients()).toHaveLength(1);
  expect(room.getClients()).not.toContain(client1);
  expect(room.getClients()).toContain(client2);
  room.removeClient(client2);
  expect(room.getClients()).toHaveLength(0);
  expect(room.getClients()).not.toContain(client1);
  expect(room.getClients()).not.toContain(client2);
  expect(() => room.removeClient(client1)).toThrow();
  expect(() => room.removeClient(client2)).toThrow();
});

test('createVar', () => {
  const room = new Room('1234');
  expect(() => room.createVar('invalid name', '123')).toThrow();
  expect(() => room.createVar('☁ name', 'invalid value')).toThrow();
  room.createVar('☁ variable', '123');
  expect(() => room.createVar('☁ variable', '123')).toThrow();
});

test('variable count limit', () => {
  const room = new Room('1234');
  for (var i = 0; i < room.maxVariables; i++) {
    room.createVar('☁ variable' + i, '1234');
  }
  expect(() => room.createVar('☁ too many exist', '1234')).toThrow();
});

test('set', () => {
  const room = new Room('1234');
  expect(() => room.set('☁ doesnt exist', '123')).toThrow();
  expect(() => room.set('☁ foo', 'invalid value')).toThrow();
  expect(() => room.set('invalid name', '123')).toThrow();
  room.createVar('☁ foo', '123');
  room.createVar('☁ bar', '456');
  const vars = room.getAllVariables();
  expect(vars.size).toBe(2);
  expect(vars.get('☁ foo')).toBe('123');
  expect(vars.get('☁ bar')).toBe('456');
  room.set('☁ foo', '789');
  room.set('☁ bar', '123');
  const vars2 = room.getAllVariables();
  expect(vars2.size).toBe(2);
  expect(vars2.get('☁ foo')).toBe('789');
  expect(vars2.get('☁ bar')).toBe('123');
});

test('hasClientWithUsername', () => {
  const room = new Room('1234');
  const client1 = new Client(null, null);
  client1.username = 'username';
  const client2 = new Client(null, null);
  client2.username = 'username2';
  expect(room.hasClientWithUsername('username')).toBe(false);
  expect(room.hasClientWithUsername('username2')).toBe(false);
  room.addClient(client1);
  expect(room.hasClientWithUsername('username')).toBe(true);
  expect(room.hasClientWithUsername('username2')).toBe(false);
  room.addClient(client2);
  expect(room.hasClientWithUsername('username')).toBe(true);
  expect(room.hasClientWithUsername('username2')).toBe(true);
});
