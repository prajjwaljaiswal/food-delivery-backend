import { Category } from './category.entity';
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
import { IsNotEmpty, IsOptional } from 'class-validator';
import { MenuItem } from './resturant-menu.entity';

@Entity('restaurants')
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number;


    // Relation: One restaurant has many categories
    @OneToMany(() => Category, category => category.restaurant)
    categories: Category[];


    @OneToMany(() => MenuItem, menuItem => menuItem.restaurant)
    menuItems: MenuItem[];

    @Column()
    name: string;

    @Column()
    @IsNotEmpty()
    ownerName: string;

    @ManyToOne(() => RoleEntity, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @Column()
    address: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column({ nullable: true })
    @IsOptional()
    secondaryPhone?: string;

    @Column()
    password: string;

    /* ---------------- New fields from initialValues ---------------- */
    @Column({ nullable: true })
    cuisine: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    pincode: string;

    @Column({ nullable: true })
    deliveryTime: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: false })
    enableOnlineOrders: boolean;

    @Column({ default: false })
    enableTableBooking: boolean;

    /* ---------------- Extra Fields ---------------- */
    @Column({ nullable: true })
    logo?: string;   // single logo image

    @Column({ type: 'json', nullable: true })
    galleryImages?: string[]; // multiple gallery images

    @Column({ type: 'json', nullable: true })
    bannerImages?: string[];  // multiple banner images
    /* ------------------------------------------------ */

    @Column({ default: false })
    is_verified: boolean;

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

    @Column('json', { nullable: true })
    weeklySchedule: {
        monday?: { openTime: string; closeTime: string; isOpen: boolean };
        tuesday?: { openTime: string; closeTime: string; isOpen: boolean };
        wednesday?: { openTime: string; closeTime: string; isOpen: boolean };
        thursday?: { openTime: string; closeTime: string; isOpen: boolean };
        friday?: { openTime: string; closeTime: string; isOpen: boolean };
        saturday?: { openTime: string; closeTime: string; isOpen: boolean };
        sunday?: { openTime: string; closeTime: string; isOpen: boolean };
    };

    @OneToMany(() => Product, product => product.restaurant)
    products: Product[];

    @OneToMany(() => Order, order => order.restaurant)
    orders: Order[];

      /* ---------------- Certificates ---------------- */
    @Column({ nullable: true })
    foodSafetyCertificate?: string;   // file path or URL

    @Column({ nullable: true })
    taxIdCertificate?: string;        // file path or URL

    @Column({ nullable: true })
    businessLicense?: string;         // file path or URL

    @Column({ nullable: true })
    insuranceCertificate?: string;    // file path or URL
}
