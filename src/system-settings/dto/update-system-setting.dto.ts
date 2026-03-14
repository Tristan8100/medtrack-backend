import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemSettingsReservationLimitDto } from './create-system-setting.dto';

export class UpdateSystemSettingDto extends PartialType(CreateSystemSettingsReservationLimitDto) {}
