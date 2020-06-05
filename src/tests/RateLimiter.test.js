const RateLimiter = require('../RateLimiter');

test('RateLimiter', () => {
  const rl = new RateLimiter(10, 1000);
  for (var i = 0; i < 10; i++) {
    expect(rl.rateLimited()).toBe(false);
  }
  for (var i = 0; i < 10; i++) {
    expect(rl.rateLimited()).toBe(true);
  }
});
