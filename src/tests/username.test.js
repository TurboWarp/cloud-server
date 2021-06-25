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

test('isValidUsername', async () => {
  expect(await username.isValidUsername(234)).toBe(false);
  expect(await username.isValidUsername('griffpatch')).toBe(true);
  expect(await username.isValidUsername('gr1fF_p4tch')).toBe(true);
  expect(await username.isValidUsername('griff patch')).toBe(false);
  expect(await username.isValidUsername(' griffpatch')).toBe(false);
  expect(await username.isValidUsername('abcdé')).toBe(false);
  expect(await username.isValidUsername('')).toBe(false);
  expect(await username.isValidUsername('ScratchCat')).toBe(false);
  expect(await username.isValidUsername(null)).toBe(false);
  expect(await username.isValidUsername(undefined)).toBe(false);
  expect(await username.isValidUsername(true)).toBe(false);
  expect(await username.isValidUsername(false)).toBe(false);
  expect(await username.isValidUsername([])).toBe(false);
  expect(await username.isValidUsername({})).toBe(false);
});
