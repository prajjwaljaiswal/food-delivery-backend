// src/admin/order/dto/create-order.dto.ts

export class CreateOrderDto {
  userId: number;
  restaurantId: number;
  productIds: number[];
}
