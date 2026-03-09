const assert = require('assert');
const { rateLimiter, MemoryStore } = require('../index');

// Mock req/res/next
function mockReq(ip = '127.0.0.1') {
  return { ip };
}

function mockRes() {
  const headers = {};
  return {
    headers,
    statusCode: null,
    body: null,
    set(k, v) { headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; }
  };
}

// Test 1: allows requests under the limit
(function testUnderLimit() {
  const mw = rateLimiter({ windowSeconds: 60, maxRequests: 5 });
  const req = mockReq();
  const res = mockRes();
  let called = false;
  mw(req, res, () => { called = true; });
  assert.strictEqual(called, true, 'next() should be called');
  assert.strictEqual(res.headers['X-RateLimit-Remaining'], '4');
  console.log('✓ allows requests under the limit');
})();

// Test 2: blocks requests over the limit
(function testOverLimit() {
  const mw = rateLimiter({ windowSeconds: 60, maxRequests: 3 });
  const req = mockReq('10.0.0.1');

  for (let i = 0; i < 3; i++) {
    mw(req, mockRes(), () => {});
  }

  const res = mockRes();
  let called = false;
  mw(req, res, () => { called = true; });
  assert.strictEqual(called, false, 'next() should NOT be called');
  assert.strictEqual(res.statusCode, 429);
  assert.ok(res.headers['Retry-After']);
  console.log('✓ blocks requests over the limit (429)');
})();

// Test 3: different IPs have separate limits
(function testSeparateKeys() {
  const mw = rateLimiter({ windowSeconds: 60, maxRequests: 1 });

  const res1 = mockRes();
  mw(mockReq('1.1.1.1'), res1, () => {});
  assert.strictEqual(res1.headers['X-RateLimit-Remaining'], '0');

  const res2 = mockRes();
  let called = false;
  mw(mockReq('2.2.2.2'), res2, () => { called = true; });
  assert.strictEqual(called, true, 'different IP should not be blocked');
  console.log('✓ different IPs have separate limits');
})();

console.log('\nAll tests passed ✓');
