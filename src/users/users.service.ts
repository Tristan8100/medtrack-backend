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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

    // if (updateUserDto.password) {
    //   updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    // }

    const updateUser = await this.userModel
      .findByIdAndUpdate(user.id, updateUserDto, { new: true })
      .exec();

    if (!updateUser) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    return updateUser;
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

}
