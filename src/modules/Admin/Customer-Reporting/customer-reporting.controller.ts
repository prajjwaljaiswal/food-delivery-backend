import { Controller, Get, Query } from '@nestjs/common';
import { CustomerReportsService } from './customer-reporting.service';

@Controller('admin/reports/customers')
export class CustomerReportsController {
  constructor(private readonly reportService: CustomerReportsService) {}

  // GET /admin/reports/customers/top?by=orders&limit=5
  @Get('top')
  async getTopCustomers(
    @Query('by') by: 'orders' | 'amount' = 'orders',
    @Query('limit') limit = 5,
  ) {
    const rawCustomers = await this.reportService.getTopCustomers(by, +limit);

    const customers = rawCustomers.map((customer) => ({
      ...customer,
      name: `${customer.first_name} ${customer.last_name}`,
      first_name: undefined,
      last_name: undefined,
    }));

    return customers;
  }

  // GET /admin/reports/customers/returning
  @Get('returning')
  async getNewVsReturningCustomers() {
    return this.reportService.getNewVsReturningUsers(); // ✅ CORRECT

  }

  // GET /admin/reports/customers/clv
  @Get('clv')
  async getCustomerLifetimeValue() {
    return this.reportService.getCustomerLifetimeValue();
  }
}
