import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from 'src/common/enums/Payment-method.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';

export class CreatePaymentDto {
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString() // or @IsUUID() if using UUID
  transactionId?: string;

  @IsNumber()
  orderId: number;
}
