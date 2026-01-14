// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Request/Response in Node.js environment (for API route tests)
if (typeof globalThis.Request === 'undefined' && typeof window === 'undefined') {
  // Node.js 18+ has native fetch, but Request might not be in global scope
  // Next.js should provide this, but we add a fallback
  const { Request: UndiciRequest, Response: UndiciResponse, Headers: UndiciHeaders } = require('undici');
  globalThis.Request = UndiciRequest;
  globalThis.Response = UndiciResponse;
  globalThis.Headers = UndiciHeaders;
}
