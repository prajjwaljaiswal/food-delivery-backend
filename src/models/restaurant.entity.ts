import { Category } from './category.entity';
// import { Order } from 'src/Admin/orders/entities/order.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { RoleEntity } from './role.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn
} from 'typeorm';

@Entity('restaurants')
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column()
    address: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    password: string;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ nullable: true })
    image?: string;

    @Column({ type: 'time', nullable: true })
    opening_time?: string;

    @Column({ type: 'time', nullable: true })
    closing_time?: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Product, product => product.restaurant)
    products: Product[];

    @OneToMany(() => Order, order => order.restaurant)
    orders: Order[];
}
