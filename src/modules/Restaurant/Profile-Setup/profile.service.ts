// src/admin/restaurant/restaurant.service.ts

import {
    BadRequestException,
    Body,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { Restaurant } from 'src/models';
import { LoginDto } from './dto/Resturent-login.dto';
import { DeviceToken } from 'src/models';
import { UserEntity } from 'src/models';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RestaurantResetPasswordByOtpDto } from './dto/restaurant-reset-password-by-otp.dto';
import { RestaurantForgotPasswordDto } from './dto/restaurant-forgot-password.dto';
import { EmailService } from 'src/common/email/email.service';
import { Otp } from 'src/models';
import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
import { RestaurantRegisterDto } from './dto/restaurant-register.dto';
import { RoleEntity } from 'src/models';
import { JwtUtil } from 'src/common/utils/jwt.util';

@Injectable()
export class RestaurantService {
    constructor(

        @InjectDataSource() private dataSource: DataSource,
        private readonly emailService: EmailService,

        @InjectRepository(Restaurant)
        private readonly restaurantRepo: Repository<Restaurant>,

        @InjectRepository(DeviceToken)
        private readonly deviceTokenRepo: Repository<DeviceToken>,

        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,

        private readonly jwtService: JwtService,

        @InjectRepository(Otp)
        private readonly otpRepo: Repository<Otp>,

        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,

        private readonly jwtUtil: JwtUtil,
    ) { }
    private generateOtpCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    private getOtpExpiry(): Date {
        return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
    private async saveDeviceTokenWithRunner(
        user: UserEntity | Restaurant,
        deviceToken: string,
        ip: string,
        jwt: string,
        deviceTokenRepo: Repository<DeviceToken>, // ✅ pass repo from inside transaction
        role: string,
    ) {
        if (!deviceToken) return;
        const existing = await deviceTokenRepo.findOne({ where: { deviceToken } });

        if (existing) {
            existing.ipAddress = ip;
            existing.jwtToken = jwt;
            existing.user_id = user instanceof UserEntity ? user.id : undefined;
            existing.restaurant_id = user instanceof Restaurant ? user.id : undefined;
            existing.role = role; // ✅ yeh set karo
            await deviceTokenRepo.save(existing);
        } else {
            await deviceTokenRepo.save({
                user_id: user instanceof UserEntity ? user.id : undefined,
                restaurant_id: user instanceof Restaurant ? user.id : undefined,
                deviceToken,
                ipAddress: ip,
                jwtToken: jwt,
                role, // ✅ yeh bhi set karo
            });
        }

    }

    async updateProfile(
        restaurantId: number,
        dto: UpdateRestaurantProfileDto,
    ): Promise<Restaurant> {
        const restaurant = await this.restaurantRepo.findOne({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundException('Restaurant not found');
        }
        Object.assign(restaurant, dto);
        return this.restaurantRepo.save(restaurant);
    }
    async loginRestaurant(dto: LoginDto, req: Request) {
        const { username, password, device_token } = dto;
        let restaurant: Restaurant | null = null;

        // ✅ Username format validation (email or phone)
        if (/^\S+@\S+\.\S+$/.test(username)) {
            restaurant = await this.restaurantRepo.findOne({
                where: { email: username },
                relations: ['role'],
            });
        } else if (/^\+?[0-9]{7,15}$/.test(username)) {
            restaurant = await this.restaurantRepo.findOne({
                where: { phone: username },
                relations: ['role'],
            });
        } else {
            return {
                success: false,
                status: 400,
                message: 'Invalid username. Must be email or phone.',
                data: [],
            };
        }

        if (!restaurant) {
            return {
                success: false,
                status: 401,
                message: 'Restaurant not found.',
                data: [],
            };
        }

        const isPasswordValid = await bcrypt.compare(password, restaurant.password);
        if (!isPasswordValid) {
            return {
                success: false,
                status: 401,
                message: 'Invalid credentials.',
                data: [],
            };
        }

        // If you have OTP verification flag for restaurant, you can add here similar to user

        const ip = req.ip;

        const token = this.jwtUtil.generateRestaurantToken(
            restaurant.id,
            restaurant.role?.id ?? restaurant.role?.slug ?? 2,
            restaurant.email
        );

        // Update last login info
        restaurant.updated_at = new Date();
        await this.restaurantRepo.save(restaurant);

        // Device token handling
        if (device_token) {
            const existingToken = await this.deviceTokenRepo.findOne({
                where: { deviceToken: device_token },
            });

            if (existingToken) {
                existingToken.ipAddress = ip;
                existingToken.jwtToken = token;
                existingToken.restaurant_id = restaurant.id;
                existingToken.role = 'Restaurant';
                await this.deviceTokenRepo.save(existingToken);
            } else {
                await this.deviceTokenRepo.save({
                    restaurant_id: restaurant.id,
                    deviceToken: device_token,
                    jwtToken: token,
                    ipAddress: ip,
                    role: 'Restaurant',
                });
            }
        }

        // Remove sensitive fields before sending
        const { password: _, ...safeRestaurant } = restaurant;

        return {
            success: true,
            status: 200,
            message: 'Restaurant logged in successfully.',
            data: {
                token,
                restaurant: safeRestaurant,
                ip,
            },
        };
    }

    /* -------------------------- Register Logic ------------------------ */
    async registerRestaurant(dto: RestaurantRegisterDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const restaurantRepo = queryRunner.manager.getRepository(Restaurant);
            const otpRepo = queryRunner.manager.getRepository(Otp);
            const roleRepo = queryRunner.manager.getRepository(RoleEntity);

            // ✅ Check if restaurant already exists
            const existingRestaurant = await restaurantRepo.findOne({
                where: [
                    { email: dto.email },
                    { phone: dto.phone }
                ]
            });

            if (existingRestaurant) {
                if (existingRestaurant.is_verified) {
                    return {
                        success: false,
                        status: 400,
                        message: 'Restaurant already registered and verified.',
                        data: null
                    };
                }

                // ⛔ Prevent OTP flooding
                const recentOtp = await otpRepo.findOne({
                    where: {
                        email: existingRestaurant.email,
                        otpType: 'verify',
                        isUsed: false,
                        expiresAt: MoreThan(new Date())
                    },
                    order: { id: 'DESC' }
                });

                if (recentOtp) {
                    const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
                    return {
                        success: false,
                        status: 429,
                        message: `Please wait ${secondsLeft} seconds before requesting another OTP.`,
                        data: null
                    };
                }

                // ✅ Expire old OTPs
                await otpRepo.update(
                    { email: existingRestaurant.email, otpType: 'verify', isUsed: false },
                    { isUsed: true }
                );

                // 🔁 Resend OTP
                const resendOtpCode = this.generateOtpCode();
                await otpRepo.save({
                    email: existingRestaurant.email,
                    otpCode: resendOtpCode,
                    otpType: 'verify',
                    expiresAt: this.getOtpExpiry(),
                    otpableType: 'Restaurant',
                });

                await queryRunner.commitTransaction();

                // 📧 Send email (after commit)
                try {
                    await this.emailService.sendTemplateNotification({
                        user: existingRestaurant,
                        template: 'welcome-email',
                        data: { otp: resendOtpCode },
                    });
                } catch (emailErr) {
                    console.error('Failed to send verification email', emailErr);
                }

                return {
                    success: true,
                    status: 200,
                    message: 'OTP resent to your email.',
                    data: { email: existingRestaurant.email }
                };
            }

            // 🆕 Create new restaurant
            const hashedPassword = await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
            
            // Get restaurant role (assuming role ID 2 is for restaurants)
            const restaurantRole = await roleRepo.findOne({ where: { id: 2 } });
            if (!restaurantRole) {
                return {
                    success: false,
                    status: 400,
                    message: 'Restaurant role not found.',
                    data: null
                };
            }

            const newRestaurant = restaurantRepo.create({
                ...dto,
                password: hashedPassword,
                role: restaurantRole,
                is_verified: false,
                is_active: true,
            });

            await restaurantRepo.save(newRestaurant);

            // 🔐 Generate OTP
            const otpCode = this.generateOtpCode();
            await otpRepo.save({
                email: newRestaurant.email,
                otpCode,
                otpType: 'verify',
                expiresAt: this.getOtpExpiry(),
                otpableType: 'Restaurant',
            });

            await queryRunner.commitTransaction();

            // 📧 Send OTP after commit
            try {
                await this.emailService.sendTemplateNotification({
                    user: newRestaurant,
                    template: 'welcome-email',
                    data: { otp: otpCode },
                });
            } catch (emailErr) {
                console.error('Failed to send verification email', emailErr);
            }

            // Remove sensitive fields before sending
            const { password: _, ...safeRestaurant } = newRestaurant;

            return {
                success: true,
                status: 201,
                message: 'Restaurant registered successfully. Please check your email for verification OTP.',
                data: { 
                    restaurant: safeRestaurant,
                    email: newRestaurant.email 
                }
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Restaurant registration error:', error);
            return {
                success: false,
                status: 500,
                message: 'Failed to register restaurant.',
                data: null
            };
        } finally {
            await queryRunner.release();
        }
    }
    /* ------------------------ Reset Password (Restaurant) ------------------------ */
    // ✅ CORRECT
    async resetRestaurantPassword(dto: ResetPasswordDto, req: Request) {
        try {
            const user = req.user as any;
            console.log(user, "user in resetRestaurantPassword") // ✅ Debugging line
            const restaurant = await this.restaurantRepo.findOne({
                where: { id: user.userId },
            });

            if (!restaurant) {
                throw new NotFoundException('Restaurant not found');
            }

            if (dto.password !== dto.confirmPassword) {
                throw new BadRequestException('Passwords do not match');
            }

            const hashedPassword = await bcrypt.hash(dto.password, 10);
            restaurant.password = hashedPassword;
            await this.restaurantRepo.save(restaurant);

            return { message: 'Password reset successfully for restaurant' };
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Failed to reset password',
                error: error.message,
            });
        }
    }

    async sendForgotPasswordOtp(dto: RestaurantForgotPasswordDto) {
        // console.log(dto, "dto in sendForgotPasswordOtp") // ✅ Debugging line
        const restaurant = await this.restaurantRepo.findOne({ where: { email: dto.email } });
        if (!restaurant) throw new BadRequestException('No restaurant found with this email.');
        console.log(restaurant, "restaurant in sendForgotPasswordOtp") // ✅ Debugging line
        const otpCode = this.generateOtpCode();
        const expiresAt = this.getOtpExpiry();

        await this.otpRepo.save({
            email: restaurant.email,
            otpCode,
            otpType: 'restaurant_forgot_password',
            expiresAt,
            isUsed: false,
            otpableType: 'Restaurant',
            restaurant, // set relation if needed
        });

        await this.emailService.sendTemplateNotification({
            user: restaurant,
            template: 'restaurant-forgot-password',
            data: { otp: otpCode },
        });

        return { message: 'OTP sent to your email.' };
    }

    async verifyRestaurantOtp(dto: VerifyOtpDto, req: Request) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const restaurantRepo = queryRunner.manager.getRepository(Restaurant);
            const otpRepo = queryRunner.manager.getRepository(Otp);
            const deviceTokenRepo = queryRunner.manager.getRepository(DeviceToken);

            const restaurant = await restaurantRepo.findOne({
                where: { email: dto.email },
                relations: ['role'],
            });

            if (!restaurant) {
                return {
                    success: false,
                    status: 404,
                    message: 'Restaurant not found.',
                    data: null
                };
            }

            const otp = await otpRepo.findOne({
                where: {
                    otpCode: dto.otp_code,
                    email: dto.email,
                    otpType: dto.otp_type,
                },
                order: { id: 'DESC' },
            });

            if (!otp) {
                return {
                    success: false,
                    status: 400,
                    message: 'Invalid OTP.',
                    data: null
                };
            }

            if (otp.expiresAt < new Date()) {
                return {
                    success: false,
                    status: 400,
                    message: 'OTP expired.',
                    data: null
                };
            }

            if (otp.isUsed) {
                return {
                    success: false,
                    status: 400,
                    message: 'OTP already used.',
                    data: null
                };
            }

            // ✅ Mark OTP as used
            otp.isUsed = true;
            await otpRepo.save(otp);

            const ipAddress = req.ip;

            const token = this.jwtUtil.generateRestaurantToken(
                restaurant.id,
                Number(restaurant.role?.id || restaurant.role?.slug || 2),
                restaurant.email
            );

            // ✅ Verify restaurant if needed
            if (dto.otp_type === 'verify') {
                restaurant.is_verified = true;
                await restaurantRepo.save(restaurant);
            }

            // ✅ Save device token
            await this.saveDeviceTokenWithRunner(
                restaurant,
                dto.device_token ?? '',
                ipAddress ?? '',
                token,
                deviceTokenRepo,
                'Restaurant'
            );

            await queryRunner.commitTransaction();

            // Remove sensitive fields before sending
            const { password: _, ...safeRestaurant } = restaurant;

            return {
                success: true,
                status: 200,
                message: dto.otp_type === 'verify' 
                    ? 'Restaurant verified successfully.' 
                    : 'OTP verified successfully.',
                data: {
                    token,
                    restaurant: safeRestaurant,
                    ip: ipAddress,
                }
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Restaurant OTP verification error:', error);
            return {
                success: false,
                status: 500,
                message: 'Failed to verify OTP.',
                data: null
            };
        } finally {
            await queryRunner.release();
        }
    }

    async resendOtp(dto: ResendOtpDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const restaurantRepo = queryRunner.manager.getRepository(Restaurant);
            const otpRepo = queryRunner.manager.getRepository(Otp);

            const restaurant = await restaurantRepo.findOneOrFail({
                where: { email: dto.email },
            });

            // ✅ Expire all old OTPs automatically
            await otpRepo.update(
                {
                    email: dto.email,
                    otpType: dto.otp_type,
                    isUsed: false,
                    expiresAt: LessThanOrEqual(new Date()),
                },
                { isUsed: true }
            );

            // ✅ Prevent OTP flooding (only if valid existing one)
            const recentOtp = await otpRepo.findOne({
                where: {
                    email: dto.email,
                    otpType: dto.otp_type,
                    isUsed: false,
                    expiresAt: MoreThan(new Date()),
                },
                order: { id: 'DESC' },
            });

            if (recentOtp) {
                const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
                throw new BadRequestException(`Please wait ${secondsLeft} seconds before requesting another OTP.`);
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await otpRepo.save({
                email: restaurant.email,
                otpCode,
                otpType: dto.otp_type,
                expiresAt,
                isUsed: false,
                otpableType: 'Restaurant',
            });

            console.log(`OTP for ${restaurant.email}: ${otpCode}`);

            // ✅ Optional: Send Email
            await this.emailService.sendTemplateNotification({
                user: restaurant,
                template: dto.otp_type === 'verify' ? 'restaurant-welcome' : 'restaurant-forgot-password',
                data: { otp: otpCode },
            });

            await queryRunner.commitTransaction();

            return {
                message: 'OTP resent to your email',
                data: [],
            };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Something went wrong', err.message);
        } finally {
            await queryRunner.release();
        }
    }


}
