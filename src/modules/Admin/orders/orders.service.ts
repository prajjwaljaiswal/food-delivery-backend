import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/models';
import { Repository } from 'typeorm';
// import { Restaurant } from '../../Resturent-Entites/restaurant.entity';
// import { Product } from '../product/entities/product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UserEntity } from 'src/models';
import { RevenueFilterDto } from './dto/revenue-filter.dto';
import { Restaurant } from 'src/models';
import { Product } from 'src/models';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(Restaurant) private restRepo: Repository<Restaurant>,
        @InjectRepository(Product) private prodRepo: Repository<Product>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) { }

    findAll(): Promise<Order[]> {
        return this.orderRepo.find({
            relations: ['restaurant', 'products', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['restaurant', 'products', 'user', 'driver'],
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }


    async getMonthlyBreakdown(from?: string, to?: string) {
        return this.orderRepo.createQueryBuilder('order')
            .select(`TO_CHAR(order.created_at, 'Mon YYYY')`, 'label')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .where('order.status = :status', { status: 'completed' })
            .andWhere('order.isPaid = :isPaid', { isPaid: true })
            .andWhere('order.created_at BETWEEN :from AND :to', { from, to })
            .groupBy(`TO_CHAR(order.created_at, 'Mon YYYY')`)
            .orderBy(`MIN(order.created_at)`)
            .getRawMany();
    }
    async getYearlyBreakdown(from?: string, to?: string) {
        return this.orderRepo.createQueryBuilder('order')
            .select(`EXTRACT(YEAR FROM order.created_at)`, 'label')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .where('order.status = :status', { status: 'completed' })
            .andWhere('order.isPaid = :isPaid', { isPaid: true })
            .andWhere('order.created_at BETWEEN :from AND :to', { from, to })
            .groupBy(`EXTRACT(YEAR FROM order.created_at)`)
            .orderBy(`EXTRACT(YEAR FROM order.created_at)`)
            .getRawMany();
    }

    async getQuarterlyBreakdown(from?: string, to?: string) {
        return this.orderRepo.createQueryBuilder('order')
            .select(`CONCAT('Q', EXTRACT(QUARTER FROM order.created_at), ' ', EXTRACT(YEAR FROM order.created_at))`, 'label')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .where('order.status = :status', { status: 'completed' })
            .andWhere('order.isPaid = :isPaid', { isPaid: true })
            .andWhere('order.created_at BETWEEN :from AND :to', { from, to })
            .groupBy(`EXTRACT(YEAR FROM order.created_at), EXTRACT(QUARTER FROM order.created_at)`)
            .orderBy(`EXTRACT(YEAR FROM order.created_at), EXTRACT(QUARTER FROM order.created_at)`)
            .getRawMany();
    }


    async findAllByRestaurant(restaurantId: number): Promise<Order[]> {
        const orders = await this.orderRepo.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['restaurant', 'products', 'user', 'driver'],
            order: { createdAt: 'DESC' },
        });

        if (!orders.length) {
            throw new NotFoundException('No orders found for this restaurant');
        }

        return orders;
    }

    async delete(id: number): Promise<void> {
        const result = await this.orderRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Order not found');
    }

    async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.findOne(id);
        order.status = dto.status;
        return this.orderRepo.save(order);
    }
//    OrderService Report APi 
    async getRevenueReport({ from, to, filter }: RevenueFilterDto) {
        // 1. Total revenue from paid orders
        const qb = this.orderRepo.createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'totalRevenue')
            .where('order.isPaid = :isPaid', { isPaid: true });

        if (from) {
            qb.andWhere('order.created_at >= :from', { from });
        }

        if (to) {
            qb.andWhere('order.created_at <= :to', { to });
        }

        const total = await qb.getRawOne();

        // 2. Status-wise count of all orders (no isPaid filter)
        const statusQb = this.orderRepo.createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(*)', 'count');

        if (from) {
            statusQb.andWhere('order.created_at >= :from', { from });
        }

        if (to) {
            statusQb.andWhere('order.created_at <= :to', { to });
        }

        statusQb.groupBy('order.status');

        const statusCounts = await statusQb.getRawMany();

        // 3. Breakdown logic
        let breakdown: any[] = [];

        if (filter === 'monthly') {
            breakdown = await this.getMonthlyBreakdown(from, to);
        } else if (filter === 'yearly') {
            breakdown = await this.getYearlyBreakdown(from, to);
        } else if (filter === 'quarterly') {
            breakdown = await this.getQuarterlyBreakdown(from, to);
        }

        // 4. Final response
        return {
            totalRevenue: +total.totalRevenue || 0,
            breakdown,
            statusBreakdown: statusCounts.reduce((acc, cur) => {
                acc[cur.status] = +cur.count;
                return acc;
            }, {}),
        };
    }


}
