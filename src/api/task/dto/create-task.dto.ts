import { IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'Field description is required' })
  @MaxLength(100, {
    message: 'Field description should not exceed 100 characters',
  })
  description: string;

  @IsBoolean({ message: 'Field completed should be either true or false' })
  completed: boolean;
}
