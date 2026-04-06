import { validate } from 'class-validator';
import { CreateUserRequestDto } from './create.user.request.dto';

describe('CreateUserRequestDto password policy', () => {
  const base = {
    firstName: 'John',
    lastName: 'Doe',
    document: '12345678901',
    address: 'Street',
    sex: 'male',
    email: 'john@example.com',
    phone: '+5511999999999',
  };

  it('rejects weak password', async () => {
    const dto = Object.assign(new CreateUserRequestDto(), {
      ...base,
      password: 'weakpass',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('accepts strong password', async () => {
    const dto = Object.assign(new CreateUserRequestDto(), {
      ...base,
      password: 'Str0ngP@ss!',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(false);
  });
});
