import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  ValidateNested,
  Matches,
  IsMongoId,
  IsDate,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVitalSignsDto {
  @IsOptional()
  @IsString({ message: 'Blood pressure must be a string' })
  @Matches(/^\d{2,3}\/\d{2,3}$/, {
    message: 'Blood pressure must be in format like 120/80',
  })
  bloodPressure?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Heart rate must be a number' })
  heartRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Temperature must be a number' })
  temperature?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Respiratory rate must be a number' })
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Oxygen saturation must be a number' })
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  height?: number;

  @IsOptional()
  @IsNumber({}, { message: 'BMI must be a number' })
  bmi?: number;
}

export class CreateMedicalRecordDto {
  @IsNotEmpty({ message: 'Patient ID is required' })
  @IsMongoId({ message: 'Patient ID must be a valid MongoDB ID' }) //NOTE: ALWAYS USE!!!!!!!!!!
  @IsString({ message: 'Patient ID must be a string' })
  patientId: string;

  @IsOptional()
  @IsMongoId({ message: 'Appointment ID must be a valid MongoDB ID' }) //NOTE: ALWAYS USE!!!!!!!!!!
  @IsString({ message: 'Appointment ID must be a string' })
  appointmentId?: string;

  // @IsNotEmpty({ message: 'Staff ID is required' })
  // @IsString({ message: 'Staff ID must be a string' })
  // staffCreatedId: string; //FROM re.user

  @IsNotEmpty({ message: 'Visit date is required' })
  @IsString({ message: 'Visit date must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Visit date must be in YYYY-MM-DD format',
  })
  visitDate: Date;

  @IsNotEmpty({ message: 'Chief complaint is required' })
  @IsString({ message: 'Chief complaint must be a string' })
  chiefComplaint: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @IsNotEmpty({ message: 'Diagnosis is required' })
  @IsString({ message: 'Diagnosis must be a string' })
  diagnosis: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVitalSignsDto)
  vitalSigns?: CreateVitalSignsDto;
}

export class UpdateMedicalRecordDto {
  // patientId
  // appointmentId
  // staffCreatedId

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Visit date must be in YYYY-MM-DD format',
  })
  visitDate?: Date;

  @IsOptional()
  @IsString({ message: 'Chief complaint must be a string' })
  chiefComplaint?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsString({ message: 'Diagnosis must be a string' })
  diagnosis?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVitalSignsDto)
  vitalSigns?: CreateVitalSignsDto;
}