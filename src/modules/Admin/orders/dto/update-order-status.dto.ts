// src/admin/order/dto/update-order-status.dto.ts

import { IsIn } from 'class-validator';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'])
  status: OrderStatus;
}
