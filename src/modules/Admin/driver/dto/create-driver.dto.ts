// File: src/admin/driver/dto/create-driver.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

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

}


