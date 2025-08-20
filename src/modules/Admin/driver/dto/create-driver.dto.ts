// src/admin/driver/dto/create-driver.dto.ts

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
import { DriverStatus } from 'src/models/driver/driver_Info.entity';

export class CreateDriverDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6)
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
  profile?: string;

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
  @IsNumber()
  roleId?: number; 

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

  // ✅ Earnings & Payouts
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @IsOptional()
  @IsNumber()
  pendingPayout?: number;

  @IsOptional()
  lastPayoutAt?: Date;

  // ✅ Live location
  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
}
