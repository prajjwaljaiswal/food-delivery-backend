import {
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp_code: string;

  @IsOptional()
  @IsIn(['verify', 'forgot_password', 'restaurant_forgot_password', 'driver_forgot_password','resend-otp'])
  @IsNotEmpty()
  otp_type: string;

  @IsString()
  device_token?: string;
}
