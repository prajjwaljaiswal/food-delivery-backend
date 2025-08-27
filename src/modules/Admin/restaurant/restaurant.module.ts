// src/admin/restaurant/restaurant.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Category, Order, Restaurant } from 'src/models';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Order, MenuItem, Category])],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [TypeOrmModule, RestaurantService]
})
export class RestaurantModule { }
