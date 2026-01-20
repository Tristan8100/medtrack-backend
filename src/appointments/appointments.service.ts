import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAppointmentDto, StatusDTO } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './entities/appointment.entity';
import { ObjectId } from 'mongodb';
import { INVALID_TRANSITIONS, ResponseType } from 'lib/type';
import { UserDocument, User } from 'src/users/entities/user.entity';
import { In } from 'typeorm';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
      const limit = 10; //not dynamic
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


      const appointments = await this.appointmentModel.find(queryBuilder).populate('patientId', 'name email').populate('staffId', 'name email').skip(skip).limit(limit).sort({ date: -1 }).exec();
      //const count = await this.appointmentModel.countDocuments(queryBuilder).exec();
      //console.log('Count:', count);
      
      const data = {
        limit: limit,
        data: appointments,
        nextPage: appointments.length < limit ? null : page + 1,
        previousPage: page > 1 ? page - 1 : null
      }
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

  async setStatus(id: string, status: StatusDTO['status'], userId: string): Promise<ResponseType> {
    try {
      // Validate appointment ID
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid id');
      }

      // Fetch user
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Fetch appointment
      const appointment = await this.appointmentModel.findById(id).exec();
      if (!appointment) {
        throw new BadRequestException('Appointment not found');
      }

      // ROLE BASED VALIDATION!!
      if (user.role === 'patient') {
        // Patients can only set status to 'cancelled'
        if (status !== 'cancelled') {
          throw new BadRequestException('Patients can only cancel appointments');
        }
      } else if (user.role === 'staff' || user.role === 'admin') {
        // Staff/Admin cannot set status to 'cancelled'
        if (status === 'cancelled') {
          throw new BadRequestException('Staff/Admin cannot cancel appointments');
        }
      } else {
        throw new BadRequestException('Invalid user role');
      }

      // Prevent invalid status transitions (from current status to new status)
      if (INVALID_TRANSITIONS[appointment.status].includes(status)) {
        throw new BadRequestException(
          `Cannot change status from '${appointment.status}' to '${status}'`
        );
      }

      if (
        status === 'no-show' &&
        appointment.date.toDateString() !== new Date().toDateString()
      ) {
        throw new BadRequestException(
          'You can only set status to "no-show" for appointments on the same day',
        );
      }


      // Update appointment status
      const updated = await this.appointmentModel.findByIdAndUpdate(
        id,
        { status, staffId: user.role === 'staff' || user.role === 'admin' ? user._id : null },
        { new: true }
      ).exec();

      return {
        status: 200,
        message: 'Status updated successfully',
        origin: 'AppointmentsService.setStatus',
        data: updated
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getDashboard(patientId: string) {
    if (!ObjectId.isValid(patientId)) {
      throw new BadRequestException('Invalid patient ID');
    }

    const now = new Date();

    // Upcoming appointment
    const upcoming = await this.appointmentModel
      .findOne({
        patientId,
        date: { $gte: now },
        status: { $in: ['pending', 'scheduled'] },
      })
      .populate('staffId', 'name email')
      .sort({ date: 1 })
      .lean();

    // Stats
    const statsAgg = await this.appointmentModel.aggregate([
      { $match: { patientId: this.appointmentModel.base.Types.ObjectId.createFromHexString(patientId) } }, // Aggragate risky
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      pending: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      declined: 0,
      'no-show': 0,
      late: 0,
    };
    statsAgg.forEach(s => (stats[s._id] = s.count));

    // Recent timeline (last 5)
    const recent = await this.appointmentModel
      .find({ patientId })
      .populate('staffId', 'name')
      .sort({ date: -1 })
      .limit(5)
      .lean();

    return {
      upcoming,
      stats,
      recent,
    };
  }


}
