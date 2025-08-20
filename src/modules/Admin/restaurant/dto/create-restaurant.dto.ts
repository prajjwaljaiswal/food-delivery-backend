import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsBoolean,
  IsArray,
  IsObject
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  address: string;


  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  secondaryPhone?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  @Transform(({ value }) => {
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  })
  weeklySchedule?: {
    [day: string]: { openTime: string; closeTime: string; isOpen: boolean };
  };

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === null || value === undefined ? undefined : String(value)))
  description?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  enableOnlineOrders?: boolean;


  @IsOptional()
  @IsBoolean()

  @Transform(({ value }) => value === 'true' || value === true)
  enableTableBooking?: boolean;
  // ✅ Single logo
  @IsOptional()
  @IsString()
  logo?: string;

  // ✅ Multiple gallery images
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  // ✅ Multiple banner images
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bannerImages?: string[];


  /* ---------------- Certificates ---------------- */
  @IsOptional()
  @IsString()
  foodSafetyCertificate?: string;

  @IsOptional()
  @IsString()
  taxIdCertificate?: string;

  @IsOptional()
  @IsString()
  businessLicense?: string;

  @IsOptional()
  @IsString()
  insuranceCertificate?: string;

}
