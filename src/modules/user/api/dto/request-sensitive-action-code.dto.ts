import { IsIn, IsString, MinLength } from 'class-validator';

export type SensitiveAccountAction = 'delete_account' | 'clear_financial_data';

export class RequestSensitiveActionCodeDto {
  @IsIn(['delete_account', 'clear_financial_data'])
  action: SensitiveAccountAction;

  @IsString()
  @MinLength(1, { message: 'password is required' })
  password: string;
}
