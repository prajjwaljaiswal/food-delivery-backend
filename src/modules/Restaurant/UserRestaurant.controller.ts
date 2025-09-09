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
    Param,
    Delete,
} from '@nestjs/common';

import { LoginDto } from './dto/Resturent-login.dto';
import { Request as ExpressRequest } from 'express';
import { RestaurantJwtGuard } from 'src/common/guards/restaurant-jwt.guard';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';
import { RestaurantService } from './UserRestaurant.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';

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

    

    /* -------------------------- Restaurant Registration ------------------------ */
    @Post('/register')
    async register(@Body() dto: RestaurantRegisterDto) {
        return this.restaurantService.register(dto);
    }

    /* -------------------------- Restaurant Login ------------------------ */
    @Post('/login')
    async login(@Body() dto: LoginDto, @Req() req: ExpressRequest) {
        return this.restaurantService.login(dto, req);
    }

    /* -------------------------- Restaurant OTP Verification ------------------------ */
    @Post('/verify-otp')
    async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: ExpressRequest) {
        return this.restaurantService.verifyOtp(dto, req);
    }

    /* -------------------------- Restaurant Resend OTP ------------------------ */
    @Post('/resend-otp')
    async resendOtp(@Body() dto: ResendOtpDto) {
        return this.restaurantService.resendOtp(dto);
    }

    /* -------------------------- Restaurant Menu Management ------------------------ */
    
    /* -------------------------- Get All Menus for Logged-in Restaurant ------------------------ */
    @Get('/my-menus')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(RoleEnum.RESTAURANT)
    async getMyMenus(
        @Req() req: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const restaurantId = req.user.id;
        return this.restaurantService.getMyMenus(restaurantId, page, limit);
    }


    @Get('/menu/:menuId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(RoleEnum.RESTAURANT)
    async getRestaurantMenuDetails(
        @Req() req: any,
        @Param('menuId') menuId: number
    ) {
        const restaurantId = req.user.id;
        return this.restaurantService.getRestaurantMenuDetails(restaurantId, menuId);
    }

    /* -------------------------- Create New Menu Item ------------------------ */
    @Post('/menus')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(RoleEnum.RESTAURANT)
    async createMenu(@Req() req: any, @Body() dto: CreateMenuDto) {
        const restaurantId = req.user.id;
        return this.restaurantService.createMenu(restaurantId, dto);
    }

    @Patch('/menus/:menuId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(RoleEnum.RESTAURANT)
    async updateMenu(
        @Req() req: any,
        @Param('menuId') menuId: number,
        @Body() dto: Partial<CreateMenuDto>
    ) {
        const restaurantId = req.user.id;
        return this.restaurantService.updateMenu(restaurantId, menuId, dto);
    }

    @Delete('/menus/:menuId')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(RoleEnum.RESTAURANT)
    async deleteMenu(@Req() req: any, @Param('menuId') menuId: number) {
        const restaurantId = req.user.id;
        return this.restaurantService.deleteMenu(restaurantId, menuId);
    }

}
