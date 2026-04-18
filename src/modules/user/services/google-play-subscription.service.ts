import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';

type SubscriptionV2Body = {
  subscriptionState?: string;
  lineItems?: Array<{ productId?: string }>;
};

const ACTIVE_STATES = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
]);

@Injectable()
export class GooglePlaySubscriptionService {
  private readonly logger = new Logger(GooglePlaySubscriptionService.name);
  private auth: GoogleAuth | null = null;

  constructor(private readonly config: ConfigService) {}

  private getGoogleAuth(): GoogleAuth {
    if (this.auth) {
      return this.auth;
    }
    const raw = this.config.get<string>('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')?.trim();
    if (!raw) {
      throw new ServiceUnavailableException(
        'Play Billing verification is not configured (GOOGLE_PLAY_SERVICE_ACCOUNT_JSON).',
      );
    }
    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new ServiceUnavailableException(
        'Invalid GOOGLE_PLAY_SERVICE_ACCOUNT_JSON (must be JSON).',
      );
    }
    this.auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    return this.auth;
  }

  private expectedPackageName(): string {
    const v = this.config.get<string>('GOOGLE_PLAY_PACKAGE_NAME')?.trim();
    if (!v) {
      throw new ServiceUnavailableException(
        'GOOGLE_PLAY_PACKAGE_NAME is not configured.',
      );
    }
    return v;
  }

  private allowedProductIds(): string[] {
    const raw =
      this.config.get<string>('GOOGLE_PLAY_SUBSCRIPTION_PRODUCT_IDS')?.trim() ??
      '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Valida o token na Google Play Developer API (subscriptions v2).
   */
  async assertSubscriptionActive(params: {
    packageName: string;
    productId: string;
    purchaseToken: string;
  }): Promise<void> {
    const expectedPkg = this.expectedPackageName();
    if (params.packageName !== expectedPkg) {
      throw new Error('Package name does not match configured app.');
    }

    const allowed = this.allowedProductIds();
    if (allowed.length > 0 && !allowed.includes(params.productId)) {
      throw new Error('Product ID is not allowed for this backend.');
    }

    const auth = this.getGoogleAuth();
    const client = await auth.getClient();
    const { token: accessToken } = await client.getAccessToken();
    if (!accessToken) {
      throw new ServiceUnavailableException(
        'Could not obtain Google access token for Play Developer API.',
      );
    }

    const url =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
      `${encodeURIComponent(params.packageName)}/purchases/subscriptionsv2/tokens/` +
      `${encodeURIComponent(params.purchaseToken)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.warn(
        `Play subscriptionsv2 GET ${res.status}: ${body.slice(0, 500)}`,
      );
      throw new Error('Google Play could not validate this purchase.');
    }

    const body = (await res.json()) as SubscriptionV2Body;
    const state = body.subscriptionState ?? '';
    if (!ACTIVE_STATES.has(state)) {
      throw new Error(`Subscription is not active (state: ${state}).`);
    }

    if (allowed.length > 0 && Array.isArray(body.lineItems)) {
      const ids = body.lineItems
        .map((l) => l.productId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      if (ids.length > 0 && !ids.includes(params.productId)) {
        throw new Error('Purchase line items do not include the declared product.');
      }
    }
  }
}
