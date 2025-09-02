// src/admin/restaurant/restaurant.service.ts

import {
    BadRequestException,
    Body,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, Like, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { Restaurant } from 'src/models';
import { LoginDto } from './dto/Resturent-login.dto';
import { DeviceToken } from 'src/models';
import { UserEntity } from 'src/models';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RestaurantResetPasswordByOtpDto } from './dto/restaurant-reset-password-by-otp.dto';
import { RestaurantForgotPasswordDto } from './dto/restaurant-forgot-password.dto';
import { EmailService } from 'src/common/email/email.service';
import { Otp } from 'src/models';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';
import { RoleEntity } from 'src/models';
import { JwtUtil } from 'src/common/utils/jwt.util';
import { MenuItem } from 'src/models/resturant-menu.entity';

@Injectable()
export class RestaurantService {
    constructor(

        @InjectRepository(Restaurant)
        private restaurantRepo: Repository<Restaurant>,

        @InjectRepository(MenuItem)
        private readonly menuRepository: Repository<MenuItem>,

    ) { }

    async findAll(page: number = 1, limit: number = 10, filters?: any) {
        const skip = (page - 1) * limit;

        const query = this.restaurantRepo
            .createQueryBuilder("restaurant")
            .select([
                "restaurant.id",
                "restaurant.name",
                "restaurant.ownerName",
                "restaurant.address",
                "restaurant.email",
                "restaurant.phone",
                "restaurant.secondaryPhone",
                "restaurant.cuisine",
                "restaurant.country",
                "restaurant.state",
                "restaurant.city",
                "restaurant.pincode",
                "restaurant.deliveryTime",
                "restaurant.description",
                "restaurant.enableOnlineOrders",
                "restaurant.enableTableBooking",
                "restaurant.logo",
                "restaurant.weeklySchedule",
                "restaurant.galleryImages",
                "restaurant.foodSafetyCertificate",
                "restaurant.bannerImages",
                "restaurant.opening_time",
                "restaurant.closing_time",
                "restaurant.is_active",
                "restaurant.businessLicense",
                "restaurant.insuranceCertificate",
                "restaurant.is_verified",
                "restaurant.created_at",
                "restaurant.updated_at",
            ])
            .skip(skip)
            .take(limit)
            .orderBy("restaurant.created_at", "DESC");

        // Filter logic
        if (filters?.keyword) {
            query.where(
                "restaurant.name LIKE :keyword OR restaurant.email LIKE :keyword OR restaurant.phone LIKE :keyword",
                { keyword: `%${filters.keyword}%` }
            );
        }

        // Agar manually role chahiye to join karo
        if (filters?.includeRole) {
            query.leftJoinAndSelect("restaurant.role", "role");
        }

        const [restaurants, total] = await query.getManyAndCount();

        return {
            status: 200,
            success: true,
            message: "Restaurants fetched successfully.",
            data: restaurants,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getMenusByRestaurantId(restaurantId: string) {
        const menus = await this.menuRepository.find({
            where: { restaurant: { id: Number(restaurantId) } }, // restaurantId ko number me convert karo
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                image: true,
                inStock: true,
                variants: true,
                addOns: true,
                dietaryTags: true
            },
        });
        if (!menus || menus.length === 0) {
            throw new NotFoundException(`No menus found for restaurant ID: ${restaurantId}`);
        }

        return {
            success: true,
            message: 'Menus fetched successfully',
            data: menus,
        };
    }



}
