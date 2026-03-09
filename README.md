# api-rate-limiter

Simple rate limiting middleware for Express. Drop it in, set your limits, done.

## Install

```bash
npm install @hand-on-web/api-rate-limiter
```

## Quick Start

```js
const express = require('express');
const { rateLimiter } = require('@hand-on-web/api-rate-limiter');

const app = express();

// 100 requests per 60 seconds per IP
app.use(rateLimiter({
  windowSeconds: 60,
  maxRequests: 100
}));

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello' });
});

app.listen(3000);
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `windowSeconds` | number | `60` | Time window in seconds |
| `maxRequests` | number | `100` | Max requests per window |
| `keyFn` | function | `req => req.ip` | Function that returns a string key for the requester |
| `store` | object | `MemoryStore` | Storage backend (must implement `increment(key, windowMs)`) |
| `message` | string | `'Too many requests'` | Response message when rate limited |

## Custom Key Function

Rate limit by API key instead of IP:

```js
app.use(rateLimiter({
  windowSeconds: 60,
  maxRequests: 1000,
  keyFn: req => req.headers['x-api-key'] || req.ip
}));
```

## How It Works

Uses a sliding window approach. Each request increments a counter tied to the current window. When the counter exceeds `maxRequests`, the middleware returns a 429 status with a `Retry-After` header telling the client how long to wait.

## Response Headers

Every response includes:
- `X-RateLimit-Limit` — your max requests
- `X-RateLimit-Remaining` — how many you have left
- `X-RateLimit-Reset` — when the current window resets (unix timestamp)

When rate limited (429):
- `Retry-After` — seconds until you can try again


## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
