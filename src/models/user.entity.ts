// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { DeviceToken } from './device-token.entity';
import { Order } from './order.entity';
import { AddressEntity } from './address.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

 @ManyToOne(() => RoleEntity, (role) => role.users, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;


  // Inside @Entity class (bottom me add karo)
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];


  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @OneToMany(() => AddressEntity, (address) => address.user, { cascade: true })
  addresses: AddressEntity[];


  @Column({ type: 'varchar', name: 'pincode', nullable: true })
  pincode?: string;

  @Column({ name: 'zip_code', type: 'varchar', nullable: true })
  zipCode?: string;

  

@Column({ type: 'text', nullable: true })
refreshToken?: string;


  @Column({ type: 'varchar' })
  password: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_otp_verified', type: 'boolean', nullable: true, default: false })
  isOtpVerified?: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: 'verification_code', type: 'varchar', nullable: true })
  verificationCode?: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'profile_image', type: 'varchar', nullable: true })
  profileImage?: string;

  @Column({ type: 'tinyint', default: 0, nullable: true })
  status: number;

  @Column({ name: 'remember_token', type: 'varchar', nullable: true })
  rememberToken?: string;

  @Column({ name: 'device_token', type: 'text', nullable: true })
  deviceToken?: string;

  @Column({ name: 'preferred_language', type: 'varchar', length: 5, default: 'en' })
  preferredLanguage: string;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deletedAt?: Date;


  @OneToMany(() => DeviceToken, (device) => device.user)
  deviceTokens: DeviceToken[];
}
