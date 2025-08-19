import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;



  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isVisible?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsEnum(['starter', 'main', 'dessert', 'drink', 'addon'])
  type?: 'starter' | 'main' | 'dessert' | 'drink' | 'addon';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Agar string hai to comma ke basis par split kardo
    return typeof value === 'string' ? value.split(',').map(v => v.trim()) : value;
  })
  tags?: string[];

  @IsInt()
  @Type(() => Number)
  restaurantId: number; // REQUIRED: must exist in restaurants table
}
