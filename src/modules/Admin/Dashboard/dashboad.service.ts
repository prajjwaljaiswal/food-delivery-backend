import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity, Restaurant, Driver, Category, Order } from 'src/models';
import { UpdateProfileDto } from './dto/UpdateProfileDto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(Restaurant) private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Driver) private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,

    private readonly jwtService: JwtService,
  ) { }
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


  async getAdminData(token: string) {
    if (!token) {
      throw new UnauthorizedException('No token provided.');
    }
    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'wuMTXyB2YAMUSOZZ5WVygkezaufs3LPSsvhPXLKZCpVX6P0ro9VwtINsq7yb3P24', }); // ✅ Ensure correct secret
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    // Fetch user with role
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['addresses'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Remove sensitive fields
    const { password, verificationCode, rememberToken, ...safeUser } = user;

    return {
      success: true,
      status: 200,
      message: 'User data fetched successfully.',
      data: safeUser,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto, file?: Express.Multer.File) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;

    if (file) {
      user.profileImage = `/uploads/profile-images/${file.filename}`;
    }

    await this.userRepo.save(user);

    const { password, verificationCode, rememberToken, ...safeUser } = user;
    return {
      success: true,
      status: 200,
      message: 'Profile updated successfully.',
      data: safeUser,
    };
  }


}
