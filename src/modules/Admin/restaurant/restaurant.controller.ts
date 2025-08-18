// src/admin/restaurant/restaurant.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import {
    JwtAuthGuard,
    RoleGuard,
    Roles,
} from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
/* -------------------------- Admin-only access ------------------------ */
// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles(RoleEnum.ADMIN)
@Controller('admin/restaurants')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) { }

    /* -------------------------- Create Restaurant ------------------------ */

    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/restaurants', // folder jaha image save hogi
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
        }),
    )
    async create(
        @Body() dto: CreateRestaurantDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        // file agar aaya to path banao, warna empty string ya undefined do
        const imagePath = file
            ? `/uploads/restaurants/${file.filename}`
            : undefined;
        return this.restaurantService.create(dto, imagePath);
    }

    /* -------------------------- List All Restaurants ------------------------ */
    @Get()
    async getAll(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('keyword') keyword?: string
    ) {
        return this.restaurantService.findAll(page, limit, { keyword });
    }

    /* -------------------------- Get One Restaurant ------------------------ */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.restaurantService.findOne(id);
    }

    /* -------------------------- Update Restaurant ------------------------ */
 @Patch(':id')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/restaurants',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }),
)
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateRestaurantDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  if (file) {
    dto.image = `/uploads/restaurants/${file.filename}`;
  }
  return this.restaurantService.update(id, dto);
}

    /* -------------------------- Delete Restaurant ------------------------ */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.restaurantService.remove(id);
    }
}
