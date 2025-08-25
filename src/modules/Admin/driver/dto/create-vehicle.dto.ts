import { IsNotEmpty, IsOptional, IsString, IsNumber, isString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string; // optional

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  type: string;

  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @IsOptional()
  @IsString()
  rcBookNumber?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  year?: number;
}
