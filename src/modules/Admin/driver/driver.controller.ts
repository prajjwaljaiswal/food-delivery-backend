// File: src/admin/driver/driver.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) { }

  /* -------------------------- Create Driver ------------------------ */
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/drivers',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only JPG, JPEG, and PNG image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(@Body() dto: CreateDriverDto, @UploadedFile() file?: Express.Multer.File) {
    const imagePath = file ? `/uploads/drivers/${file.filename}` : undefined;
    return this.driverService.create(dto, imagePath);
  }

  /* -------------------------- List All Drivers ------------------------ */
  @Get()
  async getAllDrivers(@Query('page') page: number, @Query('limit') limit: number, @Query('keyword') keyword?: string) {
    return this.driverService.findAll(page, limit, { keyword });
  }

  /* -------------------------- Get One Driver ------------------------ */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(+id);
  }

  /* -------------------------- Update Driver ------------------------ */
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/drivers',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only JPG, JPEG, and PNG image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.image = `/uploads/drivers/${file.filename}`;
    }
    return this.driverService.update(+id, dto);
  }

  /* -------------------------- Delete Driver ------------------------ */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(+id);
  }
}
