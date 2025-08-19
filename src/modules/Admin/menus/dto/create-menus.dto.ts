import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddOnEnum, DietaryTagEnum, VariantEnum } from 'src/models/resturant-menu.entity';

export class CreateMenuItemDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    inStock?: boolean;

    @IsNumber()
    @Type(() => Number)
    restaurantId: number;

    @IsNumber()
    @Type(() => Number)
    categoryId: number;

    @IsOptional()
    @IsString()
    variants?: string; // "Small,Medium"

    @IsOptional()
    @IsString()
    addOns?: string; // "Sauce,Topping"

    @IsOptional()
    @IsString()
    dietaryTags?: string; // "Vegan,Gluten-Free"

}
