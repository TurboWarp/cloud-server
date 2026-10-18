const {test} = require('node:test');
const assert = require('node:assert/strict');
const RoomList = require('../RoomList');
const Room = require('../Room');
const Client = require('../Client');

// not tested: janitor, logging

test('create', () => {
  const roomList = new RoomList();
  const room1 = roomList.create('1');
  const room2 = roomList.create('2');
  assert.ok(room1 instanceof Room);
  assert.ok(room2 instanceof Room);
  assert.notStrictEqual(room1, room2);
  assert.throws(() => roomList.create('1'));
  assert.throws(() => roomList.create('2'));
});

test('has', () => {
  const roomList = new RoomList();
  assert.strictEqual(roomList.has('1234'), false);
  assert.strictEqual(roomList.has('12345'), false);
  assert.strictEqual(roomList.has('123456'), false);
  roomList.create('1234');
  assert.strictEqual(roomList.has('1234'), true);
  assert.strictEqual(roomList.has('12345'), false);
  assert.strictEqual(roomList.has('123456'), false);
  roomList.create('12345');
  assert.strictEqual(roomList.has('1234'), true);
  assert.strictEqual(roomList.has('12345'), true);
  assert.strictEqual(roomList.has('123456'), false);
});

test('get', () => {
  const roomList = new RoomList();
  const room1 = roomList.create('1');
  const room2 = roomList.create('2');
  assert.strictEqual(roomList.get('1'), room1);
  assert.strictEqual(roomList.get('2'), room2);
  assert.throws(() => roomList.get('3'));
});

test('remove', () => {
  const roomList = new RoomList();
  assert.throws(() => roomList.remove('1'));
  assert.strictEqual(roomList.has('1'), false);
  roomList.create('1');
  assert.strictEqual(roomList.has('1'), true);
  roomList.remove('1');
  assert.strictEqual(roomList.has('1'), false);
  assert.strictEqual(roomList.has('2'), false);
  const room = roomList.create('2');
  assert.strictEqual(roomList.has('2'), true);
  const testClient = new Client(null, null);
  room.addClient(testClient);
  assert.throws(() => roomList.remove('2'));
  room.removeClient(testClient);
  roomList.remove('2')
  assert.strictEqual(roomList.has('2'), false);
});

test('maxRooms', () => {
  const roomList = new RoomList();
  roomList.maxRooms = 10;
  for (var i = 0; i < roomList.maxRooms; i++) {
    roomList.create(i.toString());
  }
  assert.throws(() => roomList.create('10000'));
});
