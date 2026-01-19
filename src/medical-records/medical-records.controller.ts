import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe, Put } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';

import { AuthGuard } from 'src/auth/auth.guard';
import { Role, RolesGuard } from 'src/auth/auth.user';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/create-medical-record.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

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
  @Get('/my-records') // for future use, patients should not be able to view any medical records
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
      id
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Role('admin', 'staff')
  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Request() req
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto, req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Role('admin', 'staff')
  @Delete(':id')
  async delete(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.medicalRecordsService.delete(id, req.user.id);
  }


}
