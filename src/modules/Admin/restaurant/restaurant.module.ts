// src/admin/restaurant/restaurant.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  controllers: [RestaurantController],
  providers: [RestaurantService],
   exports: [TypeOrmModule ,RestaurantService]
})
export class RestaurantModule {}
