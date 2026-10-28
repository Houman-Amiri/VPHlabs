import '@testing-library/jest-dom/vitest';

// Stub window.scrollTo in jsdom
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});
