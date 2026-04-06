import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  inferPostgresSslFromUrl,
  isLocalPostgresHost,
  parseDatabaseUrl,
} from '@/infrastructure/database/config/parse-database-url.util';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const slowQueryMs = Number(
          configService.get<string>('DB_SLOW_QUERY_MS', '200'),
        );
        const queryLoggingEnabled =
          configService.get<string>('DB_QUERY_LOGGING', 'false') === 'true';
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const parsed = parseDatabaseUrl(databaseUrl);
        const useSslFlag = configService.get<string>('DB_SSL', 'false') === 'true';
        const useSsl =
          useSslFlag ||
          inferPostgresSslFromUrl(databaseUrl) ||
          (parsed !== null && !isLocalPostgresHost(parsed.host));

        const connection = parsed
          ? {
              host: parsed.host,
              port: parsed.port,
              username: parsed.username,
              password: parsed.password,
              database: parsed.database,
            }
          : {
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: Number(configService.get<string>('DB_PORT', '5432')),
              username: configService.get<string>('DB_USERNAME', 'postgres'),
              password: configService.get<string>('DB_PASSWORD', 'postgres'),
              database: configService.get<string>('DB_DATABASE', 'finan_control'),
            };

        return {
          type: 'postgres',
          ...connection,
          ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
          synchronize: false,
          autoLoadEntities: true,
          logging: queryLoggingEnabled
            ? ['error', 'warn', 'query']
            : ['error', 'warn'],
          maxQueryExecutionTime: slowQueryMs,
        };
      },
    }),
  ],
})
export class DataBaseModule {}
