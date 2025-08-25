import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from 'src/models/driver/Vehicle.entity';
import { Driver } from 'src/models';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
        @InjectRepository(Driver) private driverRepo: Repository<Driver>,
    ) {


    }
    private sanitizeVehicle(vehicle: Vehicle) {
        if (vehicle.driver) {
            const { password, ...driverData } = vehicle.driver;
            return { ...vehicle, driver: driverData };
        }
        return vehicle;
    }
    // vehicle.service.ts
    async create(driverId: number, createDto: CreateVehicleDto) {
        // Driver check
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
                data: null,
            };
        }

        // Duplicate license plate check
        const existingVehicle = await this.vehicleRepo.findOne({ where: { licensePlate: createDto.licensePlate } });
        if (existingVehicle) {
            return {
                status: 409,
                success: false,
                message: 'Vehicle with this license plate already exists',
                data: existingVehicle,
            };
        }

        // Create new vehicle linked to driver
        const vehicle = this.vehicleRepo.create({ ...createDto, driver });
        const saved = await this.vehicleRepo.save(vehicle);

        return {
            status: 200,
            success: true,
            message: 'Vehicle created successfully',
            data: saved,
        };
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        // Data fetch with pagination
        const [vehicles, total] = await this.vehicleRepo.findAndCount({
            relations: ['driver'],
            skip,
            take: limit,
            order: { id: 'DESC' }, // latest first
        });

        return {
            status: 200,
            success: true,
            message: 'Vehicles fetched successfully',
            data: vehicles.map(v => this.sanitizeVehicle(v)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async findOne(id: number) {
        const vehicle = await this.vehicleRepo.findOne({ where: { id }, relations: ['driver'] });
        if (!vehicle) {
            return {
                status: 404,
                success: false,
                message: 'Vehicle not found',
                data: null,
            };
        }
        return {
            status: 200,
            success: true,
            message: 'Vehicle fetched successfully',
            data: this.sanitizeVehicle(vehicle),
        };
    }

    // async update(id: number, updateDto: UpdateVehicleDto) {
    //     const vehicle = await this.vehicleRepo.findOne({ where: { id }, relations: ['driver'] });
    //     if (!vehicle) {
    //         return {
    //             status: 404,
    //             success: false,
    //             message: 'Vehicle not found',
    //             data: null,
    //         };
    //     }

    //     if (updateDto.driverId) {
    //         const driver = await this.driverRepo.findOne({ where: { id: updateDto.driverId } });
    //         if (!driver) {
    //             return {
    //                 status: 404,
    //                 success: false,
    //                 message: 'Driver not found',
    //                 data: null,
    //             };
    //         }
    //         vehicle.driver = driver;
    //     }

    //     Object.assign(vehicle, updateDto);
    //     const updated = await this.vehicleRepo.save(vehicle);

    //     return {
    //         status: 200,
    //         success: true,
    //         message: 'Vehicle updated successfully',
    //         data: this.sanitizeVehicle(updated),
    //     };
    // }


    async remove(id: number) {
        const vehicle = await this.vehicleRepo.findOne({ where: { id } });
        if (!vehicle) {
            return {
                status: 404,
                success: false,
                message: 'Vehicle not found',
                data: null,
            };
        }

        await this.vehicleRepo.remove(vehicle);
        return {
            status: 200,
            success: true,
            message: 'Vehicle deleted successfully',
            data: null,
        };
    }
}
