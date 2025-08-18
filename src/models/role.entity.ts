// role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;
  
  @Column({ type: 'text', nullable: true })
  description: string | null;


  @Column({ type: 'tinyint', default: 0 })
  is_default: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
