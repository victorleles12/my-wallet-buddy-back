import {
  normalizeDocument,
  normalizeEmail,
} from './normalize-user-fields.util';

describe('normalize user fields', () => {
  it('normalizes email to lowercase + trimmed', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
  });

  it('normalizes document trimming spaces', () => {
    expect(normalizeDocument('  12345678901  ')).toBe('12345678901');
  });
});
