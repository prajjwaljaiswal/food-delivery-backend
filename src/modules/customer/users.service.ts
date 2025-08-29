import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Order, Restaurant, UserEntity } from 'src/models';
import { MenuItem } from 'src/models/resturant-menu.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressEntity } from 'src/models/address.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(Restaurant) private readonly restaurantRepo: Repository<Restaurant>,
        @InjectRepository(MenuItem) private readonly menuItemRepo: Repository<MenuItem>,

        @InjectRepository(AddressEntity)
        private readonly addressRepo: Repository<AddressEntity>,
    ) { }


    async createOrder(dto: CreateOrderDto) {
        const { userId, restaurantId, menuItemIds, paymentMethod, couponCode, isPaid, totalAmount, discountAmount } = dto;

        // 1️⃣ User fetch karo
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return { success: false, message: `User with ID ${userId} not found`, data: null };
        }

        // 2️⃣ Restaurant fetch karo
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            return { success: false, message: `Restaurant with ID ${restaurantId} not found`, data: null };
        }

        // 3️⃣ Menu Items fetch karo
        const menuItems = await this.menuItemRepo.findByIds(menuItemIds);
        if (!menuItems || menuItems.length === 0) {
            return { success: false, message: `Menu items not found for IDs: [${menuItemIds.join(', ')}]`, data: null };
        }

        // 4️⃣ Total Amount: Directly use frontend value, no recalculation
        if (totalAmount == null) {
            return { success: false, message: 'Total amount is required from frontend', data: null };
        }
        const finalTotal = totalAmount;

        // 5️⃣ Discount: calculate only if frontend didn’t send
        let finalDiscount = discountAmount ?? 0;
        if (discountAmount == null && couponCode) {
            const code = couponCode.trim().toUpperCase();
            if (code === 'NEW50' || code === 'NEWUSER50') {
                finalDiscount = finalTotal * 0.5;
            }
        }

        // 6️⃣ Order create karo
        const order = this.orderRepo.create({
            user,
            restaurant,
            MenuItem: menuItems,
            totalAmount: finalTotal,
            discountAmount: finalDiscount,
            paymentMethod,
            isPaid: isPaid || false,
            couponCode,
            status: OrderStatus.PENDING,
        });

        // 7️⃣ Save Order
        const savedOrder = await this.orderRepo.save(order);

        // 8️⃣ Success response
        return { success: true, message: 'Order placed successfully', data: savedOrder };
    }

    async updateProfile(userId: number, dto: UpdateProfileDto, profileImage?: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return { success: false, message: `User with ID ${userId} not found`, data: null };
        }
        // Agar password aaya hai → hash karo
        if (dto.password) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
            dto.password = await bcrypt.hash(dto.password, saltRounds);
        }
        // Image ka path save karo
        if (profileImage) {
            user.profileImage = `/uploads/profile-images/${profileImage}`;
        }
        // Baaki fields assign karo
        Object.assign(user, dto);

        const updatedUser = await this.userRepo.save(user);

        return { success: true, message: 'Profile updated successfully', data: updatedUser };
    }
    async createAddress(userId: number, dto: CreateAddressDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const newAddress = this.addressRepo.create({
            ...dto,
            user,
        });

        return await this.addressRepo.save(newAddress);
    }

}