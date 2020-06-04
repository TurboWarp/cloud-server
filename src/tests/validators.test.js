const validators = require('../validators');

test('isValidUsername', () => {
  expect(validators.isValidUsername(234)).toBe(false);
  expect(validators.isValidUsername('griffpatch')).toBe(true);
  expect(validators.isValidUsername('gr1fF_p4tch')).toBe(true);
  expect(validators.isValidUsername('griff patch')).toBe(false);
  expect(validators.isValidUsername(' griffpatch')).toBe(false);
  expect(validators.isValidUsername('abcdé')).toBe(false);
  expect(validators.isValidUsername('')).toBe(false);
  expect(validators.isValidUsername('e')).toBe(false);
  expect(validators.isValidUsername('ee')).toBe(false);
  expect(validators.isValidUsername('eee')).toBe(true);
  expect(validators.isValidUsername('e'.repeat(19))).toBe(true);
  expect(validators.isValidUsername('e'.repeat(20))).toBe(true);
  expect(validators.isValidUsername('e'.repeat(21))).toBe(false);
  expect(validators.isValidUsername('fuck')).toBe(false);
  expect(validators.isValidUsername(null)).toBe(false);
  expect(validators.isValidUsername(undefined)).toBe(false);
  expect(validators.isValidUsername(true)).toBe(false);
  expect(validators.isValidUsername(false)).toBe(false);
  expect(validators.isValidUsername([])).toBe(false);
  expect(validators.isValidUsername({})).toBe(false);
});

test('isValidRoomID', () => {
  expect(validators.isValidRoomID('')).toBe(false);
  expect(validators.isValidRoomID('123')).toBe(true);
  expect(validators.isValidRoomID('123.0')).toBe(false);
  expect(validators.isValidRoomID('-123')).toBe(false);
  expect(validators.isValidRoomID(123)).toBe(false);
  expect(validators.isValidRoomID(null)).toBe(false);
  expect(validators.isValidRoomID(undefined)).toBe(false);
  expect(validators.isValidRoomID(true)).toBe(false);
  expect(validators.isValidRoomID(false)).toBe(false);
  expect(validators.isValidRoomID([])).toBe(false);
  expect(validators.isValidRoomID({})).toBe(false);
});

test('isValidVariableMap', () => {
  expect(validators.isValidVariableMap({})).toBe(true);
  expect(validators.isValidVariableMap('{}')).toBe(false);
  expect(validators.isValidVariableMap(4)).toBe(false);
  expect(validators.isValidVariableMap({'hello': '123'})).toBe(true);
  expect(validators.isValidVariableMap(null)).toBe(false);
  expect(validators.isValidVariableMap(undefined)).toBe(false);
  expect(validators.isValidVariableMap(true)).toBe(false);
  expect(validators.isValidVariableMap(false)).toBe(false);
  expect(validators.isValidVariableMap([])).toBe(false);
});

test('isValidVariableName', () => {
  expect(validators.isValidVariableName('☁ Foo')).toBe(true);
  expect(validators.isValidVariableName('☁ 123')).toBe(true);
  expect(validators.isValidVariableName(' ☁ 123')).toBe(false);
  expect(validators.isValidVariableName('☁ null')).toBe(true);
  expect(validators.isValidVariableName('null')).toBe(false);
  expect(validators.isValidVariableName('☁')).toBe(false);
  expect(validators.isValidVariableName('☁ ')).toBe(false);
  expect(validators.isValidVariableName('☁ ' + 'e'.repeat(100))).toBe(false);
  expect(validators.isValidVariableName('☁ fuck')).toBe(false);
  expect(validators.isValidVariableName(123)).toBe(false);
  expect(validators.isValidVariableName(null)).toBe(false);
  expect(validators.isValidVariableName(undefined)).toBe(false);
  expect(validators.isValidVariableName(true)).toBe(false);
  expect(validators.isValidVariableName(false)).toBe(false);
  expect(validators.isValidVariableName([])).toBe(false);
  expect(validators.isValidVariableName({})).toBe(false);
});

test('isValidVarialeValue', () => {
  expect(validators.isValidVariableValue({})).toBe(false);
  expect(validators.isValidVariableValue(true)).toBe(false);
  expect(validators.isValidVariableValue(false)).toBe(false);
  expect(validators.isValidVariableValue(null)).toBe(false);
  expect(validators.isValidVariableValue(undefined)).toBe(false);
  expect(validators.isValidVariableValue(4)).toBe(false);
  expect(validators.isValidVariableValue('-0')).toBe(true);
  expect(validators.isValidVariableValue('0')).toBe(true);
  expect(validators.isValidVariableValue('4')).toBe(true);
  expect(validators.isValidVariableValue('-4')).toBe(true);
  expect(validators.isValidVariableValue('-777777.44')).toBe(true);
  expect(validators.isValidVariableValue('1'.repeat(100))).toBe(true);
  expect(validators.isValidVariableValue('-' + '1'.repeat(100))).toBe(true);
  expect(validators.isValidVariableValue('-' + '1'.repeat(100) + '.' + '1'.repeat(100))).toBe(true);
  expect(validators.isValidVariableValue('00003.3330000')).toBe(true);
  expect(validators.isValidVariableValue('-00003.3330000')).toBe(true);
  expect(validators.isValidVariableValue('-')).toBe(false);
  expect(validators.isValidVariableValue('3..3')).toBe(false);
  expect(validators.isValidVariableValue('3e3')).toBe(false);
  expect(validators.isValidVariableValue('0x03')).toBe(false);
});
