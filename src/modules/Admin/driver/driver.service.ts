
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity, Otp, RoleEntity } from 'src/models';
// import { DriverLoginDto } from './dto/driver-login.dto';
import { Driver } from 'src/models';
import { DriverStatus } from 'src/models/driver/driver_Info.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateVerificationDocumentDto } from './dto/create-driver-verification.dto';
import { Vehicle } from 'src/models/driver/Vehicle.entity';
import { VerificationDocument } from 'src/models/driver/Verification_documents.entites';

@Injectable()
export class DriverService {
    constructor(
        @InjectRepository(Driver)
        private driverRepo: Repository<Driver>,

        @InjectRepository(Otp)
        private readonly otpRepo: Repository<Otp>,


        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
        @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
        @InjectRepository(VerificationDocument) private readonly documentRepo: Repository<VerificationDocument>,


    ) { }
    // async create(dto: CreateDriverDto, imagePath?: string) {
    //     // Include soft-deleted drivers in search
    //     const existingDriver = await this.driverRepo.findOne({
    //         where: [{ email: dto.email }, { phone: dto.phone }],
    //         withDeleted: true,
    //     });

    //     if (existingDriver) {
    //         if (existingDriver.deletedAt) {
    //             // Soft-deleted record exists → restore it
    //             existingDriver.deletedAt = undefined;
    //             existingDriver.name = dto.name;
    //             existingDriver.address = dto.address;
    //             if (dto.email) existingDriver.email = dto.email;
    //             if (dto.phone) existingDriver.phone = dto.phone;
    //             existingDriver.profile = imagePath;
    //             existingDriver.status = DriverStatus.PENDING;

    //             // New fields
    //             existingDriver.gender = dto.gender;
    //             existingDriver.dob = dto.dob;
    //             existingDriver.city = dto.city;
    //             existingDriver.state = dto.state;
    //             existingDriver.pincode = dto.pincode;

    //             if (dto.password) {
    //                 existingDriver.password = await bcrypt.hash(dto.password, 10);
    //             }

    //             const restoredDriver = await this.driverRepo.save(existingDriver);
    //             delete (restoredDriver as any).password;

    //             return {
    //                 status: 200,
    //                 success: true,
    //                 message: 'Soft-deleted driver restored successfully.',
    //                 data: restoredDriver,
    //             };
    //         } else {
    //             // Already exists and not deleted
    //             throw new BadRequestException('Driver with this email or phone already exists.');
    //         }
    //     }

    //     // Normal creation
    //     const hashedPassword = await bcrypt.hash(dto.password, 10);
    //     const roleId = dto.roleId || 3; // default driver role
    //     const role = await this.roleRepo.findOne({ where: { id: roleId } });

    //     if (!role) {
    //         throw new BadRequestException('Invalid role ID.');
    //     }

    //     const driver = this.driverRepo.create({
    //         ...dto,
    //         password: hashedPassword,
    //         role,
    //         profile: imagePath,
    //         status: DriverStatus.PENDING,
    //     });

    //     // Ensure new fields are explicitly included in case dto spread misses anything
    //     driver.gender = dto.gender;
    //     driver.dob = dto.dob;
    //     driver.city = dto.city;
    //     driver.state = dto.state;
    //     driver.pincode = dto.pincode;

    //     const savedDriver = await this.driverRepo.save(driver);
    //     delete (savedDriver as any).password;

    //     return {
    //         status: 201,
    //         success: true,
    //         message: 'Driver created successfully.',
    //         data: savedDriver,
    //     };
    // }


    async create(
        dto: CreateDriverDto,
        profilePath?: string,
        vehicleDto?: CreateVehicleDto,
        documentDto?: CreateVerificationDocumentDto,
    ) {
        // 1️⃣ Driver creation (existing/restore/new)
        let driver = await this.driverRepo.findOne({
            where: [{ email: dto.email }, { phone: dto.phone }],
            withDeleted: true,
        });

        if (driver) {
            // restore/update driver
            if (!driver.deletedAt) throw new BadRequestException('Driver already exists');
            driver.deletedAt = undefined;
            driver = Object.assign(driver, dto, { profile: profilePath, status: DriverStatus.PENDING });
            if (dto.password) driver.password = await bcrypt.hash(dto.password, 10);
            driver = await this.driverRepo.save(driver);
        } else {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const role = await this.roleRepo.findOne({ where: { id: dto.roleId || 3 } });
            if (!role) throw new BadRequestException('Invalid role ID');
            driver = this.driverRepo.create({ ...dto, password: hashedPassword, role, profile: profilePath, status: DriverStatus.PENDING });
            driver = await this.driverRepo.save(driver);
        }

        delete (driver as any).password;

        // 2️⃣ Vehicle creation if provided
        let vehicle: Vehicle | undefined;
        if (vehicleDto) {
            vehicle = this.vehicleRepo.create({ ...vehicleDto, driver });
            vehicle = await this.vehicleRepo.save(vehicle);
        }

        // 3️⃣ Verification document creation if provided
        let document: VerificationDocument | undefined;
        if (documentDto) {
            document = this.documentRepo.create({ ...documentDto, driver, driverId: driver.id });
            document = await this.documentRepo.save(document);
        }

        return {
            status: 201,
            success: true,
            message: 'Driver, vehicle, and documents created successfully.',
            data: { driver, vehicle, document },
        };
    }



    // async findAll(
    //     page: number = 1,
    //     limit: number = 10,
    //     filter?: { keyword?: string }
    // ) {
    //     const skip = (page - 1) * limit;

    //     const query = this.driverRepo.createQueryBuilder('driver')
    //     // .leftJoinAndSelect('driver.role', 'role')
    //     // .leftJoinAndSelect('driver.earnings', 'earnings') // optional
    //     // .leftJoinAndSelect('driver.documents', 'documents') // optional
    //     // .leftJoinAndSelect('driver.vehicles', 'vehicles') // optional
    //     // .leftJoinAndSelect('driver.performance', 'performance') // optional
    //     // .leftJoinAndSelect('driver.trackingRecords', 'tracking') // optional
    //     // .leftJoinAndSelect('driver.orders', 'orders') // <-- include orders
    //     // .where('role.id = :roleId', { roleId: 3 }); // only drivers

    //     if (filter?.keyword) {
    //         query.andWhere(
    //             '(driver.name LIKE :keyword OR driver.email LIKE :keyword OR driver.phone LIKE :keyword)',
    //             { keyword: `%${filter.keyword}%` }
    //         );
    //     }

    //     query.skip(skip).take(limit).orderBy('driver.id', 'ASC');

    //     const [drivers, total] = await query.getManyAndCount();

    //     // Remove password before returning
    //     const sanitizedDrivers = drivers.map(driver => {
    //         const { password, ...rest } = driver;
    //         return rest;
    //     });

    //     return {
    //         status: 200,
    //         success: true,
    //         message: 'Drivers fetched successfully.',
    //         data: sanitizedDrivers,
    //         pagination: {
    //             total,
    //             page,
    //             limit,
    //             totalPages: Math.ceil(total / limit),
    //         },
    //     };
    // }

    // driver.service.ts
    async getAllDrivers(page: number, limit: number) {
        const [drivers, total] = await this.driverRepo.findAndCount({
            relations: ['vehicles', 'verificationDocuments'],
            order: { id: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const formattedData = drivers.map(driver => ({
            id: driver.id,
            name: driver.name,
            phone: driver.phone,
            email: driver.email,
            isActive: driver.isActive,
            profile: driver.profile,
            vehicles: driver.vehicles?.map(v => ({
                id: v.id,
                type: v.type,
                licensePlate: v.licensePlate,
                model: v.model,
                color: v.color,
                year: v.year
            })),
            documents: driver.verificationDocuments?.map(d => ({
                id: d.id,
                drivingLicense: d.drivingLicense,
                idProof: d.idProof,
                backgroundCheck: d.backgroundCheck
            }))
        }));

        return {
            status: 200,
            success: true,
            message: 'Drivers fetched successfully',
            data: formattedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async findOne(id: number) {
        const driver = await this.driverRepo.findOne({
            where: { id /*, role: { id: 3 } */ }, // role filter abhi comment kiya
            // relations: [
            //     'orders',
            //     'earnings',
            //     'documents',
            //     'vehicles',
            //     'performance',
            //     'trackingRecords',
            // ], // optional future joins
        });

        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
            };
        }

        // Remove password before returning
        const { password, ...driverWithoutPassword } = driver;

        return {
            status: 200,
            success: true,
            message: 'Driver fetched successfully',
            data: driverWithoutPassword,
        };
    }

    async update(id: number, updateDriverDto: UpdateDriverDto) {
        const driver = await this.driverRepo.findOne({ where: { id, role: { id: 3 } } });
        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
            };
        }

        const updatedDriver = Object.assign(driver, updateDriverDto);
        const savedDriver = await this.driverRepo.save(updatedDriver);

        const { password, ...driverWithoutPassword } = savedDriver;

        return {
            status: 200,
            success: true,
            message: 'Driver updated successfully',
            data: driverWithoutPassword,
        };
    }

    // async remove(id: number): Promise<boolean> {
    //     const driver = await this.driverRepo.findOne({ where: { id, role: { id: 3 } } });
    //     if (!driver) return false;

    //     await this.driverRepo.softRemove(driver);
    //     return true;
    // }
    // driver.service.ts
    async deleteDriver(id: number) {
        // 1️⃣ Driver ke record ke saath relations bhi load karo
        const driver = await this.driverRepo.findOne({
            where: { id, role: { id: 3 } },
            relations: ['verificationDocuments', 'vehicles'],
        });

        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
                data: [],
            };
        }

        // 2️⃣ Soft delete driver
        await this.driverRepo.softRemove(driver);

        // 3️⃣ Agar relations hai toh unka bhi soft delete karo
        if (driver.verificationDocuments?.length) {
            await this.documentRepo.softRemove(driver.verificationDocuments);
        }
        if (driver.vehicles?.length) {
            await this.vehicleRepo.softRemove(driver.vehicles);
        }

        // 4️⃣ Standard response
        return {
            status: 200,
            success: true,
            message: 'Driver deleted successfully',
            data: [],
        };
    }



}