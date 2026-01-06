import '@testing-library/jest-dom'

// Mock crypto.randomUUID for tests
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 9) + '-test-uuid',
  } as Crypto
}

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear()
})

