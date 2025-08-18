import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponService } from './cuapon.service';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';



// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles(RoleEnum.ADMIN)
@Controller('admin/coupons')
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  // Optional: Validate coupon by code and order amount
  @Get('/validate/code')
  validateCoupon(
    @Query('code') code: string,
    @Query('orderAmount') orderAmount: string,
  ) {
    return this.service.validateCode(code, parseFloat(orderAmount));
  }
}
