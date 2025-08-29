import { IsOptional, IsString, IsEmail, MinLength, Length, Matches } from 'class-validator';
import { Is } from 'sequelize-typescript';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
    pincode?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string; // New password
}
