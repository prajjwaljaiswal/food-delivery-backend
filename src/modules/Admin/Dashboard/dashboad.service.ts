import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, Restaurant, Driver, Category, Order } from 'src/models';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(Restaurant) private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Driver) private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}
async getDashboardStats() {
  const [totalCustomers, totalRestaurants, totalOrders, totalDrivers, totalCategories] = await Promise.all([
    this.userRepo.count({ where: { role: { slug: 'user' } } }),
    this.restaurantRepo.count(),
    this.orderRepo.count(),
    this.driverRepo.count(),
    this.categoryRepo.count(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await this.orderRepo.count({
    where: { createdAt: today }
  });

  const stats = {
    totalCustomers,
    totalRestaurants,
    totalOrders,
    totalDrivers,
    totalCategories,
    todayOrders
  };

  const hasData = Object.values(stats).some((count) => count > 0);

  return {
    status: 200,
    success: true,
    message: hasData
      ? 'Dashboard stats fetched successfully.'
      : 'No data available for dashboard stats.',
    data: stats,
  };
}

}
