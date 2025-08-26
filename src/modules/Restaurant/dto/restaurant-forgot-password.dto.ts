// dto/restaurant-forgot-password.dto.ts
import { IsEmail } from 'class-validator';

export class RestaurantForgotPasswordDto {
  @IsEmail()
  email: string;
}
