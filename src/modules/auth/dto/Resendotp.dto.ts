// src/auth/dto/resend-otp.dto.ts
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsEnum(['verify', 'forgot_password', 'restaurant_forgot_password'], {
    message: 'otp_type must be either "verify" or "forgot_password"',
  })
  @IsOptional()
  otp_type: 'verify' | 'forgot_password';
}
