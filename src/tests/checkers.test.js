const checkers = require('../checkers');

test('isValidUsername', () => {
  expect(checkers.isValidUsername(234)).toBe(false);
});
