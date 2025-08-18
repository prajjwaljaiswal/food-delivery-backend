import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsPositive,
  IsUrl,
  IsMilitaryTime,
} from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  @IsPositive()
  restaurant_id: number;

  @IsNumber()
  @IsPositive()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsOptional()
  discount_price?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsOptional()
  @IsUrl()
  image?: string;

  @IsBoolean()
  is_veg: boolean;

  @IsBoolean()
  is_customizable: boolean;

  @IsNumber()
  @IsOptional()
  preparation_time?: number;

  @IsString()
  @IsOptional()
  @IsMilitaryTime()
  available_from?: string;

  @IsString()
  @IsOptional()
  @IsMilitaryTime()
  available_to?: string;
}
