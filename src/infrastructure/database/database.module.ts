import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { GoalItemEntity } from '@/domain/entities/goal-item.entity';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { UserEntity } from '@/domain/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'finan_control'),
        entities: [
          UserEntity,
          FamilyGroupEntity,
          FamilyGroupMemberEntity,
          TransactionEntity,
          GoalEntity,
          GoalParticipantEntity,
          GoalItemEntity,
        ],
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DataBaseModule {}
