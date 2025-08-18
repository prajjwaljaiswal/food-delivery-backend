import { IsOptional, IsString, IsBoolean, IsEmail, IsMilitaryTime } from 'class-validator';

export class UpdateRestaurantProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string; // Agar password change allow karte ho

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsMilitaryTime()
  opening_time?: string;

  @IsOptional()
  @IsMilitaryTime()
  closing_time?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
// {
//   "name": "Biryani House",
//   "address": "HSR Layout, Bengaluru",
//   "phone": "9123456789",
//   "image": "https://example.com/images/new-biryani.jpg",
//   "opening_time": "10:00",
//   "closing_time": "22:30",
//   "is_active": true
// }
