import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsString({ message: 'Date must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: Date;

  @IsNotEmpty({ message: 'Chief complaint is required' })
  @IsString({ message: 'Chief complaint must be a string' })
  chiefComplaint: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export class StatusDTO {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(['pending', 'scheduled', 'completed', 'cancelled', 'no-show', 'declined', 'late'], { message: 'Status must be one of: pending, scheduled, completed, cancelled' })
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'declined' | 'late';
}