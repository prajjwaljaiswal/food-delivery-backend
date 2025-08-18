// dto/login.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  username: string; // can be email or phone

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  device_token?: string;
}
