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
import { Vehicle } from './Vehicle.entity';
import { VerificationDocument } from './Verification_documents.entites';

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

    @ManyToOne(() => RoleEntity, { onDelete: 'SET NULL' })
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

    @Column({ nullable: true })
    gender?: string;  // e.g., 'male', 'female', 'other'

    @Column({ type: 'date', nullable: true })
    dob?: Date;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;


    @Column()
    type: string; // Bike, Car, Van



    @Column({ nullable: true })
    pincode?: string;
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

    @OneToMany(() => VerificationDocument, (doc) => doc.driver, { cascade: true })
    verificationDocuments: VerificationDocument[];
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
