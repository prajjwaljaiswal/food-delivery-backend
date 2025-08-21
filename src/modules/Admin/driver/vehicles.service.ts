import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Driver } from 'src/models';
import { Vehicle } from 'src/models/driver/Vehicle.entity';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
        @InjectRepository(Driver) private driverRepo: Repository<Driver>
    ) { }

    async create(createDto: CreateVehicleDto): Promise<Vehicle> {
        const driver = await this.driverRepo.findOne({ where: { id: createDto.driverId } });
        if (!driver) throw new NotFoundException('Driver not found');

        const vehicle = this.vehicleRepo.create({ ...createDto, driver });
        return this.vehicleRepo.save(vehicle);
    }

    async findAll(): Promise<Vehicle[]> {
        return this.vehicleRepo.find({ relations: ['driver'] });
    }

    async findOne(id: number): Promise<Vehicle> {
        const vehicle = await this.vehicleRepo.findOne({ where: { id }, relations: ['driver'] });
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        return vehicle;
    }

    async update(id: number, updateDto: UpdateVehicleDto): Promise<Vehicle> {
        const vehicle = await this.findOne(id);

        if (updateDto.driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: updateDto.driverId } });
            if (!driver) throw new NotFoundException('Driver not found');
            vehicle.driver = driver;
        }

        Object.assign(vehicle, updateDto);
        return this.vehicleRepo.save(vehicle);
    }

    async remove(id: number): Promise<{ message: string }> {
        const vehicle = await this.findOne(id);
        await this.vehicleRepo.remove(vehicle);
        return { message: 'Vehicle deleted successfully' };
    }
}
