import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';

import { AuthGuard } from 'src/auth/auth.guard';
import { Role, RolesGuard } from 'src/auth/auth.user';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  // @UseGuards(AuthGuard, RolesGuard) // for roles
  // @Role('staff')
  // @Get()
  // async findAll() {
  //   return {message: "endpoint hit"};
  // }

  
  @UseGuards(AuthGuard, RolesGuard)
  @Role('staff', 'admin')
  @Post()
  async create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @Request() req,
  ) {
    return await this.medicalRecordsService.create(
      createMedicalRecordDto,
      req.user.id, // staffCreatedId from auth user
    );
  }

  // For staff and admin - view all medical records with filters
  @UseGuards(AuthGuard, RolesGuard)
  @Role('admin', 'staff')
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.medicalRecordsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      //non existent
    );
  }

  // For patients - view their own medical records
  @UseGuards(AuthGuard, RolesGuard)
  @Role('patient')
  @Get('/my-records')
  async findAllMyRecords(
    @Request() req,
    @Query('page') page: ParseIntPipe,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('diagnosis') diagnosis?: string,
  ) {
    return this.medicalRecordsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      diagnosis,
      req.user.id, // Filter by patient's own ID
    );
  }

  // For staff and admin - view specific patient's medical records
  @UseGuards(AuthGuard, RolesGuard)
  @Role('admin', 'staff')
  @Get('/user-records/:id')
  async findAllOneUserRecords(
    @Param('id') id: string,
    @Query('page') page: ParseIntPipe,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('diagnosis') diagnosis?: string,
  ) {
    return this.medicalRecordsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      diagnosis,
      id, // Filter by specific patient ID
    );
  }

}
