// src/auth/dto/resend-otp.dto.ts
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  email: string;

  @IsEnum(['verify', 'forgot_password', 'restaurant_forgot_password','resend-otp'], {
    message: 'otp_type must be either "verify" or "forgot_password" and "resend-otp"',
  })
  @IsOptional()
  otp_type: 'verify' | 'forgot_password';
}
