import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingsReservationLimitDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { Role, RolesGuard } from 'src/auth/auth.user';
import { AuthGuard } from 'src/auth/auth.guard';
import { CustomThrottlerGuard } from 'lib/customThrottle';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Role('admin')
  @Post()
  create(@Body() createSystemSettingDto: CreateSystemSettingsReservationLimitDto) {
    return this.systemSettingsService.create(createSystemSettingDto);
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Role('admin')
  @Get()
  findAll() {
    return this.systemSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSystemSettingDto: UpdateSystemSettingDto) {
    return this.systemSettingsService.update(+id, updateSystemSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemSettingsService.remove(+id);
  }
}
