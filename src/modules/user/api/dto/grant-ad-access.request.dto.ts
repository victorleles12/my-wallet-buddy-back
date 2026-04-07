import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GrantAdAccessRequestDto {
  @ApiPropertyOptional({
    example: 24,
    minimum: 1,
    maximum: 168,
    description: 'How many hours of temporary access to grant.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  hours?: number;
}
