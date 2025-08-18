import {
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsIn(['flat', 'percentage'])
  type: 'flat' | 'percentage';

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  max_discount?: number;

  @IsNumber()
  min_order_amount: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;
}
