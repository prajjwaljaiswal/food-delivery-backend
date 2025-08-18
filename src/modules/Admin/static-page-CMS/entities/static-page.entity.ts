import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  title: string;

  @Column('longtext', { nullable: true })
  sub_title: string;

  @Column('longtext')
  slug: string;

  @Column('longtext', { nullable: true })
  short_description: string;

  @Column('longtext', { nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  banner: string;

  @Column('longtext', { nullable: true })
  meta_title: string;

  @Column('longtext', { nullable: true })
  meta_keyword: string;

  @Column('longtext', { nullable: true })
  meta_description: string;

  @Column({ type: 'varchar', length: 200, nullable: true, default: 'left' })
  position: string;

  @Column({ type: 'enum', enum: ['W', 'A'], default: 'W' })
  platform: 'W' | 'A';

  @Column({ type: 'tinyint', width: 1, default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
