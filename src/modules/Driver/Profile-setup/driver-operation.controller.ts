import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Post,
    Req,
    Request, // ✅ this is the correct decorator from @nestjs/common
} from '@nestjs/common';

// import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
// import { restService } from './profile.service';
// import { LoginDto } from './dto/Resturent-login.dto';
import { Request as ExpressRequest } from 'express'; // ✅ use this type only for typing, not decorator
// import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { RestaurantResetPasswordByOtpDto } from './dto/restaurant-reset-password-by-otp.dto';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { ResetPasswordDriverDto } from './dto/reset-password.dto';
import { DriverForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDriverDto } from './dto/login.dto';
import { DriverService } from './driver-operation.service';
import { UpdateDriverProfileDto } from './dto/update-profile.dto';


// ✅ Only logged-in restaurants allowed
@Controller('driver')
export class DriverController {
    constructor(private readonly restService: DriverService) { }
    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(
        @Request() req,
        @Body() dto: UpdateDriverProfileDto,
    ) {
        // console.log('Updating driver profile with data:', dto);
        console.log('Request user:', req.user); // ✅ Check if user is available in request
        const restaurantId = req.user.id; // ✅ id comes from JWT payload
        console.log('Restaurant ID from JWT:', restaurantId);
        return this.restService.updateProfile(restaurantId, dto);
    }

    @Post('login')
    login(@Body() dto: LoginDriverDto, @Req() req: ExpressRequest) {
        // console.log('Login attempt with:', dto);
        return this.restService.loginRestaurant(dto, req);
    }
    @UseGuards(JwtAuthGuard)
    @Post('reset-password')
    resetPassword(
        @Body() dto: ResetPasswordDriverDto,
        @Req() req: ExpressRequest,
    ) {
        return this.restService.resetRestaurantPassword(dto, req);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: DriverForgotPasswordDto) {
        return this.restService.sendForgotPasswordOtp(dto);
    }

    @Post('verify-otp')
    verifyDeliveryOtp(@Body() dto: VerifyOtpDto, @Req() req: ExpressRequest) {
        return this.restService.verifyDeliveryOtp(dto, req); // ✅ pass req
    }


    // src/auth/auth.controller.ts
    @Post('resend-otp')
    async resendOtp(@Body() dto: ResendOtpDto) {
        return this.restService.resendOtp(dto);
    }

}
