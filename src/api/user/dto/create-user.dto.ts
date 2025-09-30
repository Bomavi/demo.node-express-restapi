import { IsNotEmpty, IsStrongPassword, MaxLength } from 'class-validator';

import { PublicUserDto } from './public-user.dto';

export class CreateUserDto extends PublicUserDto {
  @IsNotEmpty({ message: 'Field password is required' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'Field password must be strong' },
  )
  @MaxLength(20, {
    message: 'Field password should not exceed 20 characters',
  })
  password: string;
}
