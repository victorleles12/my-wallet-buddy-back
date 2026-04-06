import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AddGoalParticipantsRequestDto {
  @ApiProperty({
    type: [String],
    description: 'Usuários a incluir no objetivo (não podem já ser participantes).',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  userIds: string[];
}
