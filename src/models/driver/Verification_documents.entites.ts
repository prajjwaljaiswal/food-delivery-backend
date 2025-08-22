// src/admin/driver/entities/verification-document.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Driver } from './driver_Info.entity';
import { IsOptional } from 'class-validator';


@Entity('verification_documents')
export class VerificationDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, driver => driver.verificationDocuments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @IsOptional()
  @Column()
  driverId?: number;

  @Column({ nullable: true })
  drivingLicense?: string;

  @Column({ nullable: true })
  idProof?: string;

  @Column({ nullable: true })
  backgroundCheck?: string;

  @Column({ nullable: true })
  addressProof?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
}
