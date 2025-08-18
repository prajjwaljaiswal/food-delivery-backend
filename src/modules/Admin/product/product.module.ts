// src/admin/product/product.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Product } from 'src/models';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Restaurant } from 'src/models';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Restaurant]), 
    RestaurantModule, 
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
