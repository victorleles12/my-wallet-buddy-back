import { ForbiddenException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get.user.by.id.use-case';

describe('GetUserByIdUseCase', () => {
  it('blocks non-admin from reading another user profile', async () => {
    const userRepository = {
      findOne: jest.fn(),
    };
    const useCase = new GetUserByIdUseCase(userRepository as never);

    await expect(
      useCase.execute('target-user-id', 'requester-user-id', 'user'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });
});
