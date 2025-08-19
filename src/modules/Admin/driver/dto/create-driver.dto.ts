// File: src/admin/driver/dto/create-driver.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { DriverStatus } from 'src/models/driver.entity';

export class CreateDriverDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // ✅ Driver status
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  // ✅ Vehicle details
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @IsOptional()
  @IsString()
  rcBookNumber?: string;

  // ✅ Verification documents
  @IsOptional()
  @IsString()
  idProof?: string;

  @IsOptional()
  @IsString()
  licenseDoc?: string;

  @IsOptional()
  @IsString()
  backgroundCheck?: string;

  // ✅ Availability (online/offline)
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  // ✅ Performance stats
  @IsOptional()
  @IsNumber()
  completedDeliveries?: number;

  @IsOptional()
  @IsNumber()
  averageRating?: number;

  @IsOptional()
  @IsNumber()
  cancellations?: number;
}
