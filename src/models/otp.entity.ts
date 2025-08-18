import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ name: 'otp_code' })
  otpCode: string;

  @Column({ name: 'otp_type' })
  otpType: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;
  @Column({ name: 'otpable_type', type: 'varchar', nullable: true })
  otpableType: string;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
