// /src/Admin/category/category.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category, Restaurant } from 'src/models';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Restaurant ,MenuItem])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }
