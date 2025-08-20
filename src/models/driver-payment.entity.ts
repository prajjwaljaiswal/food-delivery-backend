// src/driver-payments/entities/driver-payment.entity.ts

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
// import { Order } from 'src/Admin/orders/entities/order.entity';
import { PaymentStatus } from 'src/common/enums/payment-status.enum'; import { Driver } from './driver/driver_Info.entity';
import { Order } from './order.entity';


@Entity()
export class DriverPayment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.id)
    order: Order;

    @ManyToOne(() => Driver, driver => driver.id)
    driver: Driver;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus;

    @Column({ nullable: true })
    transactionId: string;

    @CreateDateColumn()
    createdAt: Date;
}
