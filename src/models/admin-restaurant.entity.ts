import { Category } from './category.entity';
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
    @Column({ type: 'varchar', length: 255, nullable: true })
    logo?: string | null;

    @Column({ type: 'json', nullable: true })
    galleryImages?: string[] | null; // multiple gallery images

    @Column({ type: 'json', nullable: true })
    bannerImages?: string[] | null; // multiple banner images
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



    @OneToMany(() => Order, order => order.restaurant)
    orders: Order[];

    /* ---------------- Certificates ---------------- */
    @Column({ type: 'varchar', length: 255, nullable: true })
    foodSafetyCertificate?: string | null;  // file path or URL

    @Column({ type: 'varchar', length: 255, nullable: true })
    taxIdCertificate?: string | null;       // file path or URL

    @Column({ type: 'varchar', length: 255, nullable: true })
    businessLicense?: string | null;        // file path or URL

    @Column({ type: 'varchar', length: 255, nullable: true })
    insuranceCertificate?: string | null;   // file path or URL

}
