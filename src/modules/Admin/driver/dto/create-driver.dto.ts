// src/admin/driver/dto/create-driver.dto.ts

import { Type } from 'class-transformer';
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
  IsDate,
} from 'class-validator';
import { DriverStatus } from 'src/models/driver/driver_Info.entity';

export class CreateDriverDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  phone: string;

  @IsOptional() @IsString() vehicleType?: string;
  @IsOptional() @IsString() vehicleModel?: string;
  @IsOptional() @IsString() vehicleColor?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vehicleYear?: number;

  @IsOptional() @IsString() licensePlate?: string;
  @IsOptional() @IsString() insuranceNumber?: string;
  @IsOptional() @IsString() rcBookNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
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


  @IsOptional()
  @IsNumber()
  roleId?: number;


  // ✅ Verification documents
  @IsOptional()
  @IsString()
  idProof?: string; @IsOptional()
  @IsString()
  gender?: string;  // e.g., 'male', 'female', 'other'

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dob?: Date;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

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
