import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './admin-restaurant.entity';
import { Category } from './category.entity';

export enum VariantEnum {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
}

export enum AddOnEnum {
  SAUCE = 'Sauce',
  TOPPING = 'Topping',
}

export enum DietaryTagEnum {
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten-Free',
}

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 8, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  inStock: boolean;

  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  restaurant: Restaurant;

  @ManyToOne(() => Category, category => category.menuItems)
  category: Category;

  // JSON columns for MySQL / MariaDB
  @Column({ type: 'json', nullable: true })
  variants: VariantEnum[];

  @Column({ type: 'json', nullable: true })
  addOns: AddOnEnum[];

  @Column({ type: 'json', nullable: true })
  dietaryTags: DietaryTagEnum[];
}
