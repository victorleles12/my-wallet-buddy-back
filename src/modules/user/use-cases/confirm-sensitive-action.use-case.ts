import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import {
  TWO_FA_PURPOSE_CLEAR_FINANCIAL_DATA,
  TWO_FA_PURPOSE_DELETE_ACCOUNT,
  TwoFactorCodeStore,
} from '@/modules/auth/services/two-factor-code.store';
import { DeleteUserUseCase } from './delete.user.use-case';
import { ClearUserFinancialDataUseCase } from './clear-user-financial-data.use-case';
import type { SensitiveAccountAction } from '../api/dto/request-sensitive-action-code.dto';

function purposeForAction(action: SensitiveAccountAction): string {
  return action === 'delete_account'
    ? TWO_FA_PURPOSE_DELETE_ACCOUNT
    : TWO_FA_PURPOSE_CLEAR_FINANCIAL_DATA;
}

@Injectable()
export class ConfirmSensitiveActionUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twoFactorCodeStore: TwoFactorCodeStore,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly clearUserFinancialDataUseCase: ClearUserFinancialDataUseCase,
  ) {}

  async execute(
    userId: string,
    action: SensitiveAccountAction,
    code: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.enabled) {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    const purpose = purposeForAction(action);
    const verification = this.twoFactorCodeStore.verifyAndConsume(
      user.email,
      user.id,
      code,
      purpose,
    );

    if (verification === 'locked') {
      throw new HttpException(
        'Too many invalid code attempts. Request a new code and try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (verification !== 'ok') {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    if (action === 'delete_account') {
      await this.deleteUserUseCase.execute(userId, userId, user.role);
      return;
    }

    await this.clearUserFinancialDataUseCase.execute(userId);
  }
}
