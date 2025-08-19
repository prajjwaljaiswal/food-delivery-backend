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
import { Product } from './product.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  /* ---------------- User & Restaurant Info ---------------- */
  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true })
  user: UserEntity;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, { eager: true })
  restaurant: Restaurant;

  /* ---------------- Products in Order ---------------- */
  @ManyToMany(() => Product, { eager: true })
  @JoinTable()
  products: Product[];

  /* ---------------- Driver / Delivery Info ---------------- */
  @ManyToOne(() => UserEntity, { nullable: true, eager: true })
  driver: UserEntity | null;

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
  couponCode?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  /* ---------------- Order Actions ---------------- */
  @Column({ nullable: true })
  action?: string; // Example: 'Cancelled by User', 'Rejected by Restaurant'

  /* ---------------- Timestamps ---------------- */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
