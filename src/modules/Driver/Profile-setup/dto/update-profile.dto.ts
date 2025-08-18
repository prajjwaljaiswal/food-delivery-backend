import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class UpdateDriverProfileDto {
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
  password?: string; // Agar password update karne ka option dena ho

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

