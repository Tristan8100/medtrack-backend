import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './entities/appointment.entity';
import { ObjectId } from 'mongodb';
import { ResponseType } from 'lib/response-type';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ){}

  async create(createAppointmentDto: CreateAppointmentDto, patientId: string): Promise<ResponseType> {
    try {
        if(!ObjectId.isValid(patientId)){
          throw new BadRequestException('Invalid patient id')
        }

        const appointmentDate = new Date(createAppointmentDto.date);
        if(appointmentDate < new Date()){
          console.log('Invalid date');
          throw new BadRequestException('Invalid date');
        }

        const newAppointment = await this.appointmentModel.create({
          ...createAppointmentDto,
          patientId
        })

        return {
          status: 201,
          message: 'Appointment created successfully',
          origin: 'AppointmentsService.create',
          data: newAppointment
        };

    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  //for staffs and admin
  async findAll(page: number, search?: string, startDate?: Date, endDate?: Date, status?: string, userId?: string): Promise<ResponseType> {
    try {
      const limit = 10;
      const skip = ((page ? page : 1 ) -1) * limit;

      const queryBuilder = {}
    
      if(status){
        queryBuilder['status'] = status
      }

      if(startDate || endDate){
        queryBuilder['date'] = {};  // initialize first!!!!!
        if(startDate) queryBuilder['date']['$gte'] = startDate;
        if(endDate) queryBuilder['date']['$lte'] = endDate;
      }

      if(search){
        queryBuilder['$or'] = [
          { chiefComplaint: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
        ]
      }

      if(userId){
        queryBuilder['patientId'] = userId;
      }
      console.log('QueryBuilder:', queryBuilder);


      const data = await this.appointmentModel.find(queryBuilder).populate('patientId', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
      
      return {
        status: 200,
        message: 'Appointments fetched successfully',
        origin: 'AppointmentsService.findAll',
        data: data
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
