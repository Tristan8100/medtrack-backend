import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { INVALID_TRANSITIONS, ResponseType } from 'lib/type';
import { UserDocument, User } from 'src/users/entities/user.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecord, MedicalRecordDocument } from './entities/medical-record.entity';
import { Appointment, AppointmentDocument } from 'src/appointments/entities/appointment.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ){}

  async create(
    createMedicalRecordDto: CreateMedicalRecordDto,
    staffCreatedId: string,
  ): Promise<ResponseType> {
    try {
      const { patientId, appointmentId, visitDate } = createMedicalRecordDto;

      if (!ObjectId.isValid(patientId) || !ObjectId.isValid(staffCreatedId)) {
        throw new BadRequestException('Invalid id');
      }

      if (appointmentId !== undefined) {
        if (!ObjectId.isValid(appointmentId)) {
          throw new BadRequestException('Invalid id');
        }
      }


      const patient = await this.userModel.findById(patientId).exec();
      if (!patient || patient.role !== 'patient') {
        throw new BadRequestException('Patient not found');
      }

      //Check if appointmentId exists AND is not empty string
      if (appointmentId && appointmentId.trim() !== '') {
        const appointment = await this.appointmentModel.findById(appointmentId).exec();
        if (!appointment || appointment.patientId.toString() !== patient._id.toString()) {
          throw new BadRequestException('Appointment not found or does not belong to this patient');
        }
      }

      const roles = ['staff', 'admin'];

      const staff = await this.userModel.findById(staffCreatedId).exec();
      if (!staff || !roles.includes(staff.role)) {
        throw new BadRequestException('Staff not found');
      }

      const visitDateObj = new Date(visitDate);
      if (visitDateObj > new Date()) {
        throw new BadRequestException('Visit date cannot be in the future');
      }

      const newMedicalRecord = await this.medicalRecordModel.create({
        ...createMedicalRecordDto,
        staffCreatedId,
        visitDate: visitDateObj,
      });

      return {
        status: 201,
        message: 'Medical record created successfully',
        origin: 'MedicalRecordsService.create',
        data: newMedicalRecord,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    page: number, 
    search?: string, 
    startDate?: Date, 
    endDate?: Date, 
    patientId?: string, 
    staffId?: string,
    diagnosis?: string
  ): Promise<ResponseType> {
    try {
      const limit = 10;
      const skip = ((page ? page : 1) - 1) * limit;

      const queryBuilder: any = {};

      // Filter by patient ID (for viewing specific patient's records)
      if (patientId) {
        if (!ObjectId.isValid(patientId)) {
          throw new BadRequestException('Invalid patient id');
        }
        queryBuilder['patientId'] = patientId;
      }

      // Filter by staff ID (for viewing records created by specific staff)
      if (staffId) {
        if (!ObjectId.isValid(staffId)) {
          throw new BadRequestException('Invalid staff id');
        }
        queryBuilder['staffCreatedId'] = staffId;
      }

      // Filter by date range
      if (startDate || endDate) {
        queryBuilder['visitDate'] = {};
        if (startDate) queryBuilder['visitDate']['$gte'] = new Date(startDate);
        if (endDate) queryBuilder['visitDate']['$lte'] = new Date(endDate);
      }

      // Search in chief complaint, notes, or diagnosis
      if (search) {
        queryBuilder['$or'] = [
          { chiefComplaint: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { diagnosis: { $regex: search, $options: 'i' } },
        ];
      }

      console.log('QueryBuilder:', queryBuilder);

      const medicalRecords = await this.medicalRecordModel
        .find(queryBuilder)
        .populate('patientId', 'name email phoneNumber')
        .populate('staffCreatedId', 'name email')
        .populate('appointmentId')
        .skip(skip)
        .limit(limit)
        .sort({ visitDate: -1 })
        .exec();

      const data = {
        limit: limit,
        data: medicalRecords,
        nextPage: medicalRecords.length < limit ? null : page + 1,
        previousPage: page > 1 ? page - 1 : null,
      };

      return {
        status: 200,
        message: 'Medical records fetched successfully',
        origin: 'MedicalRecordsService.findAll',
        data: data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
