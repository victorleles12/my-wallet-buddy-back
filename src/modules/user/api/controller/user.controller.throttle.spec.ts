import 'reflect-metadata';
import { UserController } from './user.controller';

describe('UserController throttling metadata', () => {
  it('applies throttle decorator on public user creation', () => {
    const metadataKeys = Reflect.getMetadataKeys(
      UserController.prototype.create,
    ).map(String);

    expect(metadataKeys.some((key) => key.includes('THROTTLER'))).toBe(true);
  });
});
