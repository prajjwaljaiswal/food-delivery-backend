// src/common/entities/coupon.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  type: 'flat' | 'percentage'; // 'flat' or 'percentage'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // either flat amount or percentage

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  max_discount?: number; // used for percentage coupons

  @Column()
  min_order_amount: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
