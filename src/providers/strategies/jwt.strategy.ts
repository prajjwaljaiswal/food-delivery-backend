import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number; // user/restaurant ID
  role_id: number;
  type: 'user' | 'restaurant' | 'driver' | 'admin';
  email?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    // Safely fetch the JWT secret with fallback
    const secret = configService.get<string>('JWT_SECRET') || 'wuMTXyB2YAMUSOZZ5WVygkezaufs3LPSsvhPXLKZCpVX6P0ro9VwtINsq7yb3P24';

    if (!secret) {
      // Optional: Fail fast in development if JWT_SECRET is missing
      throw new Error('❌ JWT_SECRET is not defined in your environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false, // Ensure tokens expire
    });

    this.logger.log(`✅ JWT Strategy initialized with secret`);
  }

  async validate(payload: JwtPayload) {
    this.logger.log(`Validating JWT payload for ${payload.type}: ${payload.sub}`);
    
    // Validate required fields
    if (!payload.sub || !payload.role_id || !payload.type) {
      this.logger.error('Invalid JWT payload structure');
      throw new Error('Invalid token payload');
    }

    // Attach same field names as used in your guards
    return {
      id: payload.sub,
      userId: payload.sub, // For backward compatibility
      role_id: payload.role_id,
      type: payload.type,
      email: payload.email,
    };
  }
}
