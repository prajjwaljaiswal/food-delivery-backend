// File: src/admin/driver/driver.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';
import { extname } from 'path';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateVerificationDocumentDto } from './dto/create-driver-verification.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVerificationDocumentDto } from './dto/update-verification-document.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(RoleEnum.ADMIN)
@Controller('admin/drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) { }


  // /* -------------------------- Create Driver ------------------------ */
  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads/drivers',
  //       filename: (req, file, callback) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  //       },
  //     }),
  //     fileFilter: (req, file, callback) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //         return callback(
  //           new Error('Only JPG, JPEG, and PNG image files are allowed!'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )

  @Post()
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, file.fieldname === 'profile' ? './uploads/drivers' : './uploads/driver-documents');
      },
      filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`)
    })
  }))
  async createDriver(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any
  ) {
    const mappedFiles: Record<string, Express.Multer.File> = {};
    files.forEach(file => mappedFiles[file.fieldname] = file);

    const profilePath = mappedFiles.profile?.path;
    const documentDto: CreateVerificationDocumentDto = {
      drivingLicense: mappedFiles.drivingLicense?.path,
      idProof: mappedFiles.idProof?.path,
      backgroundCheck: mappedFiles.backgroundCheck?.path,
      addressProof: mappedFiles.addressProof?.path
    };
    const vehicleDto: CreateVehicleDto | undefined =
      dto.vehicleType?.trim() || dto.licensePlate?.trim()
        ? {
          type: dto.vehicleType || undefined,
          licensePlate: dto.licensePlate || undefined,
          model: dto.vehicleModel || undefined,
          color: dto.vehicleColor || undefined,
          year: dto.vehicleYear ? Number(dto.vehicleYear) : undefined,
          insuranceNumber: mappedFiles.insuranceNumber?.path,
          rcBookNumber: mappedFiles.rcBookNumber?.path,
        }
        : undefined;



    return this.driverService.create(dto, profilePath, vehicleDto, documentDto);
  }


  // @Get()
  // async getAllDrivers(
  //   @Query('page') page: number,
  //   @Query('limit') limit: number,
  //   @Query('keyword') keyword?: string,
  // ) {
  //   return this.driverService.findAll(page, limit, { keyword });
  // }
  // driver.controller.ts
  @Get()
  async getAllDrivers(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10; // default 10 per page
    return this.driverService.getAllDrivers(pageNumber, pageSize);
  }
  /* -------------------------- Get One Driver ------------------------ */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(+id);
  }

  /* -------------------------- Update Driver ------------------------ */
  // @Patch(':id')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads/drivers',
  //       filename: (req, file, callback) => {
  //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  //       },
  //     }),
  //     fileFilter: (req, file, callback) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
  //         return callback(new Error('Only JPG, JPEG, and PNG image files are allowed!'), false);
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  // update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @UploadedFile() file?: Express.Multer.File) {
  //   if (file) {
  //     dto.profile = `/uploads/drivers/${file.filename}`;
  //   }
  //   return this.driverService.update(+id, dto);
  // }


  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, file.fieldname === 'profile' ? './uploads/drivers' : './uploads/driver-documents');
      },
      filename: (req, file, cb) =>
        cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`)
    })
  }))
  async updateDriver(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: any
  ) {
    const mappedFiles: Record<string, Express.Multer.File> = {};
    files.forEach(file => mappedFiles[file.fieldname] = file);

    const profilePath = mappedFiles.profile?.path;
    const documentDto: UpdateVerificationDocumentDto = {
      drivingLicense: mappedFiles.drivingLicense?.path,
      idProof: mappedFiles.idProof?.path,
      backgroundCheck: mappedFiles.backgroundCheck?.path,
      addressProof: mappedFiles.addressProof?.path
    };

    const vehicleDto: UpdateVehicleDto | undefined =
      dto.vehicleType?.trim() || dto.licensePlate?.trim()
        ? {
          type: dto.vehicleType || undefined,
          licensePlate: dto.licensePlate || undefined,
          model: dto.vehicleModel || undefined,
          color: dto.vehicleColor || undefined,
          year: dto.vehicleYear ? Number(dto.vehicleYear) : undefined,
          insuranceNumber: mappedFiles.insuranceNumber?.path,
          rcBookNumber: mappedFiles.rcBookNumber?.path,
        }
        : undefined;

    return this.driverService.update(+id, dto, profilePath, vehicleDto, documentDto);
  }


  /* -------------------------- Delete Driver ------------------------ */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.driverService.deleteDriver(+id);
    return {
      status: 200,
      success: true,
      message: deleted ? 'Driver deleted successfully' : 'Driver not found',
    };
  }

}
