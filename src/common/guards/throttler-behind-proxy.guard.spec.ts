import { ExecutionContext } from '@nestjs/common';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';

describe('ThrottlerBehindProxyGuard', () => {
  const guard = new ThrottlerBehindProxyGuard(
    undefined as never,
    undefined as never,
    undefined as never,
  );

  it('uses first IP from x-forwarded-for when present', async () => {
    const tracker = await (guard as any).getTracker(
      {
        headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.2' },
        ip: '10.0.0.2',
      },
      {} as ExecutionContext,
    );

    expect(tracker).toBe('203.0.113.10');
  });
});
