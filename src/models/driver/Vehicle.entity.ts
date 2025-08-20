import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./driver_Info.entity";

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string; // Bike, Car, Van

    @Column({ unique: true })
    licensePlate: string;

    @Column({ nullable: true })
    insuranceNumber: string;

    @Column({ nullable: true })
    rcBookNumber: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    color: string;

    @Column({ nullable: true })
    year: number;

    // Relation with Driver
    @ManyToOne(() => Driver, (driver) => driver.vehicles, { onDelete: 'CASCADE' })
    driver: Driver;
}
