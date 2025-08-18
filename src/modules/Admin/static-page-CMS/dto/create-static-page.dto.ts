
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  sub_title?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_keyword?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(['W', 'A'])
  platform?: 'W' | 'A';

  @IsOptional()
  @IsNumber()
  status?: number;
}