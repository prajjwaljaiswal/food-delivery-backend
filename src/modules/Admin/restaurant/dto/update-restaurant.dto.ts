
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsOptional, MinLength, IsString } from 'class-validator';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
    @IsOptional() // ✅ update me password optional
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;
}
