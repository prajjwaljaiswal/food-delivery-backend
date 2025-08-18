// src/restaurant/auth/dto/login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDriverDto {
  @IsString()
  @IsNotEmpty()
  username: string; // email or phone

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  device_token: string;
}
