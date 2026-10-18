// This file contains words that some may find disturbing.

const {test} = require('node:test');
const assert = require('node:assert/strict');
const naughty = require('../naughty');

test('naughty word detector', () => {
  assert.strictEqual(naughty('griffpatch'), false);
  assert.strictEqual(naughty('ceebee'), true);
  assert.strictEqual(naughty('iloveceebee'), false);
  assert.strictEqual(naughty(''), false);
  assert.strictEqual(naughty(' '), false);
  assert.strictEqual(naughty('123'), false);
});

test('metrics', () => {
  assert.ok(naughty.getTotalBlockedPhrases() > 0);
  assert.ok(naughty.getTotalFilterLists() > 0);
});
