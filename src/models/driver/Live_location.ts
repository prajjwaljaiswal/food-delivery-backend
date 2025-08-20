// driver-tracking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Driver } from './driver_Info.entity';

@Entity()
export class DriverTracking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Driver, (driver) => driver.trackingRecords, { onDelete: 'CASCADE' })
    driver: Driver;

    @Column({ type: 'float' })
    lat: number;

    @Column({ type: 'float' })
    lng: number;

    @CreateDateColumn()
    timestamp: Date;
}
