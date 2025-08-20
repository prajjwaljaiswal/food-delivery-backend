// driver-document.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from './driver_Info.entity';

@Entity('driver_documents')
export class DriverDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, (driver) => driver.documents, { onDelete: 'CASCADE' })
  driver: Driver;

  @Column()
  type: string; 
  // e.g. "ID_PROOF", "LICENSE", "BACKGROUND_CHECK"

  @Column()
  fileUrl: string; // file path or uploaded URL

  @Column({ default: 'pending' })
  status: string; 
  // "pending", "approved", "rejected"

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  verifiedBy: number; // Admin user id

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
