// reset-password.dto.ts
import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDriverDto {
  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  // Optional: ensure confirmPassword matches password in controller/service
  confirmPassword: string;
}
