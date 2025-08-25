// // src/admin/restaurant/restaurant.service.ts

// import {
//     BadRequestException,
//     Body,
//     Injectable,
//     InternalServerErrorException,
//     NotFoundException,
//     Req,
//     Logger,
//     UnauthorizedException,
// } from '@nestjs/common';
// import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
// import { DataSource, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';


// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// import { DeviceToken, UserEntity, Otp } from 'src/models';
// import { EmailService } from 'src/common/email/email.service';
// import { VerifyOtpDto } from 'src/modules/auth/dto/verify-otp.dto';
// import { ResendOtpDto } from 'src/modules/auth/dto/Resendotp.dto';
// import { UpdateDriverProfileDto } from './dto/update-profile.dto';
// import { LoginDriverDto } from './dto/login.dto';
// import { ResetPasswordDriverDto } from './dto/reset-password.dto';
// import { DriverForgotPasswordDto } from './dto/forgot-password.dto';
// import { Driver } from 'src/models';

// @Injectable()
// export class DriverService {
//     private readonly logger = new Logger(DriverService.name);

//     constructor(

//         @InjectDataSource() private dataSource: DataSource,
//         private readonly emailService: EmailService,

//         @InjectRepository(Driver)
//         private readonly driverRepo: Repository<Driver>,

//         @InjectRepository(DeviceToken)
//         private readonly deviceTokenRepo: Repository<DeviceToken>,

//         @InjectRepository(UserEntity)
//         private readonly userRepo: Repository<UserEntity>,

//         private readonly jwtService: JwtService,

//         @InjectRepository(Otp)
//         private readonly otpRepo: Repository<Otp>,
//     ) { }
//     private generateOtpCode(): string {
//         return Math.floor(100000 + Math.random() * 900000).toString();
//     }
//     private getOtpExpiry(): Date {
//         return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
//     }
//     private async saveDeviceTokenWithRunner(
//         user: UserEntity | Driver,
//         deviceToken: string,
//         ip: string,
//         jwt: string,
//         deviceTokenRepo: Repository<DeviceToken>, // ✅ pass repo from inside transaction
//         role: string,
//     ) {
//         if (!deviceToken) return;
//         const existing = await deviceTokenRepo.findOne({ where: { deviceToken } });

//         if (existing) {
//             existing.ipAddress = ip;
//             existing.jwtToken = jwt;
//             existing.user_id = user instanceof UserEntity ? user.id : undefined;
//             existing.driver_id = user instanceof Driver ? user.id : undefined;
//             existing.role = role; // ✅ yeh set karo
//             await deviceTokenRepo.save(existing);
//         } else {
//             await deviceTokenRepo.save({
//                 user_id: user instanceof UserEntity ? user.id : undefined,
//                 driver_id: user instanceof Driver ? user.id : undefined,
//                 deviceToken,
//                 ipAddress: ip,
//                 jwtToken: jwt,
//                 role, // ✅ yeh bhi set karo
//             });
//         }

//     }
//     async updateProfile(driverId: number, dto: UpdateDriverProfileDto): Promise<Driver> {
//         console.log('Updating driver profile with data:', dto);

//         const driver = await this.driverRepo.findOne({ where: { id: driverId } });
//         if (!driver) {
//             throw new NotFoundException('Driver not found');
//         }

//         // Agar phone change kar rahe ho to pehle check karo unique hai ya nahi
//         if (dto.phone && dto.phone !== driver.phone) {
//             const exists = await this.driverRepo.findOne({ where: { phone: dto.phone } });
//             if (exists) {
//                 throw new BadRequestException('Phone number already in use');
//             }
//         }

//         Object.assign(driver, dto);
//         return this.driverRepo.save(driver);
//     }


//     // async loginRestaurant(dto: LoginDriverDto, req: Request) {
//     //     const { username, password, device_token } = dto;
//     //     console.log('Login attempt with:', { username, password, device_token });
//     //     let driver: Driver | null = null;

//     //     // Check login by email or phone
//     //     if (/^\S+@\S+\.\S+$/.test(username)) {
//     //         driver = await this.driverRepo.findOne({
//     //             where: { email: username },
//     //         });
//     //     } else if (/^\+?[0-9]{7,15}$/.test(username)) {
//     //         driver = await this.driverRepo.findOne({
//     //             where: { phone: username },
//     //         });
//     //     }
//     //     console.log('Driver found:', driver);

//     //     if (!driver) {
//     //         throw new UnauthorizedException('Invalid credentials');
//     //     }
//     //     const isPasswordMatch = await bcrypt.compare(password, driver.password);
//     //     // console.log('Password match:', isPasswordMatch);
//     //     if (!isPasswordMatch) {
//     //         throw new UnauthorizedException('Invalid credentials password not match');
//     //     }

//     //     const ip = req.ip;

//     //     const token = this.jwtService.sign({
//     //         sub: driver.id,
//     //         role_id: driver.role?.id || driver.role?.slug,
//     //     });

//     //     // Optionally save last login, IP, etc.
//     //     driver.updated_at = new Date();
//     //     await this.driverRepo.save(driver);

//     //     // ✅ Check if device_token already exists
//     //     const existingToken = await this.deviceTokenRepo.findOne({
//     //         where: { deviceToken: device_token },
//     //     });

//     //     if (existingToken) {
//     //         existingToken.ipAddress = ip;
//     //         existingToken.jwtToken = token;
//     //         existingToken.restaurant_id = driver.id;
//     //         existingToken.role = 'Driver'; // ✅ Correct the role
//     //         await this.deviceTokenRepo.save(existingToken);
//     //     } else {
//     //         await this.deviceTokenRepo.save({
//     //             restaurant_id: driver.id,
//     //             deviceToken: device_token,
//     //             jwtToken: token,
//     //             ipAddress: ip,
//     //             role: 'Driver',
//     //         });
//     //     }

//     //     return {
//     //         message: 'Restaurant logged in successfully',
//     //         data: {
//     //             token,
//     //             driver,
//     //             ip,
//     //         },
//     //     };
//     // }
//     /* ------------------------ Reset Password (Restaurant) ------------------------ */
//     // ✅ CORRECT
//     async resetRestaurantPassword(dto: ResetPasswordDriverDto, req: Request) {
//         try {
//             const user = req.user as any;
//             const driver = await this.driverRepo.findOne({
//                 where: { id: user.userId },
//             });

//             if (!driver) {
//                 throw new NotFoundException('driver not found');
//             }

//             if (dto.password !== dto.confirmPassword) {
//                 throw new BadRequestException('Passwords do not match');
//             }

//             const hashedPassword = await bcrypt.hash(dto.password, 10);
//             driver.password = hashedPassword;
//             await this.driverRepo.save(driver);

//             return { message: 'Password reset successfully for driver' };
//         } catch (error) {
//             throw new InternalServerErrorException({
//                 message: 'Failed to reset password',
//                 error: error.message,
//             });
//         }
//     }
// async sendForgotPasswordOtp(dto: DriverForgotPasswordDto) {
//     const driver = await this.driverRepo.findOne({ where: { email: dto.email } });
//     if (!driver) throw new BadRequestException('No driver found with this email.');

//     const otpCode = this.generateOtpCode();
//     const expiresAt = this.getOtpExpiry();

//     await this.otpRepo.save({
//         email: driver.email,
//         otpCode,
//         otpType: 'driver_forgot_password',
//         expiresAt,
//         isUsed: false,
//         otpableType: 'Driver',
//         driver,
//     });

//     try {
//         await this.emailService.sendTemplateNotification({
//             user: driver,
//             template: 'driver-forgot-password',
//             data: { otp: otpCode },
//         });
//     } catch (err) {
//         // Logging for internal debugging
//         console.error('[DriverService] Failed to send forgot password email', err);

//         // Monitoring tool ko bhejna ho to yaha call karo
//         // e.g. Sentry.captureException(err);

//         // Optionally: user ko batana ki OTP DB me save ho gaya hai
//         return {
//             message: 'OTP generated successfully but failed to send email. Please contact support.',
//         };
//     }

//     return { message: 'OTP sent to your email.' };
// }

//     async verifyDeliveryOtp(dto: VerifyOtpDto, req: Request) {
//         const queryRunner = this.dataSource.createQueryRunner();
//         await queryRunner.connect();
//         await queryRunner.startTransaction();

//         try {
//             const driverRepo = queryRunner.manager.getRepository(Driver);
//             const otpRepo = queryRunner.manager.getRepository(Otp);
//             const deviceTokenRepo = queryRunner.manager.getRepository(DeviceToken);

//             const driver = await driverRepo.findOneOrFail({
//                 where: { email: dto.email }
//             });
//             const otp = await otpRepo.findOne({
//                 where: {
//                     otpCode: dto.otp_code,
//                     email: dto.email,
//                     otpType: dto.otp_type, // should be 'restaurant_forgot_password'
//                 },
//                 order: { id: 'DESC' },
//             });

//             if (!otp) throw new BadRequestException('Invalid OTP');
//             if (otp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
//             if (otp.isUsed) throw new BadRequestException('OTP already used');

//             otp.isUsed = true;
//             await otpRepo.save(otp);

//             const ipAddress = req.ip;

<<<<<<< Updated upstream
//             const token = this.jwtService.sign({
//                 sub: driver.id,
//                 role_id: driver.role?.id || driver.role?.slug,
//             });
//             await this.saveDeviceTokenWithRunner(
//                 driver,
//                 dto.device_token ?? '',
//                 ipAddress ?? '',
//                 token,
//                 deviceTokenRepo,
//                 'Driver' // ✅ Yeh 6th argument pass karo
//             );
=======
            const token = this.jwtService.sign({
                sub: driver.id,
                role_id: driver.role?.id || driver.role?.slug,
                type: 'driver',
                email: driver.email,
            });
            await this.saveDeviceTokenWithRunner(
                driver,
                dto.device_token ?? '',
                ipAddress ?? '',
                token,
                deviceTokenRepo,
                'Driver' // ✅ Yeh 6th argument pass karo
            );
>>>>>>> Stashed changes


//             await queryRunner.commitTransaction();

//             return {
//                 message: 'OTP verified successfully',
//                 token,
//                 driver,
//             };

//         } catch (err) {
//             await queryRunner.rollbackTransaction();
//             throw new InternalServerErrorException('Something went wrong', err.message);
//         } finally {
//             await queryRunner.release();
//         }
//     }

//     async resendOtp(dto: ResendOtpDto) {
//         const queryRunner = this.dataSource.createQueryRunner();
//         await queryRunner.connect();
//         await queryRunner.startTransaction();

//         try {
//             const driverRepo = queryRunner.manager.getRepository(Driver);
//             const otpRepo = queryRunner.manager.getRepository(Otp);

//             const driver = await driverRepo.findOneOrFail({
//                 where: { email: dto.email },
//             });

//             // ✅ Expire all old OTPs automatically
//             await otpRepo.update(
//                 {
//                     email: dto.email,
//                     otpType: dto.otp_type,
//                     isUsed: false,
//                     expiresAt: LessThanOrEqual(new Date()),
//                 },
//                 { isUsed: true }
//             );

//             // ✅ Prevent OTP flooding (only if valid existing one)
//             const recentOtp = await otpRepo.findOne({
//                 where: {
//                     email: dto.email,
//                     otpType: dto.otp_type,
//                     isUsed: false,
//                     expiresAt: MoreThan(new Date()),
//                 },
//                 order: { id: 'DESC' },
//             });

//             if (recentOtp) {
//                 const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
//                 throw new BadRequestException(`Please wait ${secondsLeft} seconds before requesting another OTP.`);
//             }

//             const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//             const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//             await otpRepo.save({
//                 email: driver.email,
//                 otpCode,
//                 otpType: dto.otp_type,
//                 expiresAt,
//                 isUsed: false,
//                 otpableType: 'Driver',
//             });

//             console.log(`OTP for ${driver.email}: ${otpCode}`);

//             // ✅ Optional: Send Email
//             await this.emailService.sendTemplateNotification({
//                 user: driver,
//                 template: dto.otp_type === 'verify' ? 'Driver-welcome' : 'Driver-forgot-password',
//                 data: { otp: otpCode },
//             });

//             await queryRunner.commitTransaction();

//             return {
//                 message: 'OTP resent to your email',
//                 data: [],
//             };
//         } catch (err) {
//             await queryRunner.rollbackTransaction();
//             throw new InternalServerErrorException('Something went wrong', err.message);
//         } finally {
//             await queryRunner.release();
//         }
//     }



// }
