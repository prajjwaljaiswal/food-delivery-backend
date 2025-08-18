import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/models';
import { RestaurantController } from './profile.controller';
import { RestaurantService } from './profile.service'; import { JwtModule } from '@nestjs/jwt';
import { DeviceToken, UserEntity, Otp } from 'src/models';
import { EmailService } from 'src/common/email/email.service';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, DeviceToken, UserEntity, Otp]),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // ✅ Make sure this is defined
      signOptions: { expiresIn: '1d' }, // optional
    }), // add any required options here
    EmailModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService], // optional: if other modules need this service
})
export class RestaurantProfileModule { }
