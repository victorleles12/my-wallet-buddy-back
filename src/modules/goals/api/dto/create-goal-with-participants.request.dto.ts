import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGoalWithParticipantsRequestDto {
  @ApiProperty({ example: 'Viagem Europa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  targetAmount: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: '✈️' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;

  /**
   * IDs de usuários que participam do objetivo (além do criador, que entra automaticamente).
   * Pode incluir o próprio criador de novo — será deduplicado.
   * Array vazio = objetivo só para o criador.
   */
  @ApiProperty({
    type: [String],
    example: ['18ea52e3-f248-40d2-9be4-005338301140'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(0)
  participantUserIds: string[];
}
