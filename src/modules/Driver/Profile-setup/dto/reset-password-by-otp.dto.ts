
// dto/restaurant-reset-password-by-otp.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class DriverResetPasswordByOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  otpCode: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
