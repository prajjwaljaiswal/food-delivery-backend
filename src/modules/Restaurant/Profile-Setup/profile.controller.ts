import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Post,
    Req,
    Request, // ✅ this is the correct decorator from @nestjs/common
} from '@nestjs/common';

import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { RestaurantService } from './profile.service';
import { LoginDto } from './dto/Resturent-login.dto';
import { Request as ExpressRequest } from 'express'; // ✅ use this type only for typing, not decorator
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RestaurantJwtGuard } from 'src/common/guards/restaurant-jwt.guard';
import { RestaurantForgotPasswordDto } from './dto/restaurant-forgot-password.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';


// ✅ Only logged-in restaurants allowed
@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }
    @UseGuards(RestaurantJwtGuard)
    @Patch('profile')
    async updateProfile(
        @Request() req,
        @Body() dto: UpdateRestaurantProfileDto,
    ) {
        const restaurantId = req.user.id; // ✅ id comes from JWT payload
        return this.restaurantService.updateProfile(restaurantId, dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto, @Req() req: ExpressRequest) {
        return this.restaurantService.loginRestaurant(dto, req);
    }

    @Post('register')
    register(@Body() dto: RestaurantRegisterDto) {
        return this.restaurantService.registerRestaurant(dto);
    }
    @UseGuards(RestaurantJwtGuard)
    @Post('reset-password')
    resetPassword(
        @Body() dto: ResetPasswordDto,
        @Req() req: ExpressRequest,
    ) {
        return this.restaurantService.resetRestaurantPassword(dto, req);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: RestaurantForgotPasswordDto) {
        return this.restaurantService.sendForgotPasswordOtp(dto);
    }

    @Post('verify-otp')
    verifyRestaurantOtp(@Body() dto: VerifyOtpDto, @Req() req: ExpressRequest) {
        return this.restaurantService.verifyRestaurantOtp(dto, req); // ✅ pass req
    }


    // src/auth/auth.controller.ts
    @Post('resend-otp')
    async resendOtp(@Body() dto: ResendOtpDto) {
        return this.restaurantService.resendOtp(dto);
    }

}
