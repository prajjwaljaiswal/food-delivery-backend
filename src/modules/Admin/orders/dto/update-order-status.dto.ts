// src/admin/order/dto/update-order-status.dto.ts
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @Type(() => Number)      // Converts string → number
  @IsNumber({}, { message: 'Order ID must be a valid number' })
  orderId: number;

  @IsEnum(OrderStatus, { message: 'Status must be a valid order status' })
  @IsNotEmpty()
  status: OrderStatus;
}
