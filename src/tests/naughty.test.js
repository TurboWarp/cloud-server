// This file contains many words that some may find disturbing.

const isSafe = require('../naughty');

test('naughty word detector', () => {
  expect(isSafe('griffpatch')).toBe(true);
  expect(isSafe('Hell-o :)')).toBe(true);
  expect(isSafe('fuck')).toBe(false);
  expect(isSafe('f_u_c_k')).toBe(false);
  expect(isSafe('fu__3_c_k')).toBe(false);
  expect(isSafe('FUCK')).toBe(false);
  expect(isSafe('bitchute')).toBe(false);
});
