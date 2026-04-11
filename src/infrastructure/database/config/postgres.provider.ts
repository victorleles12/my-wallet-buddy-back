import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  inferPostgresSslFromUrl,
  isLocalPostgresHost,
  parseDatabaseUrl,
} from './parse-database-url.util';
import { FamilyGroupMemberEntity } from '../../../domain/entities/family-group-member.entity';
import { FamilyGroupEntity } from '../../../domain/entities/family-group.entity';
import { GoalItemEntity } from '../../../domain/entities/goal-item.entity';
import { GoalEntity } from '../../../domain/entities/goal.entity';
import { GoalParticipantEntity } from '../../../domain/entities/goal-participant.entity';
import { TransactionEntity } from '../../../domain/entities/transaction.entity';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CreditCardEntity } from '../../../domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '../../../domain/entities/credit-card-purchase.entity';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.development', override: true });

const databaseUrl = process.env.DATABASE_URL;
const parsed = parseDatabaseUrl(databaseUrl);
const useSsl =
  process.env.DB_SSL === 'true' ||
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
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'finan_control',
    };

export const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: connection.host,
  port: connection.port,
  username: connection.username,
  password: connection.password,
  database: connection.database,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  entities: [
    UserEntity,
    FamilyGroupEntity,
    FamilyGroupMemberEntity,
    TransactionEntity,
    GoalEntity,
    GoalParticipantEntity,
    GoalItemEntity,
    CreditCardEntity,
    CreditCardPurchaseEntity,
  ],
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  synchronize: false,
  logging:
    process.env.DB_QUERY_LOGGING === 'true'
      ? ['error', 'warn', 'query']
      : ['error', 'warn'],
  maxQueryExecutionTime: Number(process.env.DB_SLOW_QUERY_MS || 200),
};

const dataSource = new DataSource(postgresConfig);
export default dataSource;
