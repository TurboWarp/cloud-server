const checkers = require('../checkers');

test('isValidUsername', () => {
  expect(checkers.isValidUsername(234)).toBe(false);
  expect(checkers.isValidUsername('griffpatch')).toBe(true);
  expect(checkers.isValidUsername('gr1fF_p4tch')).toBe(true);
  expect(checkers.isValidUsername('griff patch')).toBe(false);
  expect(checkers.isValidUsername(' griffpatch')).toBe(false);
  expect(checkers.isValidUsername('abcdé')).toBe(false);
  expect(checkers.isValidUsername('')).toBe(false);
  expect(checkers.isValidUsername('e')).toBe(false);
  expect(checkers.isValidUsername('ee')).toBe(false);
  expect(checkers.isValidUsername('eee')).toBe(true);
  expect(checkers.isValidUsername('e'.repeat(19))).toBe(true);
  expect(checkers.isValidUsername('e'.repeat(20))).toBe(true);
  expect(checkers.isValidUsername('e'.repeat(21))).toBe(false);
  expect(checkers.isValidUsername('fuck')).toBe(false);
  expect(checkers.isValidUsername(null)).toBe(false);
  expect(checkers.isValidUsername(undefined)).toBe(false);
  expect(checkers.isValidUsername(true)).toBe(false);
  expect(checkers.isValidUsername(false)).toBe(false);
  expect(checkers.isValidUsername([])).toBe(false);
  expect(checkers.isValidUsername({})).toBe(false);
});

test('isValidRoomID', () => {
  expect(checkers.isValidRoomID('')).toBe(false);
  expect(checkers.isValidRoomID('123')).toBe(true);
  expect(checkers.isValidRoomID('123.0')).toBe(false);
  expect(checkers.isValidRoomID('-123')).toBe(false);
  expect(checkers.isValidRoomID(123)).toBe(false);
  expect(checkers.isValidRoomID(null)).toBe(false);
  expect(checkers.isValidRoomID(undefined)).toBe(false);
  expect(checkers.isValidRoomID(true)).toBe(false);
  expect(checkers.isValidRoomID(false)).toBe(false);
  expect(checkers.isValidRoomID([])).toBe(false);
  expect(checkers.isValidRoomID({})).toBe(false);
});

test('isValidVariableMap', () => {
  expect(checkers.isValidVariableMap({})).toBe(true);
  expect(checkers.isValidVariableMap('{}')).toBe(false);
  expect(checkers.isValidVariableMap(4)).toBe(false);
  expect(checkers.isValidVariableMap({'hello': '123'})).toBe(true);
  expect(checkers.isValidVariableMap(null)).toBe(false);
  expect(checkers.isValidVariableMap(undefined)).toBe(false);
  expect(checkers.isValidVariableMap(true)).toBe(false);
  expect(checkers.isValidVariableMap(false)).toBe(false);
  expect(checkers.isValidVariableMap([])).toBe(false);
  expect(checkers.isValidVariableMap(new class A { })).toBe(false);
});

test('isValidVariableName', () => {
  expect(checkers.isValidVariableName('☁ Foo')).toBe(true);
  expect(checkers.isValidVariableName('☁ 123')).toBe(true);
  expect(checkers.isValidVariableName(' ☁ 123')).toBe(false);
  expect(checkers.isValidVariableName('☁ null')).toBe(true);
  expect(checkers.isValidVariableName('null')).toBe(false);
  expect(checkers.isValidVariableName('☁')).toBe(false);
  expect(checkers.isValidVariableName('☁ ')).toBe(false);
  expect(checkers.isValidVariableName('☁ ' + 'e'.repeat(100))).toBe(false);
  expect(checkers.isValidVariableName('☁ fuck')).toBe(false);
  expect(checkers.isValidVariableName(123)).toBe(false);
  expect(checkers.isValidVariableName(null)).toBe(false);
  expect(checkers.isValidVariableName(undefined)).toBe(false);
  expect(checkers.isValidVariableName(true)).toBe(false);
  expect(checkers.isValidVariableName(false)).toBe(false);
  expect(checkers.isValidVariableName([])).toBe(false);
  expect(checkers.isValidVariableName({})).toBe(false);
});

test('isValidVarialeValue', () => {
  expect(checkers.isValidVariableValue({})).toBe(false);
  expect(checkers.isValidVariableValue(true)).toBe(false);
  expect(checkers.isValidVariableValue(false)).toBe(false);
  expect(checkers.isValidVariableValue(null)).toBe(false);
  expect(checkers.isValidVariableValue(undefined)).toBe(false);
  expect(checkers.isValidVariableValue(4)).toBe(false);
  expect(checkers.isValidVariableValue('-0')).toBe(true);
  expect(checkers.isValidVariableValue('0')).toBe(true);
  expect(checkers.isValidVariableValue('4')).toBe(true);
  expect(checkers.isValidVariableValue('-4')).toBe(true);
  expect(checkers.isValidVariableValue('-777777.44')).toBe(true);
  expect(checkers.isValidVariableValue('1'.repeat(100))).toBe(true);
  expect(checkers.isValidVariableValue('-' + '1'.repeat(100))).toBe(true);
  expect(checkers.isValidVariableValue('-' + '1'.repeat(100) + '.' + '1'.repeat(100))).toBe(true);
  expect(checkers.isValidVariableValue('00003.3330000')).toBe(true);
  expect(checkers.isValidVariableValue('-00003.3330000')).toBe(true);
  expect(checkers.isValidVariableValue('-')).toBe(false);
  expect(checkers.isValidVariableValue('3..3')).toBe(false);
  expect(checkers.isValidVariableValue('3e3')).toBe(false);
  expect(checkers.isValidVariableValue('0x03')).toBe(false);
});
