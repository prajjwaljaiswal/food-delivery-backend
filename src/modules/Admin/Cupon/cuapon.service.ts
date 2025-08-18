import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from 'src/models';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto) {
    console.log('Creating new coupon:', dto);
    const exists = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new Error('Coupon code already exists.');
    }
    const coupon = this.couponRepo.create(dto);
    return await this.couponRepo.save(coupon);
  }

  async findAll() {
    return this.couponRepo.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: number, dto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, dto);
    return this.couponRepo.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    return this.couponRepo.remove(coupon);
  }

  // Optional: validate coupon code
  async validateCode(code: string, orderAmount: number) {
    const now = new Date();
    const coupon = await this.couponRepo.findOne({ where: { code, is_active: true } });
    if (!coupon) throw new NotFoundException('Invalid or inactive coupon');

    if (coupon.start_date && now < new Date(coupon.start_date)) {
      throw new Error('Coupon not yet valid');
    }

    if (coupon.end_date && now > new Date(coupon.end_date)) {
      throw new Error('Coupon expired');
    }

    if (orderAmount < coupon.min_order_amount) {
      throw new Error(`Order must be at least ₹${coupon.min_order_amount} to use this coupon`);
    }

    let discount = 0;
    if (coupon.type === 'flat') {
      discount = Number(coupon.value);
    } else if (coupon.type === 'percentage') {
      discount = (orderAmount * Number(coupon.value)) / 100;
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    }

    return {
      code: coupon.code,
      discount: +discount.toFixed(2),
    };
  }
}
