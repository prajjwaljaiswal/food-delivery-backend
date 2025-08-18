import { IsOptional, IsString, IsPhoneNumber, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateDriverDto {

  @IsOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

  @IsOptional()
    @IsPhoneNumber('IN')
    @IsNotEmpty()
    phone: string;

  @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsNotEmpty()
    password: string;

    @IsString()
  @IsOptional()
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
    @IsOptional()
    @IsNotEmpty()
    name: string;
}
