// src/admin/driver/dto/create-verification-document.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CreateVerificationDocumentDto {
  @IsOptional()
  driverId?: number;

  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @IsOptional()
  @IsString()
  idProof?: string;

  @IsOptional()
  @IsString()
  backgroundCheck?: string;

  @IsOptional()
  @IsString()
  addressProof?: string;

  
}
