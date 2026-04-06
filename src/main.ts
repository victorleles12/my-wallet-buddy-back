import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerEnabled =
    !isProduction || process.env.SWAGGER_ENABLED === 'true';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['debug', 'log', 'verbose', 'warn', 'error'],
  });

  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: isProduction ? process.env.ALLOWED_ORIGINS?.split(',') || [] : '*',
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
    Logger.warn('Swagger is disabled (production). Set SWAGGER_ENABLED=true to enable.');
  }

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  Logger.log(`API running on port ${port}`);
}

void bootstrap();
