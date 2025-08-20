// src/driver/entities/driver-earnings.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver_Info.entity';

@Entity()
export class DriverEarnings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, driver => driver.earnings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column()
  driverId: number;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'failed';

  @Column({ nullable: true, type: 'timestamp' })
  payoutAt: Date;

  @CreateDateColumn()
  created_at: Date;
}
