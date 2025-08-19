// src/driver/entities/driver.entity.ts

import { IsOptional, IsString } from 'class-validator';
import { Order } from './order.entity';
import { RoleEntity } from './role.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

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

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column()
    address: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    password: string;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    image?: string;

    // ✅ Driver current status
    @Column({
        type: 'enum',
        enum: DriverStatus,
        default: DriverStatus.PENDING,
    })
    status: DriverStatus;

    // ✅ Vehicle details
    @Column({ nullable: true })
    vehicleType: string; // e.g., Bike, Car, Van

    @Column({ nullable: true, unique: true })
    licensePlate: string;

    @Column({ nullable: true })
    insuranceNumber: string;

    @Column({ nullable: true })
    rcBookNumber: string;

    // ✅ Verification documents
    @Column({ nullable: true })
    idProof: string; // path or url to ID proof

    @Column({ nullable: true })
    licenseDoc: string; // path or url to driving license

    @Column({ nullable: true })
    backgroundCheck: string; // path or url to background check doc

    // ✅ Availability (online/offline for accepting deliveries)
    @Column({ default: false })
    isAvailable: boolean;

    // ✅ Performance tracking
    @Column({ default: 0 })
    completedDeliveries: number;

    @Column({ type: 'float', default: 0 })
    averageRating: number;

    @Column({ default: 0 })
    cancellations: number;

    @OneToMany(() => Order, (order) => order.driver)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
