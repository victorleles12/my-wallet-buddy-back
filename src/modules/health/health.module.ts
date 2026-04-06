import { Module } from '@nestjs/common';
import { HealthController } from './api/controller/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
