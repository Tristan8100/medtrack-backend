import { Module } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { SystemSettings, SystemSettingsSchema } from './entities/system-setting.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: SystemSettings.name, schema: SystemSettingsSchema }]),
    UsersModule
  ],
})
export class SystemSettingsModule {}
