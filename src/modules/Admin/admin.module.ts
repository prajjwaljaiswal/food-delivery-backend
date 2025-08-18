// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { RestaurantModule } from './restaurant/restaurant.module';
// import { OrderModule } from './orders/orders.module';
import { PaymentsModule } from './payment/payment.module';
import { DriverModule } from './driver/driver.module';
import { AdminUserModule } from './Customer-curd/admin-user.module';
import { CustomerReportsModule } from './Customer-Reporting/customer-reporting.module';
import { CouponModule } from './Cupon/cuapon.module';
import { PageModule } from './static-page-CMS/static-page.module';
import { OrderModule } from './orders/orders.module';
// import { DriverModule } from './driver/driver.module';
@Module({
  imports: [CategoryModule, ProductModule, RestaurantModule, OrderModule, PaymentsModule, DriverModule, AdminUserModule,
    CouponModule, PageModule
  ],
})
export class AdminModule { }
