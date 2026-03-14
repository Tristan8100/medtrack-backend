import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSystemSettingsReservationLimitDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SystemSettings, SystemSettingsDocument } from './entities/system-setting.entity';
import { Model } from 'mongoose';
import { isEmpty } from 'class-validator';
import { ResponseType } from 'lib/type';


@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectModel(SystemSettings.name) private systemSettings: Model<SystemSettingsDocument>,
  ) {}

  async create(createSystemSettingDto: CreateSystemSettingsReservationLimitDto): Promise<ResponseType> {
    try {
      const created = await this.systemSettings.findOneAndUpdate({ key: 'system_settings'}, createSystemSettingDto, { upsert: true });

      return {
        status: 201,
        message: 'System settings created successfully',
        origin: 'SystemSettingsService.create',
        data: created,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const data = await this.systemSettings.findOne({ key: 'system_settings' });

      return {
        status: 200,
        message: 'System settings fetched successfully',
        origin: 'SystemSettingsService.findAll',
        data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} systemSetting`;
  }

  update(id: number, updateSystemSettingDto: UpdateSystemSettingDto) {
    return `This action updates a #${id} systemSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} systemSetting`;
  }
}
