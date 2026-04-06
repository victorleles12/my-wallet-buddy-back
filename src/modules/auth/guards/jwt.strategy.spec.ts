import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configService = {
    get: jest.fn().mockReturnValue('12345678901234567890123456789012'),
  } as unknown as ConfigService;

  it('rejects token when token version does not match user version', async () => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'u-1',
        email: 'user@example.com',
        enabled: true,
        role: 'user',
        tokenVersion: 3,
      }),
    };

    const strategy = new JwtStrategy(configService, userRepository as never);

    await expect(
      strategy.validate({
        sub: 'u-1',
        type: 'user',
        tv: 2,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
