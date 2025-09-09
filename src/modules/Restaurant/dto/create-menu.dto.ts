import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VariantEnum, AddOnEnum, DietaryTagEnum } from 'src/models/resturant-menu.entity';

export class CreateMenuDto {
  @IsNotEmpty({ message: 'Menu title is required.' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Price is required.' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Price must be greater than or equal to 0.' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsNotEmpty({ message: 'Category ID is required.' })
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsEnum(VariantEnum, { each: true })
  variants?: VariantEnum[];

  @IsOptional()
  @IsArray()
  @IsEnum(AddOnEnum, { each: true })
  addOns?: AddOnEnum[];

  @IsOptional()
  @IsArray()
  @IsEnum(DietaryTagEnum, { each: true })
  dietaryTags?: DietaryTagEnum[];
}
