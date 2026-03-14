import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateSystemSettingsReservationLimitDto {
  @IsNotEmpty({ message: 'reservationLimit is required' })
  @IsNumber()
  reservationLimit: number;
}
