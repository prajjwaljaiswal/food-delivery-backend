// src/Admin/category/entities/category.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './admin-restaurant.entity';
import { MenuItem } from './resturant-menu.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isVisible: boolean;

  // Category.entity.ts
@OneToMany(() => MenuItem, menuItem => menuItem.category, {
  cascade: true,
  onDelete: 'CASCADE',
})
menuItems: MenuItem[];


  @Column({ default: 0 })
  priority: number;

  @Column({
    type: 'enum',
    enum: ['starter', 'main', 'dessert', 'drink', 'addon'],
    nullable: true
  })
  type: 'starter' | 'main' | 'dessert' | 'drink' | 'addon';

  @Column('simple-array', { nullable: true })
  tags: string[];

  // Relation with Restaurant
  @ManyToOne(() => Restaurant, restaurant => restaurant.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column()
  restaurantId: number;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
