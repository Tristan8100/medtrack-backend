import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEnum(['patient', 'doctor', 'admin', 'staff'], { 
    message: 'Role must be one of: patient, doctor, admin, staff' 
  })
  @IsOptional()
  role?: string = 'patient';

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber('PH', { message: 'Please provide a valid phone number' }) 
  phoneNumber: string;

  @IsDateString()
  @IsOptional()
  email_verified_at?: Date;
}

export class CreatePatientDTO extends OmitType(
  CreateUserDto,
  ['role'] as const,
) {}

export class UpdateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsOptional()
  password?: string;

  @IsEnum(['patient', 'doctor', 'admin', 'staff'], { 
    message: 'Role must be one of: patient, doctor, admin, staff' 
  })
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsPhoneNumber('PH', { message: 'Please provide a valid phone number' })
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  email_verified_at?: Date;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}