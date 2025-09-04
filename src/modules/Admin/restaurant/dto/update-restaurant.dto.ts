import { IsOptional, MinLength, IsString, IsPhoneNumber, IsNotEmpty, IsEmail, IsObject, IsBoolean, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  deletedImages?: {
    logo?: string[];
    bannerImages?: string[];
    galleryImages?: string[];
    foodSafetyCertificate?: string[];
    taxIdCertificate?: string[];
    businessLicense?: string[];
    insuranceCertificate?: string[];
  };

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
  logo?: string | null;

  // ✅ Multiple images
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bannerImages?: string[];

  // ✅ Other certificates
  @IsOptional()
  @IsString()
  foodSafetyCertificate?: string | null;

  @IsOptional()
  @IsString()
  taxIdCertificate?: string | null;

  @IsOptional()
  @IsString()
  businessLicense?: string | null;

  @IsOptional()
  @IsString()
  insuranceCertificate?: string | null;
}
