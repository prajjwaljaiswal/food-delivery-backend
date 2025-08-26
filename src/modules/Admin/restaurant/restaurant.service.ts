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
    // 1️⃣ Duplicate check
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

    // 2️⃣ Password hash
    const hashedPassword = await bcrypt.hash(dto.password, 10);
        // 3️⃣ Create restaurant entity
    const restaurant = this.restaurantRepo.create({
      ...dto,
      password: hashedPassword,
      role: { id: 2 }, // default restaurant role
      logo: dto.logo || undefined,                 // single logo image
      galleryImages: dto.galleryImages || [],      // multiple gallery images
      bannerImages: dto.bannerImages || [],        // multiple banner images
      foodSafetyCertificate: dto.foodSafetyCertificate || undefined,
      taxIdCertificate: dto.taxIdCertificate || undefined,
      businessLicense: dto.businessLicense || undefined,
      insuranceCertificate: dto.insuranceCertificate || undefined,
      enableOnlineOrders: dto.enableOnlineOrders ?? false, // boolean
      enableTableBooking: dto.enableTableBooking ?? false, // boolean
      weeklySchedule: dto.weeklySchedule,
    });

    // 4️⃣ Save to DB
    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    // 5️⃣ Success response
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
      relations: ['menuItems'], // ✅ include menu items if exist
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
        taxIdCertificate: true,
        is_verified: true,
        logo: true,
        weeklySchedule: true,
        galleryImages: true,
        foodSafetyCertificate: true,
        bannerImages: true,
        opening_time: true,
        closing_time: true,
        is_active: true,
        businessLicense: true,
        insuranceCertificate: true,
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
      relations: ['menuItems'], // ✅ include menu items
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
        insuranceCertificate: true,
        foodSafetyCertificate: true,
        businessLicense: true,
        taxIdCertificate: true,
        enableTableBooking: true,
        is_verified: true,
        logo: true,
        weeklySchedule: true,  // ✅ included
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
  ) {
    // 1️⃣ Find existing restaurant
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) {
      return {
        status: 404,
        success: false,
        message: 'Restaurant not found',
        data: null,
      };
    }

    // 2️⃣ Check email duplication
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

    // 3️⃣ Check phone duplication
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

    // 4️⃣ Update allowed fields
    Object.assign(restaurant, dto);

    // 5️⃣ Hash password if provided
    if (dto.password) {
      restaurant.password = await bcrypt.hash(dto.password, 10);
    }

    // 6️⃣ Merge or replace weeklySchedule
    if (dto.weeklySchedule) {
      restaurant.weeklySchedule = {
        ...(restaurant.weeklySchedule || {}),
        ...dto.weeklySchedule,
      };
    }

    // 7️⃣ Boolean fields
    restaurant.enableOnlineOrders = dto.enableOnlineOrders ?? restaurant.enableOnlineOrders ?? false;
    restaurant.enableTableBooking = dto.enableTableBooking ?? restaurant.enableTableBooking ?? false;

    // 8️⃣ Replace images if new ones uploaded
    if (dto.logo) restaurant.logo = dto.logo;
    if (dto.galleryImages) restaurant.galleryImages = dto.galleryImages;
    if (dto.bannerImages) restaurant.bannerImages = dto.bannerImages;

    // 9️⃣ Replace certificates if new ones uploaded
    if (dto.foodSafetyCertificate) restaurant.foodSafetyCertificate = dto.foodSafetyCertificate;
    if (dto.taxIdCertificate) restaurant.taxIdCertificate = dto.taxIdCertificate;
    if (dto.businessLicense) restaurant.businessLicense = dto.businessLicense;
    if (dto.insuranceCertificate) restaurant.insuranceCertificate = dto.insuranceCertificate;

    // 🔟 Save updated restaurant
    await this.restaurantRepo.save(restaurant);

    // 1️⃣1️⃣ Re-fetch updated restaurant without password
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
        foodSafetyCertificate: true,
        taxIdCertificate: true,
        businessLicense: true,
        insuranceCertificate: true,
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
