import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Request } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResendOtpDto } from './dto/Resendotp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    // console.log('Registering user with data:', dto);
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    // console.log('Verifying OTP for user:', dto);
    return this.authService.verifyOtp(dto, req);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {

    console.log(dto, "hkgjghfgdrferwrfsd")
    return this.authService.login(dto, req);
  }

  // src/auth/auth.controller.ts
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }


  // @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    console.log("AuthController initialized successfully");
    return this.authService.logout(req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    console.log("Resetting password for user:", req.user);
    return this.authService.resetPassword(dto, req);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendForgotPasswordOtp(dto);
  }
}
