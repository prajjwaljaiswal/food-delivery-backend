import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Post,
    Req,
    Request,
    Query,
    Get,
    Param, // ✅ this is the correct decorator from @nestjs/common
} from '@nestjs/common';

import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { LoginDto } from './dto/Resturent-login.dto';
import { Request as ExpressRequest } from 'express'; // ✅ use this type only for typing, not decorator
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RestaurantJwtGuard } from 'src/common/guards/restaurant-jwt.guard';
import { RestaurantForgotPasswordDto } from './dto/restaurant-forgot-password.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';
import { RestaurantService } from './UserRestaurant.service';

// ✅ Only logged-in restaurants allowed
@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    /* -------------------------- List All Restaurants ------------------------ */
    @Get('/list')
    async getAll(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('keyword') keyword?: string
    ) {
        return this.restaurantService.findAll(page, limit, { keyword });
    }
    @Get('/menus/:restaurantId')
    async getMenusByRestaurantId(@Param('restaurantId') restaurantId: string) {
        return this.restaurantService.getMenusByRestaurantId(restaurantId);
    }

}
