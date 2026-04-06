import { Injectable } from '@nestjs/common';
import { randomInt, timingSafeEqual } from 'crypto';

const CODE_TTL_MS = 5 * 60 * 1000;
const CODE_LENGTH = 6;

interface PendingCode {
  code: string;
  expiresAt: number;
}

@Injectable()
export class TwoFactorCodeStore {
  private readonly store = new Map<string, PendingCode>();

  generateAndStore(email: string): string {
    const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, '0');
    const key = this.normalize(email);
    this.store.set(key, { code, expiresAt: Date.now() + CODE_TTL_MS });
    return code;
  }

  verifyAndConsume(email: string, inputCode: string): boolean {
    const key = this.normalize(email);
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    const expected = entry.code.padStart(CODE_LENGTH, '0');
    const received = inputCode.trim().padStart(CODE_LENGTH, '0');
    if (expected.length !== received.length) {
      return false;
    }
    const ok = timingSafeEqual(Buffer.from(expected), Buffer.from(received));
    if (ok) {
      this.store.delete(key);
    }
    return ok;
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}
