import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Driver } from "./driver_Info.entity";

@Entity('driver_performance')
export class DriverPerformance {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Driver, (driver) => driver.performance, { onDelete: 'CASCADE' })
    @JoinColumn()
    driver: Driver;

    @Column({ default: 0 })
    completedDeliveries: number;

    @Column({ type: 'float', default: 0 })
    averageRating: number;

    @Column({ default: 0 })
    cancellations: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
