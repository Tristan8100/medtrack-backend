
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(4, { message: 'Name must be at least 4 characters long' })
  name: string;

  // @IsOptional()
  // @MinLength(6)
  // password?: string;
}

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
  confirmPassword: string;
}

