
// File: src/admin/driver/driver.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { RoleEntity, Otp } from 'src/models';
import { Driver } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, RoleEntity, Otp])],
  controllers: [DriverController],
  providers: [DriverService],
})
export class DriverModule {}
