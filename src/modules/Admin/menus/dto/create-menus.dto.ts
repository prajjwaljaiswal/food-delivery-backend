import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuItemDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    inStock?: boolean;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    restaurantId: number;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    categoryId: number;

    @IsOptional()
    @IsString()
    variants?: string;

    @IsOptional()
    @IsString()
    addOns?: string;

    @IsOptional()
    @IsString()
    dietaryTags?: string;
}
