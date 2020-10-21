const RoomList = require('../RoomList');
const Room = require('../Room');
const Client = require('../Client');

// not tested: janitor, logging

test('create', () => {
  const roomList = new RoomList();
  const room1 = roomList.create('1');
  const room2 = roomList.create('2');
  expect(room1).toBeInstanceOf(Room);
  expect(room2).toBeInstanceOf(Room);
  expect(room1).not.toBe(room2);
  expect(() => roomList.create('1')).toThrow();
  expect(() => roomList.create('2')).toThrow();
});

test('has', () => {
  const roomList = new RoomList();
  expect(roomList.has('1234')).toBe(false);
  expect(roomList.has('12345')).toBe(false);
  expect(roomList.has('123456')).toBe(false);
  roomList.create('1234');
  expect(roomList.has('1234')).toBe(true);
  expect(roomList.has('12345')).toBe(false);
  expect(roomList.has('123456')).toBe(false);
  roomList.create('12345');
  expect(roomList.has('1234')).toBe(true);
  expect(roomList.has('12345')).toBe(true);
  expect(roomList.has('123456')).toBe(false);
});

test('get', () => {
  const roomList = new RoomList();
  const room1 = roomList.create('1');
  const room2 = roomList.create('2');
  expect(roomList.get('1')).toBe(room1);
  expect(roomList.get('2')).toBe(room2);
  expect(() => roomList.get('3')).toThrow();
});

test('remove', () => {
  const roomList = new RoomList();
  expect(() => roomList.remove('1')).toThrow();
  expect(roomList.has('1')).toBe(false);
  roomList.create('1');
  expect(roomList.has('1')).toBe(true);
  roomList.remove('1');
  expect(roomList.has('1')).toBe(false);
  expect(roomList.has('2')).toBe(false);
  const room = roomList.create('2');
  expect(roomList.has('2')).toBe(true);
  const testClient = new Client(null, null);
  room.addClient(testClient);
  expect(() => roomList.remove('2')).toThrow();
  room.removeClient(testClient);
  roomList.remove('2')
  expect(roomList.has('2')).toBe(false);
});

test('maxRooms', () => {
  const roomList = new RoomList();
  roomList.maxRooms = 10;
  for (var i = 0; i < roomList.maxRooms; i++) {
    roomList.create(i.toString());
  }
  expect(() => roomList.create('10000')).toThrow();
});
