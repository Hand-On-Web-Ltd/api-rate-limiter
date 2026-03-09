const { MemoryStore } = require('./stores/memory-store');

function rateLimiter(options = {}) {
  const {
    windowSeconds = 60,
    maxRequests = 100,
    keyFn = req => req.ip,
    store = new MemoryStore(),
    message = 'Too many requests'
  } = options;

  const windowMs = windowSeconds * 1000;

  return (req, res, next) => {
    const key = keyFn(req);
    const { count, resetTime } = store.increment(key, windowMs);
    const remaining = Math.max(0, maxRequests - count);
    const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000);

    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

    if (count > maxRequests) {
      res.set('Retry-After', String(resetSeconds));
      return res.status(429).json({ error: message, retryAfter: resetSeconds });
    }

    next();
  };
}

module.exports = { rateLimiter };
