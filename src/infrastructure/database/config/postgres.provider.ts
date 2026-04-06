import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { FamilyGroupMemberEntity } from '../../../domain/entities/family-group-member.entity';
import { FamilyGroupEntity } from '../../../domain/entities/family-group.entity';
import { GoalItemEntity } from '../../../domain/entities/goal-item.entity';
import { GoalEntity } from '../../../domain/entities/goal.entity';
import { GoalParticipantEntity } from '../../../domain/entities/goal-participant.entity';
import { TransactionEntity } from '../../../domain/entities/transaction.entity';
import { UserEntity } from '../../../domain/entities/user.entity';

dotenv.config();

export const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'finan_control',
  entities: [
    UserEntity,
    FamilyGroupEntity,
    FamilyGroupMemberEntity,
    TransactionEntity,
    GoalEntity,
    GoalParticipantEntity,
    GoalItemEntity,
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
