import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Driver } from 'src/models';
import { Vehicle } from 'src/models/driver/Vehicle.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vehicle, Driver]), // Vehicle aur Driver repository inject karne ke liye
    ],
    controllers: [VehiclesController],
    providers: [VehiclesService],
    exports: [VehiclesService],
})
export class VehiclesModule { }
