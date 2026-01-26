import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role, RolesGuard } from 'src/auth/auth.user';
import { CustomThrottlerGuard } from 'lib/customThrottle';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  findAll() {
    return this.usersService.findAll();
  }

  //UPDATED
  @Get('all')
  async getAllUsers(@Query('page') page?: string, @Query('search') search?: string, @Query('role') role?: string) {
      return await this.usersService.getAllUsers(page ? Number(page) : 1, search, role,);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(id);
  // } //will error at the bottom

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Get('my-profile')
  myProfile(@Request() req) {
    console.log("userrrrr", req.user);
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Get('me')
  me(@Request() req) {
    console.log("userrrrr", req.user);
    return { user: req.user };
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Role('admin', 'staff')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  } //should be here at the bottom

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Patch() //update name
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Patch('password') //update password
  updatePassword(@Request() req, @Body() updateUserDto: UpdateUserPasswordDto) {
    return this.usersService.updatePassword(req.user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Role('admin')
  @Put('staff/:id')
  updateStaffProfile(@Param('id') id: string, @Request() req, @Body() data: UpdateUserDto) {
    return this.usersService.updateStaffProfile(id, req.user.id, data);
  }

  @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard)
  @Role('admin')
  @Delete('staff/:id')
  deleteStaff(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteStaff(id, req.user.id);
  }
}
