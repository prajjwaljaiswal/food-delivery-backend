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
  Req,
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
        { name: 'foodSafetyCertificate', maxCount: 1 },
        { name: 'taxIdCertificate', maxCount: 1 },
        { name: 'businessLicense', maxCount: 1 },
        { name: 'insuranceCertificate', maxCount: 1 },
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
          const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/avif',
            'application/pdf',
          ];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new Error('Only image or PDF files are allowed!'), false);
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
      foodSafetyCertificate?: Express.Multer.File[];
      taxIdCertificate?: Express.Multer.File[];
      businessLicense?: Express.Multer.File[];
      insuranceCertificate?: Express.Multer.File[];
    },
  ) {
    // ✅ Single logo
    if (files?.logo?.[0]) {
      dto.logo = `/uploads/restaurants/${files.logo[0].filename}`;
    }

    // ✅ Multiple images as string[] (TypeORM simple-json)
    dto.bannerImages = files?.bannerImages
      ? files.bannerImages.map(f => `/uploads/restaurants/${f.filename}`)
      : [];

    dto.galleryImages = files?.galleryImages
      ? files.galleryImages.map(f => `/uploads/restaurants/${f.filename}`)
      : [];

    // ✅ Certificates
    dto.foodSafetyCertificate = files?.foodSafetyCertificate?.[0]
      ? `/uploads/restaurants/${files.foodSafetyCertificate[0].filename}`
      : undefined;

    dto.taxIdCertificate = files?.taxIdCertificate?.[0]
      ? `/uploads/restaurants/${files.taxIdCertificate[0].filename}`
      : undefined;

    dto.businessLicense = files?.businessLicense?.[0]
      ? `/uploads/restaurants/${files.businessLicense[0].filename}`
      : undefined;

    dto.insuranceCertificate = files?.insuranceCertificate?.[0]
      ? `/uploads/restaurants/${files.insuranceCertificate[0].filename}`
      : undefined;

    // ✅ Description fix (array → string)
    if (Array.isArray(dto.description)) {
      dto.description = dto.description.join(' ');
    }

    // ✅ weeklySchedule must be object (simple-json column)
    if (dto.weeklySchedule && typeof dto.weeklySchedule === 'string') {
      try {
        dto.weeklySchedule = JSON.parse(dto.weeklySchedule);
      } catch (e) {
        dto.weeklySchedule = {};
      }
    } else if (!dto.weeklySchedule) {
      dto.weeklySchedule = {};
    }

    // ✅ Call service to save restaurant
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

  // @Patch(':id')
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'logo', maxCount: 1 },
  //       { name: 'bannerImages', maxCount: 5 },
  //       { name: 'galleryImages', maxCount: 10 },
  //       { name: 'foodSafetyCertificate', maxCount: 1 },
  //       { name: 'taxIdCertificate', maxCount: 1 },
  //       { name: 'businessLicense', maxCount: 1 },
  //       { name: 'insuranceCertificate', maxCount: 1 },
  //     ],
  //     {
  //       storage: diskStorage({
  //         destination: './uploads/restaurants',
  //         filename: (req, file, callback) => {
  //           const uniqueSuffix =
  //             Date.now() + '-' + Math.round(Math.random() * 1e9);
  //           const ext = extname(file.originalname);
  //           callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  //         },
  //       }),
  //       fileFilter: (req, file, callback) => {
  //         const allowedMimeTypes = [
  //           'image/jpeg',
  //           'image/jpg',
  //           'image/png',
  //           'image/avif',
  //           'application/pdf',
  //         ];
  //         if (!allowedMimeTypes.includes(file.mimetype)) {
  //           return callback(new Error('Only image or PDF files are allowed!'), false);
  //         }
  //         callback(null, true);
  //       }
  //       ,
  //     },
  //   ),
  // )
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: any,
  //   @UploadedFiles()
  //   files: {
  //     logo?: Express.Multer.File[];
  //     bannerImages?: Express.Multer.File[];
  //     galleryImages?: Express.Multer.File[];
  //     foodSafetyCertificate?: Express.Multer.File[];
  //     taxIdCertificate?: Express.Multer.File[];
  //     businessLicense?: Express.Multer.File[];
  //     insuranceCertificate?: Express.Multer.File[];
  //   },
  // ) {

  //   if (dto.deletedImages && typeof dto.deletedImages === 'string') {
  //     try {
  //       dto.deletedImages = JSON.parse(dto.deletedImages);
  //     } catch {
  //       dto.deletedImages = {};
  //     }
  //   }
  //   // 0️⃣ Fix description
  //   if (dto.description) {
  //     if (Array.isArray(dto.description)) {
  //       dto.description = dto.description
  //         .filter(v => v && v.toString().trim() !== '')
  //         .join(' ')
  //         .trim();
  //     } else {
  //       dto.description = String(dto.description).trim();
  //     }
  //   }

  //   // 1️⃣ Parse weeklySchedule if it's a string
  //   if (dto.weeklySchedule && typeof dto.weeklySchedule === 'string') {
  //     try {
  //       dto.weeklySchedule = JSON.parse(dto.weeklySchedule);
  //     } catch (e) {
  //       throw new BadRequestException('Invalid weeklySchedule JSON format');
  //     }
  //   }


  //   // 2️⃣ Convert boolean fields from string to actual booleans
  //   if (
  //     dto.enableOnlineOrders !== undefined &&
  //     typeof dto.enableOnlineOrders === 'string'
  //   ) {
  //     dto.enableOnlineOrders = dto.enableOnlineOrders === 'true';
  //   }
  //   if (
  //     dto.enableTableBooking !== undefined &&
  //     typeof dto.enableTableBooking === 'string'
  //   ) {
  //     dto.enableTableBooking = dto.enableTableBooking === 'true';
  //   }

  //   // 3️⃣ Handle uploaded files
  //   if (files.logo) {
  //     dto.logo = `/uploads/restaurants/${files.logo[0].filename}`;
  //   }
  //   if (files.bannerImages) {
  //     dto.bannerImages = files.bannerImages.map(
  //       (file) => `/uploads/restaurants/${file.filename}`,
  //     );
  //   }
  //   if (files.galleryImages) {
  //     dto.galleryImages = files.galleryImages.map(
  //       (file) => `/uploads/restaurants/${file.filename}`,
  //     );
  //   }

  //   /* ------------ New Certificates ------------- */
  //   if (files.foodSafetyCertificate) {
  //     dto.foodSafetyCertificate = `/uploads/restaurants/${files.foodSafetyCertificate[0].filename}`;
  //   }
  //   if (files.taxIdCertificate) {
  //     dto.taxIdCertificate = `/uploads/restaurants/${files.taxIdCertificate[0].filename}`;
  //   }
  //   if (files.businessLicense) {
  //     dto.businessLicense = `/uploads/restaurants/${files.businessLicense[0].filename}`;
  //   }
  //   if (files.insuranceCertificate) {
  //     dto.insuranceCertificate = `/uploads/restaurants/${files.insuranceCertificate[0].filename}`;
  //   }
  //   /* ------------------------------------------- */

  //   // 4️⃣ Call service update method
  //   return this.restaurantService.update(id, {
  //     ...dto,
  //     logo: files.logo?.[0] ? `/uploads/restaurants/${files.logo[0].filename}` : undefined,
  //     bannerImages: files.bannerImages?.map(f => `/uploads/restaurants/${f.filename}`) || undefined,
  //     galleryImages: files.galleryImages?.map(f => `/uploads/restaurants/${f.filename}`) || undefined,
  //     foodSafetyCertificate: files.foodSafetyCertificate?.[0] ? `/uploads/restaurants/${files.foodSafetyCertificate[0].filename}` : undefined,
  //     taxIdCertificate: files.taxIdCertificate?.[0] ? `/uploads/restaurants/${files.taxIdCertificate[0].filename}` : undefined,
  //     businessLicense: files.businessLicense?.[0] ? `/uploads/restaurants/${files.businessLicense[0].filename}` : undefined,
  //     insuranceCertificate: files.insuranceCertificate?.[0] ? `/uploads/restaurants/${files.insuranceCertificate[0].filename}` : undefined,
  //   });

  // }


  /* -------------------------- Delete Restaurant ------------------------ */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.remove(id);
  }


}
