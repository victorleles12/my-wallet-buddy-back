import { Injectable } from '@nestjs/common';
import { randomInt, timingSafeEqual } from 'crypto';

const CODE_TTL_MS = 5 * 60 * 1000;
const CODE_LENGTH = 6;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TTL_MS = 10 * 60 * 1000;

function normalizeSixDigitCode(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.padStart(CODE_LENGTH, '0').slice(-CODE_LENGTH);
}

interface PendingCode {
  code: string;
  expiresAt: number;
  failedAttempts: number;
  lockedUntil: number | null;
}

export type TwoFactorVerifyStatus = 'ok' | 'invalid' | 'locked';

@Injectable()
export class TwoFactorCodeStore {
  private readonly store = new Map<string, PendingCode>();

  generateAndStore(email: string, userId: string): string {
    const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(
      CODE_LENGTH,
      '0',
    );
    const key = this.keyFor(email, userId);
    this.store.set(key, {
      code,
      expiresAt: Date.now() + CODE_TTL_MS,
      failedAttempts: 0,
      lockedUntil: null,
    });
    return code;
  }

  getLockRemainingMs(email: string, userId: string): number {
    const key = this.keyFor(email, userId);
    const entry = this.store.get(key);
    if (!entry || !entry.lockedUntil) {
      return 0;
    }
    const remaining = entry.lockedUntil - Date.now();
    if (remaining <= 0) {
      entry.lockedUntil = null;
      entry.failedAttempts = 0;
      this.store.set(key, entry);
      return 0;
    }
    return remaining;
  }

  verifyAndConsume(
    email: string,
    userId: string,
    inputCode: string,
  ): TwoFactorVerifyStatus {
    const key = this.keyFor(email, userId);
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return 'invalid';
    }

    if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
      return 'locked';
    }

    const expected = normalizeSixDigitCode(entry.code);
    const received = normalizeSixDigitCode(inputCode.trim());
    const ok = timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(received, 'utf8'),
    );

    if (ok) {
      this.store.delete(key);
      return 'ok';
    }

    entry.failedAttempts += 1;
    if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCK_TTL_MS;
    }
    this.store.set(key, entry);
    return entry.lockedUntil ? 'locked' : 'invalid';
  }

  private keyFor(email: string, userId: string): string {
    return `${email.trim().toLowerCase()}::${userId}`;
  }
}
