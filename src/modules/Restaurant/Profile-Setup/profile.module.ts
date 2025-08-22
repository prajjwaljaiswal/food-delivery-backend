import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/models';
import { RestaurantController } from './profile.controller';
import { RestaurantService } from './profile.service'; import { JwtModule } from '@nestjs/jwt';
import { DeviceToken, UserEntity, Otp, RoleEntity } from 'src/models';
import { EmailService } from 'src/common/email/email.service';
import { EmailModule } from 'src/common/email/email.module';
import { JwtUtil } from 'src/common/utils/jwt.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, DeviceToken, UserEntity, Otp, RoleEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'wuMTXyB2YAMUSOZZ5WVygkezaufs3LPSsvhPXLKZCpVX6P0ro9VwtINsq7yb3P24',
      signOptions: { expiresIn: '7d' },
    }),
    EmailModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, JwtUtil],
  exports: [RestaurantService], // optional: if other modules need this service
})
export class RestaurantProfileModule { }
