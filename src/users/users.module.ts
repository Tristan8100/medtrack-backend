import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { PhoneVerification, PhoneVerificationSchema } from 'src/auth/entities/phone-verification.entity';
import { TwilioService } from './phone-verification.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: PhoneVerification.name, schema: PhoneVerificationSchema }])], // ADDED
  controllers: [UsersController],
  providers: [UsersService, TwilioService],
  exports: [UsersService], // ADDED when using on other modules
})
export class UsersModule {}
