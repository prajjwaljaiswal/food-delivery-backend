import { UserEntity } from './user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { Restaurant } from '../../../Resturent-Entites/restaurant.entity';
// import { Product } from '../../product/entities/product.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Restaurant } from './admin-restaurant.entity';
// import { Product } from './product.entity';
import { MenuItem } from './resturant-menu.entity';
import { Driver } from './driver/driver_Info.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  /* ---------------- User & Restaurant Info ---------------- */
  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  restaurant: Restaurant;

  @Column({ type: 'varchar', nullable: true })
  updatedByAdminId?: string;

  /* ---------------- Products in Order ---------------- */
  @ManyToMany(() => MenuItem, { eager: true })
  @JoinTable()
  MenuItem: MenuItem[];

  // /* ---------------- Driver / Delivery Info ---------------- */
  // @ManyToOne(() => Driver, { nullable: true, eager: true })
  // driver: Driver | null;

  /* ---------------- Payment & Pricing ---------------- */
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paymentMethod?: string; // Example: 'Cash on Delivery', 'UPI', 'Card'

  @Column({ nullable: true })
  addressId?: number;

  /* ---------------- Timestamps ---------------- */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
