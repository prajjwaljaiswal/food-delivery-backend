import {
  IsEmail,
  IsNotEmpty,
  Length,
  MinLength,
  IsNumberString,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Match } from 'src/common/decorators/match.decorator';

export class RestaurantRegisterDto {
  @IsNotEmpty({ message: 'Restaurant name is required.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Owner name is required.' })
  @IsString()
  ownerName: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @IsNumberString({}, { message: 'Phone number must contain only digits.' })
  @Length(10, 15, { message: 'Phone number must be between 10 to 15 digits.' })
  phone: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Secondary phone number must contain only digits.' })
  @Length(10, 15, { message: 'Secondary phone number must be between 10 to 15 digits.' })
  secondaryPhone?: string;

  @IsNotEmpty({ message: 'Address is required.' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required.' })
  @Match('password', { message: 'Confirm password must match password.' })
  confirm_password: string;

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
  description?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableOnlineOrders?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enableTableBooking?: boolean;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  galleryImages?: string[];

  @IsOptional()
  bannerImages?: string[];

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

  @IsOptional()
  weeklySchedule?: {
    monday?: { openTime: string; closeTime: string; isOpen: boolean };
    tuesday?: { openTime: string; closeTime: string; isOpen: boolean };
    wednesday?: { openTime: string; closeTime: string; isOpen: boolean };
    thursday?: { openTime: string; closeTime: string; isOpen: boolean };
    friday?: { openTime: string; closeTime: string; isOpen: boolean };
    saturday?: { openTime: string; closeTime: string; isOpen: boolean };
    sunday?: { openTime: string; closeTime: string; isOpen: boolean };
  };
}
