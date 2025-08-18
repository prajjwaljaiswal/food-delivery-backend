import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models';
// import { Order } from 'src/Admin/orders/entities/order.entity';
import { Category } from 'src/models';
import { Restaurant } from 'src/models';
import { Driver } from 'src/models';
import { AdminDashboardService } from './dashboad.service';
import { AdminDashboardController } from './dashboad.controller';
import { Order } from 'src/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Restaurant, Order, Driver, Category]),
  ],
  providers: [AdminDashboardService],
  controllers: [AdminDashboardController]
})
export class AdminDashboardModule {}
