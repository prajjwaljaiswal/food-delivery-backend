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
  async create(dto: CreateRestaurantDto) {
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
    // 3. Create restaurant entity
    const restaurant = this.restaurantRepo.create({
      ...dto,
      password: hashedPassword,
      role: { id: 2 }, // default restaurant role
      logo: dto.logo || undefined,                 // single logo image
      galleryImages: dto.galleryImages || [],      // multiple gallery images
      bannerImages: dto.bannerImages || [],        // multiple banner images
      enableOnlineOrders: dto.enableOnlineOrders ?? false, // boolean
      enableTableBooking: dto.enableTableBooking ?? false, // boolean
      weeklySchedule: dto.weeklySchedule,
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
      // OR condition for search
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
        ownerName: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        secondaryPhone: true,
        cuisine: true,
        country: true,
        state: true,
        city: true,
        pincode: true,
        deliveryTime: true,
        description: true,
        enableOnlineOrders: true,
        enableTableBooking: true,
        is_verified: true,
        logo: true,
        weeklySchedule: true,
        galleryImages: true,
        bannerImages: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
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
        ownerName: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        secondaryPhone: true,
        cuisine: true,
        country: true,
        state: true,
        city: true,
        pincode: true,
        deliveryTime: true,
        description: true,
        enableOnlineOrders: true,
        enableTableBooking: true,
        is_verified: true,
        logo: true,
        galleryImages: true,
        bannerImages: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
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
  async update(
    id: number,
    dto: UpdateRestaurantDto,
    logoPath?: string,
    galleryPaths?: string[],
    bannerPaths?: string[],
  ) {
    // 1. Find existing restaurant
    // console.log("iisdsd", dto)
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });

    if (!restaurant) {
      return {
        status: 404,
        success: false,
        message: 'Restaurant not found',
        data: null,
      };
    }
    // Check email
    if (dto.email) {
      const existingEmail = await this.restaurantRepo.findOne({ where: { email: dto.email } });
      if (existingEmail && existingEmail.id !== id) {
        return {
          status: 409,
          success: false,
          message: 'Another restaurant with this email already exists.',
        };
      }
    }

    // Check phone
    if (dto.phone) {
      const existingPhone = await this.restaurantRepo.findOne({ where: { phone: dto.phone } });
      if (existingPhone && existingPhone.id !== id) {
        return {
          status: 409,
          success: false,
          message: 'Another restaurant with this phone already exists.',
        };
      }
    }


    // 3. Update allowed fields
    Object.assign(restaurant, dto);

    // 4. Hash password if provided
    if (dto.password) {
      restaurant.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.weeklySchedule) {
      restaurant.weeklySchedule = {
        ...(restaurant.weeklySchedule || {}),
        ...dto.weeklySchedule,
      };
    }
    // 5. Set boolean fields with defaults
    restaurant.enableOnlineOrders = dto.enableOnlineOrders ?? restaurant.enableOnlineOrders ?? false;
    restaurant.enableTableBooking = dto.enableTableBooking ?? restaurant.enableTableBooking ?? false;

    // 6. Update images
    if (logoPath) {
      restaurant.logo = logoPath;
    }

    if (galleryPaths && galleryPaths.length > 0) {
      restaurant.galleryImages = [
        ...(restaurant.galleryImages || []),
        ...galleryPaths,
      ];
    }

    if (bannerPaths && bannerPaths.length > 0) {
      restaurant.bannerImages = [
        ...(restaurant.bannerImages || []),
        ...bannerPaths,
      ];
    }

    // 7. Save updates
    await this.restaurantRepo.save(restaurant);

    // 8. Re-fetch updated restaurant without password
    const updatedRestaurant = await this.restaurantRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        ownerName: true,
        role: true,
        address: true,
        email: true,
        phone: true,
        secondaryPhone: true,
        cuisine: true,
        country: true,
        state: true,
        city: true,
        pincode: true,
        deliveryTime: true,
        description: true,
        enableOnlineOrders: true,
        enableTableBooking: true,
        is_verified: true,
        logo: true,
        galleryImages: true,
        bannerImages: true,
        opening_time: true,
        closing_time: true,
        weeklySchedule: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
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
