import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerReportsController } from './customer-reporting.controller';
import { CustomerReportsService } from './customer-reporting.service';
import { UserEntity, Order } from 'src/models';
// import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, UserEntity])],
  controllers: [CustomerReportsController],
  providers: [CustomerReportsService],
})
export class CustomerReportsModule {}
