

import { Controller, Post, Body, Req, UseGuards, Get, Headers, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { Response as ExpressResponse } from 'express';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResendOtpDto } from './dto/Resendotp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/RefreshTokenDto.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {

    return this.authService.register(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {

    return this.authService.verifyOtp(dto, req);
  }


  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const result =
      await this.authService.login(dto, req);
    return result;

  }


  // src/auth/auth.controller.ts
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }


  @UseGuards(JwtAuthGuard)
  // Controller
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: ExpressResponse) {
    console.log('Logging out user:', req.user);
    return this.authService.logout(req, res);
  }



  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto, req);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendForgotPasswordOtp(dto);
  }


  // @Post('refresh-token')
  // async refreshToken(@Body() body: any) {
  //   console.log('→ Refresh token request received', body);
  //   return this.authService.refreshToken(body.token);
  // }
  // @Post('refresh-token')
  // async refreshToken(@Req() req) {
  //   // const refreshToken = req.cookies?.refreshToken;
  //   const refreshToken = req.cookies?.refreshToken || req.headers['authorization']?.split(' ')[1];

  //   console.log('→ Refresh token request received', { refreshToken });
  //   if (!refreshToken) {
  //     throw new UnauthorizedException('No refresh token found');
  //   }

  //   return this.authService.refreshToken(refreshToken);
  // }


  @Post('refresh-token')
  async refreshToken(
    @Req() req,
    @Body('token') bodyToken: string,  // <-- get token from body
    @Res({ passthrough: true }) res
  ) {
    // Prefer body token, fallback to cookie/header
    const refreshToken = bodyToken || req.cookies?.refreshToken || req.headers['authorization']?.split(' ')[1];

    console.log('→ Refresh token request received', { refreshToken });

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }
    const tokens = await this.authService.refreshToken(refreshToken);
    // Return new access token in response
    return { accessToken: tokens.accessToken };
  }



  @Get('me')
  async getMe(@Headers('Authorization') authHeader: string) {
    if (!authHeader) return { success: false, status: 401, message: 'No token provided.' };

    const token = authHeader.replace('Bearer ', '');
    console.log('→ Get me request received', { token });
    return this.authService.getUserData(token);
  }



}
