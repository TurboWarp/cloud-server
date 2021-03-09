const username = require('../username');

test('isGenerated', () => {
  expect(username.isGenerated('player')).toBe(false);
  expect(username.isGenerated('player123')).toBe(true);
  expect(username.isGenerated('player123456')).toBe(true);
  expect(username.isGenerated('Player123456')).toBe(true);
  expect(username.isGenerated('player1234563209484')).toBe(false);
  expect(username.isGenerated('player123e')).toBe(false);
  expect(username.isGenerated('player_123')).toBe(false);
  expect(username.isGenerated('eplayer123')).toBe(false);
});
