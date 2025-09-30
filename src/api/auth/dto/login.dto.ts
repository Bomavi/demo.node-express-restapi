import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'username@email.com',
  })
  @IsEmail(undefined, { message: 'Email field should be valid' })
  @IsNotEmpty({ message: 'Field email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: '!Password123',
  })
  @IsNotEmpty({ message: 'Field password is required' })
  password: string;
}
