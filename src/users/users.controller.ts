import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/auth.user';

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

  @UseGuards(AuthGuard, RolesGuard)
  @Get('my-profile')
  myProfile(@Request() req) {
    console.log("userrrrr", req.user);
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('me')
  me(@Request() req) {
    console.log("userrrrr", req.user);
    return { user: req.user };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch()
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
