import { TwoFactorCodeStore } from './two-factor-code.store';

describe('TwoFactorCodeStore', () => {
  let store: TwoFactorCodeStore;

  beforeEach(() => {
    store = new TwoFactorCodeStore();
  });

  it('accepts the generated code once and removes it', () => {
    const code = store.generateAndStore('user@example.com', 'user-1');
    expect(code).toMatch(/^\d{6}$/);
    expect(store.verifyAndConsume('user@example.com', 'user-1', code)).toBe(
      'ok',
    );
    expect(store.verifyAndConsume('user@example.com', 'user-1', code)).toBe(
      'invalid',
    );
  });

  it('locks verification after max invalid attempts', () => {
    store.generateAndStore('user@example.com', 'user-1');

    for (let i = 0; i < 4; i += 1) {
      expect(
        store.verifyAndConsume('user@example.com', 'user-1', '000000'),
      ).toBe('invalid');
    }

    expect(store.verifyAndConsume('user@example.com', 'user-1', '000000')).toBe(
      'locked',
    );
    expect(
      store.getLockRemainingMs('user@example.com', 'user-1'),
    ).toBeGreaterThan(0);
  });
});
