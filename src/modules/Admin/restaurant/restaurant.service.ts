// src/admin/restaurant/restaurant.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from 'src/models';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
  ) { }
  async create(dto: CreateRestaurantDto, imagePath?: string) {
    // 1. Duplicate check
    const existingRestaurant = await this.restaurantRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existingRestaurant) {
      return {
        status: 409, // Conflict
        success: false,
        message: 'Restaurant with this email or phone already exists.',
      };
    }

    // 2. Password hash
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create restaurant entity
    const restaurant = this.restaurantRepo.create({
      ...dto,
      password: hashedPassword,
      role: { id: 2 },
      image: imagePath,
    });

    // 4. Save to DB
    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    // 5. Success response
    return {
      status: 201,
      success: true,
      message: 'Restaurant created successfully.',
      data: savedRestaurant,
    };
  }


  async findAll(page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit;

    let where: any;

    if (filters?.keyword) {
      const keyword = `%${filters.keyword}%`;
      // OR condition
      where = [
        { name: Like(keyword) },
        { email: Like(keyword) },
        { phone: Like(keyword) },
      ];
    } else {
      where = {};
    }

    const [restaurants, total] = await this.restaurantRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        is_verified: true,
        image: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    return {
      status: 200,
      success: true,
      message: 'Restaurants fetched successfully.',
      data: restaurants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }




  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        is_verified: true,
        image: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!restaurant) {
      return {
        status: 404,
        success: false,
        message: 'Restaurant not found',
        data: null,
      };
    }

    return {
      status: 200,
      success: true,
      message: 'Restaurant fetched successfully',
      data: restaurant,
    };
  }

  async update(id: number, dto: UpdateRestaurantDto) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });

    if (!restaurant) {
      return {
        status: 404,
        success: false,
        message: 'Restaurant not found',
        data: null,
      };
    }

    Object.assign(restaurant, dto);
    await this.restaurantRepo.save(restaurant);

    // Re-fetch without password
    const updatedRestaurant = await this.restaurantRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        is_verified: true,
        image: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });

    return {
      status: 200,
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant,
    };
  }


  async remove(id: number) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });

    if (!restaurant) {
      return {
        status: 404,
        success: false,
        message: 'Restaurant not found',
        data: null,
      };
    }

    await this.restaurantRepo.remove(restaurant);

    return {
      status: 200,
      success: true,
      message: 'Restaurant deleted successfully',
      data: null,
    };
  }
}
