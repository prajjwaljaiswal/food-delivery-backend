import { IsArray, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  restaurantId: number;

  @IsArray()
  menuItemIds: number[];

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @IsOptional()
  totalAmount?: number; // optional front-end input

  @IsNumber()
  @IsOptional()
  addressId: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number; // optional front-end input
}
