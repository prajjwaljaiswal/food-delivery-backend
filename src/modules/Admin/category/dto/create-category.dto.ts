import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  slug: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
