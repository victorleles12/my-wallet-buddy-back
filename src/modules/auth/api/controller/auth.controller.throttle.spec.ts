import 'reflect-metadata';
import { AuthController } from './auth.controller';

describe('AuthController throttling metadata', () => {
  it('applies throttle decorators on auth login endpoints', () => {
    const requestCodeMetadataKeys = Reflect.getMetadataKeys(
      AuthController.prototype.requestCode,
    ).map(String);
    const verifyMetadataKeys = Reflect.getMetadataKeys(
      AuthController.prototype.verify,
    ).map(String);

    expect(
      requestCodeMetadataKeys.some((key) => key.includes('THROTTLER')),
    ).toBe(true);
    expect(verifyMetadataKeys.some((key) => key.includes('THROTTLER'))).toBe(
      true,
    );
  });
});
