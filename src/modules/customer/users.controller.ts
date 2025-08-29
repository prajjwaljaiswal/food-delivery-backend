import { Controller, Post, Body, UseGuards, Param, Patch, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from './users.service';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateAddressDto } from './dto/create-address.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('customer')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }


    @Post('/placed/order')
    @Roles(RoleEnum.USER)
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.usersService.createOrder(createOrderDto);
    }

    @Patch('/profile/:id')
    @Roles(RoleEnum.USER)
    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
            destination: './uploads/profile-images',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    updateProfile(
        @Param('id') userId: number,
        @Body() dto: UpdateProfileDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.usersService.updateProfile(userId, dto, file?.filename);
    }


    @Post(':userId')
    @Roles(RoleEnum.USER)
    async createAddress(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: CreateAddressDto,
    ) {
        const address = await this.usersService.createAddress(userId, dto);
        return {
            success: true,
            message: 'Address added successfully',
            data: address,
        };
    }

}
