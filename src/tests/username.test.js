const username = require('../username');

test('isGenerated', () => {
  expect(username.isGenerated('player')).toBe(true);
  expect(username.isGenerated('player123')).toBe(true);
  expect(username.isGenerated('player123456')).toBe(true);
  expect(username.isGenerated('Player123456')).toBe(true);
  expect(username.isGenerated('player1234563209484')).toBe(false);
  expect(username.isGenerated('player123e')).toBe(false);
  expect(username.isGenerated('player_123')).toBe(false);
  expect(username.isGenerated('eplayer123')).toBe(false);
});

test('isValidUsername', () => {
  expect(username.isValidUsername(234)).toBe(false);
  expect(username.isValidUsername(null)).toBe(false);
  expect(username.isValidUsername(undefined)).toBe(false);
  expect(username.isValidUsername(true)).toBe(false);
  expect(username.isValidUsername(false)).toBe(false);
  expect(username.isValidUsername([])).toBe(false);
  expect(username.isValidUsername({})).toBe(false);
  expect(username.isValidUsername('')).toBe(false);
  expect(username.isValidUsername('griffpatch')).toBe(true);
})

test('isValidScratchAccount', async () => {
  expect(await username.isValidScratchAccount('griffpatch')).toBe(true);
  expect(await username.isValidScratchAccount('player' + Math.round(Math.random() * 10000000))).toBe(true);
});
