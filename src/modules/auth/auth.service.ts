import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException, Logger
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from 'src/models';
import { Otp } from 'src/models';
import { EmailService } from 'src/common/email/email.service';
import { RoleEntity } from 'src/models';
import { UnauthorizedException } from '@nestjs/common';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Request } from 'express';
import { DeviceToken } from 'src/models';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/Resendotp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    private readonly emailService: EmailService,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,

    private readonly jwtService: JwtService,
  ) { }
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  private getOtpExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  }
  private async saveDeviceTokenWithRunner(
    user: UserEntity,
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
      existing.user_id = user.id;
      existing.role = role;
      await deviceTokenRepo.save(existing);
    } else {
      await deviceTokenRepo.save({
        user_id: user.id,
        deviceToken,
        ipAddress: ip,
        jwtToken: jwt,
        role
      });
    }
  }

  /* -------------------------- Register Logic ------------------------ */



  async register(dto: RegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(UserEntity);
      const otpRepo = queryRunner.manager.getRepository(Otp);
      const roleRepo = queryRunner.manager.getRepository(RoleEntity);

      // ✅ Validate role_id
      const role = await roleRepo.findOne({ where: { id: dto.role_id } });
      if (!role) {
        return {
          status: false,
          code: 400,
          message: 'Invalid role ID provided.',
          data: null
        };
      }

      // 🔍 Check if user already exists
      const existingUser = await userRepo.findOne({
        where: [
          { email: dto.email },
          { phone: dto.phone } // ✅ Check phone too
        ]
      });

      if (existingUser) {
        // ✅ If user is already verified, stop here
        if (existingUser.isOtpVerified) {
          const conflictField = existingUser.email === dto.email ? 'Email' : 'Phone number';
          return {
            status: false,
            code: 400,
            message: `${conflictField} already registered and verified.`,
            data: null
          };
        }

        // ⛔ Prevent OTP flooding
        const recentOtp = await otpRepo.findOne({
          where: {
            email: existingUser.email,
            otpType: 'verify',
            isUsed: false,
            expiresAt: MoreThan(new Date())
          },
          order: { id: 'DESC' }
        });

        if (recentOtp) {
          const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
          return {
            status: false,
            code: 429,
            message: `Please wait ${secondsLeft} seconds before requesting another OTP.`,
            data: null
          };
        }

        // ✅ Expire old OTPs
        await otpRepo.update(
          { email: existingUser.email, otpType: 'verify', isUsed: false },
          { isUsed: true }
        );

        // 🔁 Resend OTP
        const resendOtpCode = this.generateOtpCode();
        await otpRepo.save({
          email: existingUser.email,
          channel: 'email',
          otpCode: resendOtpCode,
          otpType: 'verify',
          expiresAt: this.getOtpExpiry(),
          user: existingUser,
        });

        await queryRunner.commitTransaction();

        // 📧 Send email after commit
        try {
          await this.emailService.sendTemplateNotification({
            user: existingUser,
            template: 'welcome-email',
            data: { otp: resendOtpCode },
          });
        } catch (emailErr) {
          this.logger.error('Failed to send verification email', emailErr.stack || emailErr);
        }

        return {
          status: true,
          code: 200,
          message: 'OTP resent to your email.',
          data: { email: existingUser.email }
        };
      }


      // 🆕 Create new user
      const hashedPassword = await bcrypt.hash(dto.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
      const newUser = userRepo.create({
        ...dto,
        password: hashedPassword,
        role,
      });
      await userRepo.save(newUser);

      // 🔐 Generate OTP
      const otpCode = this.generateOtpCode();
      await otpRepo.save({
        email: newUser.email,
        channel: 'email',
        otpCode,
        otpType: 'verify',
        expiresAt: this.getOtpExpiry(),
        user: newUser,
      });

      await queryRunner.commitTransaction();

      // 📧 Send OTP after commit
      try {
        await this.emailService.sendTemplateNotification({
          user: newUser,
          template: 'welcome-email',
          data: { otp: otpCode },
        });
      } catch (emailErr) {
        this.logger.error('Failed to send verification email', emailErr.stack || emailErr);
      }

      return {
        status: true,
        code: 201,
        message: 'OTP sent to your email.',
        data: { id: newUser.id, email: newUser.email }
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Unexpected registration error', err.stack || err);
      return {
        status: false,
        code: 500,
        message: 'Something went wrong. Please try again later.',
        data: null
      };
    } finally {
      await queryRunner.release();
    }
  }


  /* -------------------------- VerifyOtp Logic ------------------------ */
  async verifyOtp(dto: VerifyOtpDto, req: Request) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(UserEntity);
      const otpRepo = queryRunner.manager.getRepository(Otp);
      const deviceTokenRepo = queryRunner.manager.getRepository(DeviceToken);

      const user = await userRepo.findOne({
        where: { email: dto.email },
        relations: { role: true },
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: 'User not found.',
          data: null
        };
      }

      console.log(dto.otp_code, dto.email, dto.otp_type)
      const otp = await otpRepo.findOne({
        where: {
          otpCode: dto.otp_code,
          email: dto.email,
          otpType: dto.otp_type,
        },
        order: { id: 'DESC' },
      });
      console.log(otp, "otp")
      if (!otp) {
        return {
          status: false,
          code: 400,
          message: 'Invalid OTP.',
          data: null
        };
      }

      if (otp.expiresAt < new Date()) {
        return {
          status: false,
          code: 400,
          message: 'OTP expired.',
          data: null
        };
      }

      if (otp.isUsed) {
        return {
          status: false,
          code: 400,
          message: 'OTP already used.',
          data: null
        };
      }

      // ✅ Mark OTP as used
      otp.isUsed = true;
      await otpRepo.save(otp);

      const ipAddress = req.ip;

      const token = this.jwtService.sign({
        sub: user.id,
        role_id: user.role?.id || user.role?.slug,
        type: 'user',
        email: user.email,
      });

      // ✅ Verify user if needed
      if (dto.otp_type === 'verify' || dto.otp_type === 'forgot_password' || dto.otp_type === 'restaurant_forgot_password' || dto.otp_type === 'driver_forgot_password') {
        user.isOtpVerified = true;
        await userRepo.save(user);
      }

      // ✅ Save device token
      await this.saveDeviceTokenWithRunner(
        user,
        dto.device_token ?? '',
        ipAddress ?? '',
        token,
        deviceTokenRepo,
        'User',
      );

      await queryRunner.commitTransaction();

      return {
        status: true,
        code: 200,
        message:
          dto.otp_type === 'verify'
            ? 'User verified successfully.'
            : 'OTP verified successfully.',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role?.slug,
            isOtpVerified: user.isOtpVerified
          }
        }
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();

      this.logger.error('OTP verification error', err.stack || err);

      return {
        status: false,
        code: 500,
        message: 'Something went wrong. Please try again later.',
        data: null
      };
    } finally {
      await queryRunner.release();
    }
  }


  /* -------------------------- Login Logic ------------------------ */
  async login(dto: LoginDto, req: Request) {
    const { username, password, device_token } = dto;
console.log(username, password, device_token,"username, password, device_token")
    let user: UserEntity | null = null;
    
    // ✅ Check email or phone format
    if (/^\S+@\S+\.\S+$/.test(username)) {
      user = await this.userRepo.findOne({
        where: { email: username },
        relations: { role: true },
      });
    } else if (/^\+?[0-9]{7,15}$/.test(username)) {
      user = await this.userRepo.findOne({
        where: { phone: username },
        relations: { role: true },
      });
    } else {
      return {
        success: false,
        status: 400,
        message: 'Invalid username. Must be email or phone.',
        data: [],
      };
    }

    if (!user) {
      return {
        success: false,
        status: 401,
        message: 'User not found.',
        data: [],
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        status: 401,
        message: 'Invalid credentials.',
        data: [],
      };
    }

    // ✅ If user not verified — send OTP safely
    if (!user.isOtpVerified) {
      const recentOtp = await this.otpRepo.findOne({
        where: {
          email: user.email,
          otpType: 'verify',
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { id: 'DESC' },
      });

      if (recentOtp) {
        const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
        return {
          success: false,
          status: 403,
          message: `User not verified. Please wait ${secondsLeft} seconds before requesting another OTP.`,
          data: [],
        };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await this.otpRepo.save({
        email: user.email,
        channel: 'email',
        otpCode,
        otpType: 'verify',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        user,
      });

      let emailSent = true;
      try {
        await this.emailService.sendTemplateNotification({
          user,
          template: 'welcome-email',
          data: { otp: otpCode },
        });
      } catch (err) {
        emailSent = false;
        this.logger.error('Failed to send verification email', err.stack || err);
      }

      return {
        success: false,
        status: 403,
        message: emailSent
          ? 'User not verified. OTP sent to your email.'
          : 'User not verified. OTP generated but failed to send email.',
        data: [],
      };
    }

    // ✅ All good — proceed with login
    const ip = req.ip;
    const token = this.jwtService.sign({
      sub: user.id,
      role_id: user.role?.id ?? null,
      type: 'user',
      email: user.email,
    });

    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await this.userRepo.save(user);

    // ✅ Device token handling
    if (device_token) {
      const existingDeviceToken = await this.deviceTokenRepo.findOne({
        where: { deviceToken: device_token },
      });

      if (existingDeviceToken) {
        existingDeviceToken.ipAddress = ip;
        existingDeviceToken.jwtToken = token;
        existingDeviceToken.user = user;
        existingDeviceToken.user_id = user.id;
        await this.deviceTokenRepo.save(existingDeviceToken);
      } else {
        await this.deviceTokenRepo.save({
          user,
          user_id: user.id,
          deviceToken: device_token,
          jwtToken: token,
          ipAddress: ip,
          role: 'User',
        });
      }
    }

    // ✅ Remove sensitive fields before sending response
    const { password: _, verificationCode, rememberToken, ...safeUser } = user;

    return {
      success: true,
      status: 200,
      message: 'User logged in successfully.',
      data: {
        token,
        user: safeUser,
      },
    };
  }


  /* -------------------------- ForgotPassword OTP Logic ------------------------ */
  async sendForgotPasswordOtp(dto: ForgotPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(UserEntity);
      const otpRepo = queryRunner.manager.getRepository(Otp);

      // 🔍 Validate user by email
      const user = await userRepo.findOne({ where: { email: dto.email } });
      if (!user) {
        throw new BadRequestException('No user found with this email.');
      }

      // ⛔ Prevent OTP flooding
      const recentOtp = await otpRepo.findOne({
        where: {
          email: dto.email,
          otpType: 'forgot_password',
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { id: 'DESC' },
      });

      if (recentOtp) {
        const secondsLeft = Math.floor((recentOtp.expiresAt.getTime() - Date.now()) / 1000);
        return {
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting another OTP.`,
        };
      }

      // ✅ Expire old OTPs
      await otpRepo.update(
        {
          email: dto.email,
          otpType: 'forgot_password',
          isUsed: false,
        },
        { isUsed: true }
      );

      // 🔐 Generate new OTP
      const otpCode = this.generateOtpCode();
      const expiresAt = this.getOtpExpiry();

      await otpRepo.save({
        email: user.email,
        otpCode,
        otpType: 'forgot_password',
        expiresAt,
        user,
        otpableType: 'User',
        isUsed: false,
      });

      await queryRunner.commitTransaction();

      // 📧 Send OTP email (after commit)
      let emailSent = true;
      try {
        await this.emailService.sendTemplateNotification({
          user,
          template: 'forgot-password', // Keep this consistent
          data: { otp: otpCode },
        });
      } catch (emailErr) {
        emailSent = false;
        console.error('[ForgotPassword] Failed to send email:', emailErr?.message);
      }

      return {
        success: true,
        message: emailSent
          ? 'OTP sent successfully to your email.'
          : 'OTP generated successfully but failed to send email. Please contact support.',
        data: {
          email: user.email,
          otpType: 'forgot_password',
          emailSent,
        },
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Forgot password error:', error);
      throw new InternalServerErrorException('Failed to process request. Please try again later.');
    } finally {
      await queryRunner.release();
    }
  }


async resendOtp(dto: ResendOtpDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userRepo = queryRunner.manager.getRepository(UserEntity);
    const otpRepo = queryRunner.manager.getRepository(Otp);

    const user = await userRepo.findOneOrFail({ where: { email: dto.email } });

    // ✅ 1 min ke andar agar koi OTP request hui hai toh error return karo
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await otpRepo.findOne({
      where: {
        email: dto.email,
        otpType: dto.otp_type,
        createdAt: MoreThan(oneMinuteAgo), // sirf 1 min ka check
      },
      order: { id: 'DESC' },
    });

    if (recentOtp) {
      const secondsLeft = 60 - Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
      return {
        success: false,
        message: `Please wait ${secondsLeft} seconds before requesting another OTP.`,
      };
    }

    // ✅ Purane OTP invalidate karo
    await otpRepo.update(
      { email: dto.email, otpType: dto.otp_type, isUsed: false },
      { isUsed: true }
    );

    // ✅ Naya OTP generate karo
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await otpRepo.save({
      email: user.email,
      otpCode,
      otpType: dto.otp_type, // ✅ same type rakho
      expiresAt,
      isUsed: false,
      otpableType: 'User',
      createdAt: new Date(),
    });

    await queryRunner.commitTransaction();

    let emailSent = true;
    try {
      await this.emailService.sendTemplateNotification({
        user,
        template: dto.otp_type === 'verify' ? 'welcome-email' : 'forgot-password',
        data: { otp: otpCode },
      });
    } catch (emailErr) {
      emailSent = false;
      console.error('[Resend OTP] Failed to send email:', emailErr?.message);
    }

    return {
      success: true,
      message: emailSent
        ? 'OTP sent successfully to your email.'
        : 'OTP generated but email sending failed. Contact support.',
      data: { email: user.email, otpType: dto.otp_type, emailSent },
    };

  } catch (err) {
    await queryRunner.rollbackTransaction();
    return {
      success: false,
      message: 'Something went wrong while resending OTP.',
      error: err?.message,
    };
  } finally {
    await queryRunner.release();
  }
}



  /* -------------------------- Logout Logic ------------------------ */
  async logout(req: Request) {
    

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: false,
        message: 'Authorization token missing',
        data: [],
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = this.jwtService.decode(token) as any;

    if (!decoded || !decoded.userId) {
      return {
        status: false,
        message: 'Invalid token',
        data: [],
      };
    }

    const user = await this.userRepo.findOne({ where: { id: decoded.userId } });
    if (!user) {
      return {
        status: false,
        message: 'User not found',
        data: [],
      };
    }

    // 🗑 Logout from all devices
    await this.deviceTokenRepo.delete({ user: { id: user.id } });

    return {
      status: true,
      message: 'User logged out successfully',
      data: [],
    };
  }

  /* -------------------------- Reset Password ------------------------ */

  async resetPassword(dto: ResetPasswordDto, req: Request) {

    try {

      const jwtUser = req.user as any;

      
      const existingUser = await this.userRepo.findOne({

        where: { id: jwtUser.id },

        select: ['id', 'email'], // email bhi send kar sakte ho response me

      });

      if (!existingUser) {

        return {

          status: 404,

          success: false,

          message: 'User not found.',

          data: {},

        };

      }

      
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      

      await this.userRepo.update(jwtUser.id, {

        password: hashedPassword,

        isOtpVerified: true,

      });
      

      return {

        status: 200,

        success: true,

        message: 'Password reset successfully.',

        data: {

          userId: jwtUser.id,

          email: existingUser.email,

          isOtpVerified: true,

        },

      };

    } catch (error) {

      
      return {

        status: 500,

        success: false,

        message: 'Something went wrong while resetting password.',

        error: error.message,

      };

    }

  }



}