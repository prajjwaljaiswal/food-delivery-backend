// create-address.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  pincode: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  label?: string;
}
