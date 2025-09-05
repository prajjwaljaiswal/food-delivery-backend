import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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
  VEGETARIAN = 'Vegetarian',
  B_VEG = 'B-Veg',       // eg: Butter-Vegetarian
  NON_VEG = 'Non-Veg',
  GLUTEN_FREE = 'Gluten-Free',
}

@Entity('menu_item')
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

  // Relation with Restaurant
  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column()
  restaurantId: number;

  // Relation with Category
  @ManyToOne(() => Category, category => category.menuItems, {
    onDelete: 'CASCADE', // ✅ fixes the FK error
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  // JSON columns for MySQL / MariaDB
  @Column({ type: 'json', nullable: true })
  variants: VariantEnum[];

  @Column({ type: 'json', nullable: true })
  addOns: AddOnEnum[];

  @Column({ type: 'json', nullable: true })
  dietaryTags: DietaryTagEnum[];
}
