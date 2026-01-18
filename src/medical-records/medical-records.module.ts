import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './entities/medical-record.entity';
import { UsersModule } from 'src/users/users.module';
import { UserSchema, User } from 'src/users/entities/user.entity';
import { Appointment, AppointmentSchema } from 'src/appointments/entities/appointment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MedicalRecord.name, schema: MedicalRecordSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), //for auth
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    UsersModule
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
