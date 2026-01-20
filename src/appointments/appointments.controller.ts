import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, StatusDTO } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role, RolesGuard } from 'src/auth/auth.user';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Role('patient')
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Role('admin', 'staff')
  @Get()
  async findAll(
    @Query('page') page: ParseIntPipe,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('status') status?: string,
    //@Request() req? : any
  ) {
    return this.appointmentsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      status,
      //req.user.id
    );
  }

  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Role('patient')
  @Get('/my-appointments')
  async findAllMyAppointments(
    @Request() req,
    @Query('page', ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      status,
      req.user.id
    );
  }

  @UseGuards(AuthGuard, RolesGuard) // for roles //NOT YET TESTED
  @Role('admin', 'staff')
  @Get('/user-appointments/:id') // for staffs and admin
  async findAllOneUserAppointments(
    @Param('id') id: string, // Get all one user appointment
    @Query('page') page: ParseIntPipe,
    @Query('search') search?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll(
      Number(page) || 1,
      search,
      startDate,
      endDate,
      status,
      id
    );
  }

  //SET STATUS
  @UseGuards(AuthGuard, RolesGuard) // for roles
  //@Role('admin', 'staff')
  @Patch(':id')
  setStatus(@Param('id') id: string, @Body() statusDto: StatusDTO, @Request() req) {
    return this.appointmentsService.setStatus(id, statusDto.status, req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard) // for roles
  @Role('patient')
  @Get('my-dashboard')
  remove(@Request() req) {
    return this.appointmentsService.getDashboard(req.user.id);
  }

}
