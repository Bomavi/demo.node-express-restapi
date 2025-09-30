import { IsEmail, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class PublicUserDto {
  @IsEmail(undefined, { message: 'Field email should be valid' })
  @IsNotEmpty({ message: 'Field email is required' })
  email: string;

  @IsNotEmpty({ message: 'Field firstname is required' })
  @MaxLength(20, { message: 'Field firstname should not exceed 20 characters' })
  username: string;

  @IsIn(['light', 'dark'], {
    message: 'Field theme is not valid, could be light or dark',
  })
  theme: string;
}
