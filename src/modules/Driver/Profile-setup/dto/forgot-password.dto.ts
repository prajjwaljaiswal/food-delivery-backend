// dto/restaurant-forgot-password.dto.ts
import { IsEmail } from 'class-validator';

export class DriverForgotPasswordDto {
  @IsEmail()
  email: string;
}
