// src/admin/order/order.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/models';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
// import { Restaurant } from '../../Resturent-Entites/restaurant.entity';
// import { Product } from '../product/entities/product.entity';
import { UserEntity } from 'src/models';
import { Restaurant } from 'src/models';
import { Product } from 'src/models';
// import { User } from 'src/admin/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, Product,UserEntity])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
