// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { RestaurantProfileModule } from './Profile-Setup/profile.module';
// import { DriverModule } from './driver/driver.module';
@Module({
  imports: [RestaurantProfileModule],
})
export class ResturenMainModule { }
