const {test} = require('node:test');
const assert = require('node:assert/strict');
const username = require('../username');

test('isGenerated', () => {
  assert.strictEqual(username.isGenerated('player'), false);
  assert.strictEqual(username.isGenerated('player123'), true);
  assert.strictEqual(username.isGenerated('player123456'), true);
  assert.strictEqual(username.isGenerated('Player123456'), true);
  assert.strictEqual(username.isGenerated('player1234563209484'), false);
  assert.strictEqual(username.isGenerated('player123e'), false);
  assert.strictEqual(username.isGenerated('player_123'), false);
  assert.strictEqual(username.isGenerated('eplayer123'), false);
});
