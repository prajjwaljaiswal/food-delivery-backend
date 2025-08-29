import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('addresses')
export class AddressEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    street: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 20 })
    pincode: string;


    @Column({ type: 'varchar', length: 150, nullable: true })
    label: string;

    @Column({ type: 'varchar', length: 100 })
    state: string;

    @ManyToOne(() => UserEntity, (user) => user.addresses, { onDelete: 'CASCADE' })
    user: UserEntity;
}
