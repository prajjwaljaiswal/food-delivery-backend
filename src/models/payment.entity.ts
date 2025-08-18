import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
// import { Order } from 'src/Admin/orders/entities/order.entity';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';
import { PaymentMethod } from 'src/common/enums/Payment-method.enum';
import { Order } from './order.entity';


@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.id)
  order: Order;

  // @ManyToOne(() => User, user => user.payments)
  // user: UserEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ nullable: true })
  transactionId: string;


  @CreateDateColumn()
  createdAt: Date;
}
