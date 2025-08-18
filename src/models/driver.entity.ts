// src/driver/entities/driver.entity.ts

// import { Order } from 'src/Admin/orders/entities/order.entity';
import { IsOptional, IsString } from 'class-validator';
import { Order } from './order.entity';
import { RoleEntity } from './role.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Driver {
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

    @Column({ default: true })
    isActive: boolean;


    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    image?: string;


    @Column({ default: false })
    isAvailable: boolean; // for accepting new deliveries

    @OneToMany(() => Order, order => order.driver)
    orders: Order[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
