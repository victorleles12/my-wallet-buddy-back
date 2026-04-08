import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

function parseAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function isLocalDevOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

async function bootstrap(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerEnabled =
    !isProduction || process.env.SWAGGER_ENABLED === 'true';
  const defaultDevOrigins = [
    'http://localhost:19006',
    'http://127.0.0.1:19006',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const configuredOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  const allowedOrigins =
    configuredOrigins.length > 0
      ? configuredOrigins
      : isProduction
        ? []
        : defaultDevOrigins;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['debug', 'log', 'verbose', 'warn', 'error'],
  });

  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Requests without Origin (curl/Postman/server-to-server)
      if (!origin) return callback(null, true);

      // Explicit allow-list always wins.
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // In dev, allow localhost/127.0.0.1 on dynamic ports (Expo web often shifts ports).
      if (!isProduction && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('FinanControl API')
      .setDescription('Family expense control API')
      .setVersion('1.0')
      .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Local')
      .addTag('auth')
      .addTag('health')
      .addTag('users')
      .addTag('groups')
      .addTag('transactions')
      .addTag('goals')
      .addTag('credit-cards')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT from POST /auth/login/verify',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
      },
      customSiteTitle: 'FinanControl API',
    });
    Logger.log(
      `Swagger UI: http://localhost:${process.env.PORT || 3000}/api/docs`,
    );
    Logger.log(
      `OpenAPI JSON: http://localhost:${process.env.PORT || 3000}/api/docs-json`,
    );
  } else {
    Logger.warn(
      'Swagger is disabled (production). Set SWAGGER_ENABLED=true to enable.',
    );
  }

  const port = Number(process.env.PORT || 3000);
  // Heroku (e a maioria dos PaaS) define PORT: é preciso escutar em 0.0.0.0, não só 127.0.0.1.
  const host =
    process.env.HOST ||
    (process.env.PORT !== undefined ? '0.0.0.0' : isProduction ? '127.0.0.1' : '0.0.0.0');
  await app.listen(port, host);
  Logger.log(`API running on http://${host}:${port}`);
}

void bootstrap().catch((err: unknown) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error('[bootstrap] Falha ao iniciar:', msg);
  process.exit(1);
});
