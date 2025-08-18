import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity({ name: 'device_tokens' })
export class DeviceToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true }) // ✅ Made nullable
  user_id?: number;

  @Column({ name: 'restaurant_id', type: 'bigint', unsigned: true, nullable: true }) // ✅ Made nullable
  restaurant_id?: number;


  @Column({ name: 'driver_id', type: 'bigint', unsigned: true, nullable: true }) // ✅ Made nullable
  driver_id?: number; 


  @ManyToOne(() => UserEntity, (user) => user.deviceTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // 👈 This will now map properly
  user: UserEntity;

  @Column({ name: 'device_token', type: 'varchar' })
  deviceToken: string;

  @Column({ name: 'role', type: 'varchar' })
  role: string; // e.g. 'user', 'restaurant', 'driver'


  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress?: string;

  @Column({ name: 'jwt_token', type: 'text', nullable: true })
  jwtToken?: string;

  @Column({ name: 'device_type', type: 'varchar', nullable: true })
  deviceType?: string;

  @Column({ name: 'os', type: 'varchar', nullable: true })
  os?: string;

  @Column({ name: 'app_version', type: 'varchar', nullable: true })
  appVersion?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
