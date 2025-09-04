import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models';
// import { Order } from 'src/Admin/orders/entities/order.entity';
import { Category } from 'src/models';
import { JwtModule } from '@nestjs/jwt'; // ✅ Add this
import { Restaurant } from 'src/models';
import { Driver } from 'src/models';
import { AdminDashboardService } from './dashboad.service';
import { AdminDashboardController } from './dashboad.controller';
import { Order } from 'src/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Restaurant, Order, Driver, Category]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Use ENV in production
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AdminDashboardService],
  controllers: [AdminDashboardController]
})
export class AdminDashboardModule { }
