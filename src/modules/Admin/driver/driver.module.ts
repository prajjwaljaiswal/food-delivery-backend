
// File: src/admin/driver/driver.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { RoleEntity, Otp } from 'src/models';
import { Driver } from 'src/models';
import { DriverTracking } from 'src/models/driver/Live_location';
import { DriverEarnings } from 'src/models/driver/driver_Earnings_payout';
import { DriverPerformance } from 'src/models/driver/driver_Performance';
import { Vehicle } from 'src/models/driver/Vehicle.entity';
import { VerificationDocument } from 'src/models/driver/Verification_documents.entites';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, RoleEntity, Otp, DriverTracking, DriverEarnings, DriverPerformance, VerificationDocument, Vehicle])],
  controllers: [DriverController],
  providers: [DriverService],
})
export class DriverModule { }
