// src/driver/entities/driver.entity.ts

import { IsOptional, IsString } from 'class-validator';
import { Order } from '../order.entity';
import { RoleEntity } from '../role.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    OneToOne,
    DeleteDateColumn,
} from 'typeorm';
import { DriverTracking } from './Live_location';
import { DriverEarnings } from './driver_Earnings_payout';
import { DriverPerformance } from './driver_Performance';
import { DriverDocument } from './Verification_documents';
import { Vehicle } from './Vehicle.entity';

export enum DriverStatus {
    PENDING = 'pending',   // when added but not yet approved
    APPROVED = 'approved',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended',
}

@Entity()
export class Driver {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;



    @Column()
    address: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    password: string;

    @ManyToOne(() => RoleEntity, {  onDelete: 'SET NULL' })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;


    @OneToMany(() => Order, order => order.driver)
    orders: Order[];

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    profile?: string;

    // ✅ Driver current status
    @Column({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.PENDING,
    })
    status: DriverStatus;

    @Column({ default: false })
    isAvailable: boolean;


    // ✅ Vehicle details
    @OneToMany(() => Vehicle, (vehicle) => vehicle.driver)
    vehicles: Vehicle[];

    // ✅ Verification documents
    @OneToMany(() => DriverDocument, (doc) => doc.driver)
    documents: DriverDocument[];

    // Earnings & Payout
    @OneToMany(() => DriverEarnings, earning => earning.driver)
    earnings: DriverEarnings[];

    // ✅ Performance tracking
    @OneToOne(() => DriverPerformance, (perf) => perf.driver)
    performance: DriverPerformance;

    // Live Location
    @OneToMany(() => DriverTracking, (tracking) => tracking.driver)
    trackingRecords: DriverTracking[];

}
