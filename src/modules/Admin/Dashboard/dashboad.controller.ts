import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from './dashboad.service';
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  async getStats() {
    return await this.dashboardService.getDashboardStats();
  }
}
