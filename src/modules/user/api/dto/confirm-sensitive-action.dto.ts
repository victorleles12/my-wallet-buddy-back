import { IsIn, IsString, MinLength } from 'class-validator';
import type { SensitiveAccountAction } from './request-sensitive-action-code.dto';

export class ConfirmSensitiveActionDto {
  @IsIn(['delete_account', 'clear_financial_data'])
  action: SensitiveAccountAction;

  @IsString()
  @MinLength(4)
  code: string;
}
