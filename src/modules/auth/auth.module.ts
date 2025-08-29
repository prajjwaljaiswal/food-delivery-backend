// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UserEntity, Otp, RoleEntity, DeviceToken } from 'src/models';

import { EmailModule } from 'src/common/email/email.module';
import { JwtStrategy } from 'src/providers/strategies/jwt.strategy';
import { JwtAuthGuard, RoleGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressEntity } from 'src/models/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Otp, RoleEntity, DeviceToken ,AddressEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RoleGuard],
  exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule {}
