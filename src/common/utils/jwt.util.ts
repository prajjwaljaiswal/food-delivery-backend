import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../providers/strategies/jwt.strategy';

@Injectable()
export class JwtUtil {
  private readonly logger = new Logger(JwtUtil.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate JWT token for restaurant
   */
  generateRestaurantToken(restaurantId: number, roleId: number, email?: string): string {
    const payload: JwtPayload = {
      sub: restaurantId,
      role_id: roleId,
      type: 'restaurant',
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      issuer: this.configService.get<string>('JWT_ISSUER') || 'food-ordering-app',
      audience: 'restaurant',
    });

    this.logger.log(`Generated JWT token for restaurant ${restaurantId}`);
    return token;
  }

  /**
   * Generate JWT token for user
   */
  generateUserToken(userId: number, roleId: number, email?: string): string {
    const payload: JwtPayload = {
      sub: userId,
      role_id: roleId,
      type: 'user',
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      issuer: this.configService.get<string>('JWT_ISSUER') || 'food-ordering-app',
      audience: 'user',
    });

    this.logger.log(`Generated JWT token for user ${userId}`);
    return token;
  }

  /**
   * Generate JWT token for driver
   */
  generateDriverToken(driverId: number, roleId: number, email?: string): string {
    const payload: JwtPayload = {
      sub: driverId,
      role_id: roleId,
      type: 'driver',
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      issuer: this.configService.get<string>('JWT_ISSUER') || 'food-ordering-app',
      audience: 'driver',
    });

    this.logger.log(`Generated JWT token for driver ${driverId}`);
    return token;
  }

  /**
   * Generate JWT token for admin
   */
  generateAdminToken(adminId: number, roleId: number, email?: string): string {
    const payload: JwtPayload = {
      sub: adminId,
      role_id: roleId,
      type: 'admin',
      email,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      issuer: 'food-ordering-app',
      audience: 'admin',
    });

    this.logger.log(`Generated JWT token for admin ${adminId}`);
    return token;
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      this.logger.log(`Verified JWT token for ${payload.type}: ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`JWT token verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload {
    try {
      const payload = this.jwtService.decode(token) as JwtPayload;
      this.logger.log(`Decoded JWT token for ${payload.type}: ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`JWT token decoding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.jwtService.decode(token) as JwtPayload;
      if (!payload.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      this.logger.error(`Error checking token expiration: ${error.message}`);
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.jwtService.decode(token) as JwtPayload;
      if (!payload.exp) return null;
      
      return new Date(payload.exp * 1000);
    } catch (error) {
      this.logger.error(`Error getting token expiration: ${error.message}`);
      return null;
    }
  }
}
