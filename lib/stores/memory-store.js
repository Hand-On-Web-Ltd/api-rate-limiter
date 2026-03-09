class MemoryStore {
  constructor() {
    this.hits = new Map();
    // Clean up expired entries every 5 minutes
    this._timer = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    if (this._timer.unref) this._timer.unref();
  }

  increment(key, windowMs) {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.hits.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    entry.count++;
    return { count: entry.count, resetTime: entry.resetTime };
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.hits) {
      if (now > entry.resetTime) this.hits.delete(key);
    }
  }
}

module.exports = { MemoryStore };
