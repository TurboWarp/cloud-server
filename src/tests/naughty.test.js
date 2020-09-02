// This file contains words that some may find disturbing.

const naughty = require('../naughty');

test('naughty word detector', () => {
  expect(naughty('griffpatch')).toBe(false);
  expect(naughty('Hell-o :)')).toBe(false);
  expect(naughty('fuck')).toBe(true);
  expect(naughty('f_u_c_-k')).toBe(true);
  expect(naughty('-fu_c_k')).toBe(true);
  expect(naughty('FUCK')).toBe(true);
  expect(naughty('bitchute')).toBe(true);
  expect(naughty('ceebee')).toBe(true);
  expect(naughty('iloveceebee')).toBe(false);
  expect(naughty('')).toBe(false);
  expect(naughty(' ')).toBe(false);
  expect(naughty('123')).toBe(false);
});

test('metrics', () => {
  expect(naughty.getTotalBlockedPhrases()).toBeGreaterThan(0);
  expect(naughty.getTotalFilterLists()).toBeGreaterThan(0);
});
