import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Order, Restaurant, UserEntity } from 'src/models';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(Restaurant) private readonly restaurantRepo: Repository<Restaurant>,
        @InjectRepository(MenuItem) private readonly menuItemRepo: Repository<MenuItem>,
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

        // 4️⃣ Total Amount calculate karo sirf jab front-end se nahi aata
        let finalTotal = totalAmount ?? menuItems.reduce((sum, item) => sum + Number(item.price), 0);

        // 5️⃣ Discount calculate karo sirf jab front-end se nahi aata
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

}