// File: src/admin/driver/dto/update-driver.dto.ts

import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsEmail,
  MinLength,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { DriverStatus } from 'src/models/driver.entity';

export class UpdateDriverDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  name?: string;

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

  // ✅ Availability
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  // ✅ Performance tracking (optional, usually system updates these)
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
