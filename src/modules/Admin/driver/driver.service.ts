
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity, Otp } from 'src/models';
// import { DriverLoginDto } from './dto/driver-login.dto';
import { Driver } from 'src/models';

@Injectable()
export class DriverService {
    constructor(
        @InjectRepository(Driver)
        private driverRepo: Repository<Driver>,

        @InjectRepository(Otp)
        private readonly otpRepo: Repository<Otp>,

    ) { }


    async create(dto: CreateDriverDto, imagePath?: string) {
        // Duplicate check — email ya phone se
        const existingDriver = await this.driverRepo.findOne({
            where: [
                { email: dto.email },
                { phone: dto.phone },
            ],
        });

        if (existingDriver) {
            return {
                status: 400,
                success: false,
                message: 'Driver with this email or phone already exists.',
            };
        }

        // Password hash
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Driver create
        const driver = this.driverRepo.create({
            ...dto,
            password: hashedPassword,
            role: { id: 3 }, // driver role
            image: imagePath,
        });

        const savedDriver = await this.driverRepo.save(driver);

        // Password ko remove karein
        delete (savedDriver as any).password;

        return {
            status: 201,
            success: true,
            message: 'Driver created successfully.',
            data: savedDriver,
        };
    }
    async findAll(page: number = 1, limit: number = 10, filters?: any) {
        const skip = (page - 1) * limit;

        let where: any;

        if (filters?.keyword) {
            const keyword = `%${filters.keyword}%`;
            // OR condition using array
            where = [
                { role: { id: 3 }, name: Like(keyword) },
                { role: { id: 3 }, email: Like(keyword) },
                { role: { id: 3 }, phone: Like(keyword) },
            ];
        } else {
            // Only role = driver
            where = { role: { id: 3 } };
        }
        const [drivers, total] = await this.driverRepo.findAndCount({
            where,
            relations: ['orders'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
            select: [
                'id',
                'name',
                'role',
                'address',
                'email',
                'phone',
                'image',
                'is_verified',
                'isActive',
                'isAvailable',
                'orders',
                'created_at',
                'updated_at',
            ],
        });

        return {
            status: 200,
            success: true,
            message: 'Drivers fetched successfully.',
            data: drivers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async findOne(id: number) {
        const driver = await this.driverRepo.findOne({
            where: { id, role: { id: 3 } },
            relations: ['orders'],
        });

        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
            };
        }

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


    async remove(id: number) {
        const driver = await this.driverRepo.findOne({ where: { id, role: { id: 3 } } });
        if (!driver) {
            return {
                status: 404,
                success: false,
                message: 'Driver not found',
            };
        }

        await this.driverRepo.softRemove(driver);

        return {
            status: 200,
            success: true,
            message: 'Driver deleted successfully',
        };
    }



}