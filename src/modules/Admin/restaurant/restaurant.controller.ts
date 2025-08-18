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
  UploadedFiles,
  BadRequestException,
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
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
/* -------------------------- Admin-only access ------------------------ */
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }

  /* -------------------------- Create Restaurant ------------------------ */


  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'bannerImages', maxCount: 5 },
        { name: 'galleryImages', maxCount: 10 },
      ],
      {
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
      },
    ),
  )
  async create(
    @Body() dto: CreateRestaurantDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      bannerImages?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {


    console.log("FILES RECEIVED:", files);

    if (files?.logo?.[0]) {
      dto.logo = `/uploads/restaurants/${files.logo[0].filename}`;
    }
    if (files?.bannerImages) {
      dto.bannerImages = files.bannerImages.map(f => `/uploads/restaurants/${f.filename}`);
    }
    if (files?.galleryImages) {
      dto.galleryImages = files.galleryImages.map(f => `/uploads/restaurants/${f.filename}`);
    }


    return this.restaurantService.create(dto);
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
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'bannerImages', maxCount: 5 },
        { name: 'galleryImages', maxCount: 10 },
      ],
      {
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
      },
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRestaurantDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      bannerImages?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
  ) {
    // 1️⃣ Parse weeklySchedule if it's a string
    if (dto.weeklySchedule && typeof dto.weeklySchedule === 'string') {
      try {
        dto.weeklySchedule = JSON.parse(dto.weeklySchedule);
      } catch (e) {
        throw new BadRequestException('Invalid weeklySchedule JSON format');
      }
    }

    // 2️⃣ Convert boolean fields from string to actual booleans
    if (dto.enableOnlineOrders !== undefined && typeof dto.enableOnlineOrders === 'string') {
      dto.enableOnlineOrders = dto.enableOnlineOrders === 'true';
    }
    if (dto.enableTableBooking !== undefined && typeof dto.enableTableBooking === 'string') {
      dto.enableTableBooking = dto.enableTableBooking === 'true';
    }

    // 3️⃣ Handle uploaded files
    if (files.logo) {
      dto.logo = `/uploads/restaurants/${files.logo[0].filename}`;
    }
    if (files.bannerImages) {
      dto.bannerImages = files.bannerImages.map(
        (file) => `/uploads/restaurants/${file.filename}`,
      );
    }
    if (files.galleryImages) {
      dto.galleryImages = files.galleryImages.map(
        (file) => `/uploads/restaurants/${file.filename}`,
      );
    }

    // 4️⃣ Call service update method
    return this.restaurantService.update(id, dto);
  }


  /* -------------------------- Delete Restaurant ------------------------ */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.remove(id);
  }
}
