import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from 'src/models';
import { CouponService } from './cuapon.service';
import { CouponController } from './cuapon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
