import { Controller, Get, Param, Delete, Patch, Body, UseGuards, Query, Post, BadRequestException } from '@nestjs/common';
import { OrderService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard, RoleGuard, Roles } from 'src/common/guards/jwt-auth.guard';
import { RoleEnum } from 'src/common/enums/roles.enum';


// @UseGuards(JwtAuthGuard, RoleGuard)
// @Roles(RoleEnum.ADMIN)
@Controller('admin/orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get()
    findAll() {
        return this.orderService.findAll();
    }

 @Get('/list')
async getOrdersSummary(
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10'
) {
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  return this.orderService.getOrdersSummary(pageNumber, pageSize);
}


    @Get(':id')
    findOne(@Param('id') id: string) {
        const orderId = Number(id);
        if (isNaN(orderId)) {
            throw new BadRequestException('Invalid order ID');
        }
        return this.orderService.findOne(orderId);
    }

    @Get('/restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.orderService.findAllByRestaurant(+restaurantId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.orderService.delete(+id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.orderService.updateStatus(+id, dto);
    }

    // report api
    @Get('/reports/revenue')
    getRevenueReport(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('filter') filter: 'monthly' | 'quarterly' | 'yearly'
    ) {
        return this.orderService.getRevenueReport({ from, to, filter });
    }


}
