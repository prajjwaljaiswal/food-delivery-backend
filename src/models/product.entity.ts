// src/Admin/product/entities/product.entity.ts
import { Category } from './category.entity';
import { Restaurant } from './admin-restaurant.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Restaurant, { nullable: false })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @ManyToOne(() => Category, { nullable: false })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('float')
    price: number;

    @Column('float', { nullable: true })
    discount_price: number;

    @Column({ default: true })
    status: boolean;

    @Column({ nullable: true })
    image: string;

    @Column({ default: true })
    is_veg: boolean;

    @Column({ default: false })
    is_customizable: boolean;

    @Column({ type: 'int', nullable: true })
    preparation_time: number;

    @Column({ type: 'time', nullable: true })
    available_from: string;

    @Column({ type: 'time', nullable: true })
    available_to: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
