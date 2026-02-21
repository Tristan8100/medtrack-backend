import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreatePatientDTO, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { ResponseType } from 'lib/type';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';
import { PhoneVerification, PhoneVerificationDocument } from 'src/auth/entities/phone-verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(PhoneVerification.name)
    private readonly phoneVerificationModel: Model<PhoneVerificationDocument>,
  ) {}

  private async checkEmailExists(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const query: any = { email };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existingUser = await this.userModel.findOne(query).exec();

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    await this.checkEmailExists(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.userModel.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      email_verified_at: null,
      phoneNumber: createUserDto.phoneNumber,
      role: createUserDto.role || 'patient',
    });
  }

  async createPatient(createUserDto: CreatePatientDTO): Promise<UserDocument> {
    await this.checkEmailExists(createUserDto.email);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.userModel.create({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      email_verified_at: null,
      phoneNumber: createUserDto.phoneNumber,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<UserDocument> {
    const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;

    const user = await this.userModel
      .findById(objectId)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    user: any,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const userData = await this.findOne(user.id);
    if (!userData) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    // If phoneNumber is being updated
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== userData.phoneNumber) {
      // Reset phone verification
      await this.userModel
      .findByIdAndUpdate(user.id, {phone_verified_at: null}, { new: true })
      .exec();

      // Send new verification code
      await this.sendPhoneVerification(user.id);
    }

    const updateUser = await this.userModel
      .findByIdAndUpdate(user.id, updateUserDto, { new: true })
      .exec();

    if (!updateUser) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    return updateUser;
  }

  async sendPhoneVerification(id: string): Promise<ResponseType> {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const phoneRecord = await this.phoneVerificationModel.findOne({ phoneNumber: user.phoneNumber }).exec();

    let codeRecord;
    
    if (user.phoneNumber) {
      if(!user.phone_verified_at){
        // send verification
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        if (phoneRecord) {
          const dbNow = Date.now();
          const cooldown = phoneRecord.updated_at.getTime() + 60 * 1000 > dbNow;
          if (cooldown) {
            throw new BadRequestException('Please wait before requesting another code');
          }

          codeRecord = await this.phoneVerificationModel.findOneAndUpdate(
            { phoneNumber: user.phoneNumber },
            { $set: { code } },
            { new: true },
          ).exec();
        } else {
          codeRecord = await this.phoneVerificationModel.create({
            phoneNumber: user.phoneNumber,
            code,
          });
        }
      } else {
        throw new BadRequestException('Phone number already verified'); //put null if changed
      }
    } else {
      throw new BadRequestException('Phone number not found');
    }

    console.log("THE CODE IS:" + codeRecord.code);

    return {
      status: 200,
      message: 'Verification code sent successfully',
      origin: 'UsersService.sendPhoneVerification',
      data: { codeRecord }, //remove!!
    };
  }
  
  async verifyPhone(phoneNumber: string, code: string, id: string): Promise<ResponseType> {
    //check if code exist
    const codeRecord = await this.phoneVerificationModel.findOne({ phoneNumber }).exec();
    if (!codeRecord) throw new BadRequestException('Invalid verification code');

    //custom throttle
    const dbNow = Date.now();
    if (codeRecord.updated_at.getTime() + 10 * 60 * 1000 < dbNow) {
      throw new BadRequestException('Verification code expired');
    }

    //check if code is correct
    if (codeRecord.code !== code) throw new BadRequestException('Invalid verification code');

    //check if user owns phone
    const user = await this.userModel.findOne({ _id: id, phoneNumber }).exec();
    if (!user) throw new BadRequestException('User not found');

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { phone_verified_at: new Date() },
      { new: true }
    ).exec();

    if (!updatedUser) throw new BadRequestException('User not found');
    
    await this.phoneVerificationModel.deleteOne({ phoneNumber }).exec();

    return {
      status: 200,
      message: 'Phone number verified successfully',
      origin: 'UsersService.verifyPhone',
      data: { message: 'Phone number verified successfully' },
    };
  }

  async updatePassword(id: string, data : UpdateUserPasswordDto): Promise<any> {
    const { currentPassword, password, confirmPassword } = data;

    try{
      if (password !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      //find user
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      //check password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await this.userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).exec();
      
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return {message: 'Password updated successfully'};

      } catch (error) {
        console.log(error);
        throw new BadRequestException(error.message);
      }
  }

  async remove(id: string | Types.ObjectId): Promise<void> {
    const user = await this.findOne(id);
    await user.deleteOne();
  }

  async getAllUsers(page: number, search?: string, role?: string): Promise<ResponseType> {
    try {
      const limit = 10;
      const currentPage = page && page > 0 ? page : 1;
      const skip = (currentPage - 1) * limit;

      const queryBuilder: any = {};

      // Filter by role
      if (role) {
        //console.log(role);
        queryBuilder.role = role;
      }

      // Search by name or email
      if (search) {
        queryBuilder.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await this.userModel
        .find(queryBuilder)
        .select('-password')// Remove!!
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 })
        .exec();

      const data = {
        data: users,
        nextPage: users.length < limit ? null : page + 1,
        prevPage: page > 1 ? page - 1 : null,
      };

      return {
        status: 200,
        message: 'Users fetched successfully',
        origin: 'UsersService.getAllUsers',
        data: data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateStaffProfile(id: string, userId: string, data: UpdateUserDto): Promise<ResponseType> {
    try {
      if(!ObjectId.isValid(id) || !ObjectId.isValid(userId)){
        throw new BadRequestException('Invalid user id');
      }
      const user = await this.userModel.findById(id).exec();
      const admin = await this.userModel.findById(userId).exec();

      if (!admin || admin.role !== 'admin') {
        throw new BadRequestException('You are not an admin');
      }
      if (!user || user.role !== 'staff') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();

      return {
        status: 200,
        message: 'User status updated successfully',
        origin: 'UsersService.updateStaffStatus',
        data: updatedUser,
      };

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteStaff(id: string, userId: string): Promise<ResponseType> {
    try {
      if(!ObjectId.isValid(id) || !ObjectId.isValid(userId)){
        throw new BadRequestException('Invalid user id');
      }
      const user = await this.userModel.findById(id).exec();
      const admin = await this.userModel.findById(userId).exec();

      if (!admin || admin.role !== 'admin') {
        throw new BadRequestException('You are not an admin');
      }
      if (!user || user.role !== 'staff') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const deleted = await this.userModel.findByIdAndDelete(id);

      return {
        status: 200,
        message: 'User deleted successfully',
        origin: 'UsersService.deleteStaff',
        data: deleted,
      };

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
