import { Controller, Body, Post, Get, Request } from '@nestjs/common';
import { SignInDto } from './dto/sign-in-dto';
import { AuthService } from './auth.service';
import { json } from 'stream/consumers';
import { AuthGuard } from './auth.guard';
import { UseGuards } from '@nestjs/common';
import { ResetPasswordDto, SendOtpDto, VerifyEmailDto } from './dto/send-otp-dto';
import { Send } from 'express';
import { Role, RolesGuard } from './auth.user';
import { CreatePatientDTO, CreateUserDto } from 'src/users/dto/create-user.dto';
import { CustomThrottlerGuard } from 'lib/customThrottle';

@Controller('api')
export class AuthController {
    constructor(private authService: AuthService) {}

    //PATIENT LOGIN
    @Post('login')
    signIn(@Body() signInDto:SignInDto) {
       const val = this.authService.signIn(signInDto.email, signInDto.password, 'patient');
       return val;
    }

    //ADMIN LOGIN
    @Post('admin-login')
    signInAdmin(@Body() signInDto:SignInDto) {
       const val = this.authService.signIn(signInDto.email, signInDto.password, 'admin');
       return val;
    }

    //STAFF LOGIN
    @Post('staff-login')
    signInStaff(@Body() signInDto:SignInDto) {
       const val = this.authService.signIn(signInDto.email, signInDto.password, 'staff');
       return val;
    }

    @UseGuards(AuthGuard, CustomThrottlerGuard)
    @Get('protected')
    getProtectedResource(@Request() req) {
        return { message: 'This is a protected resource', user: req.user };
    }

    //patient
    @Post('register')
    register(@Body() registerDto : CreatePatientDTO) {
        const val = this.authService.register(registerDto);
        return val;
    }

    //staff
    @Post('register-staff')
    registerStaff(@Body() registerDto : CreateUserDto) {
        const val = this.authService.registerStaff(registerDto);
        return val;
    }

    @Post('send-otp')
    sendOtp(@Body() data : SendOtpDto) {
        const val = this.authService.sendOtp(data);
        return val;
    }

    @Post('verify-otp')
    verifyEmail(@Body() data : VerifyEmailDto) {
        const val = this.authService.verifyEmail(data.email, data.otp);
        return val;
    }

    @Post('forgot-password')
    resetLink(@Body() data : SendOtpDto) {
        const val = this.authService.resetLink(data);
        return val;
    }

    @Post('forgot-password-token')
    verifyResetCode(@Body() data : VerifyEmailDto) {
        const val = this.authService.verifyResetCode(data);
        return val;
    }

    @Post('reset-password')
    resetPassword(@Body() data : ResetPasswordDto) {
        const val = this.authService.resetPassword(data);
        return val;
    }

    //NEXT JS VERIFICATION ROUTE
    @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard) // for roles
    @Role('patient')
    @Get('verify-user')
    setUser(@Request() req) {
        return this.authService.user(req.user);
    }

    @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard) // for roles
    @Role('admin')
    @Get('verify-admin')
    setAdmin(@Request() req) {
        return this.authService.user(req.user);
    }

    @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard) // for roles
    @Role('staff')
    @Get('verify-staff')
    setStaff(@Request() req) {
        return this.authService.user(req.user);
    }

    @UseGuards(AuthGuard, RolesGuard, CustomThrottlerGuard) // for roles
    @Role('staff', 'admin')
    @Get('verify-all')
    setAll(@Request() req) {
        return this.authService.user(req.user);
    }
}
