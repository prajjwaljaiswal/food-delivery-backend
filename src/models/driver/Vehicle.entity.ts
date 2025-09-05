import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./driver_Info.entity";

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // Bike, Car, Van

  @Column({ unique: true, nullable: true })
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


    @ManyToOne(() => Driver, driver => driver.vehicles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @DeleteDateColumn({ nullable: true }) // ✅ Soft delete ke liye ye column add karein
  deletedAt: Date;
}
