import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    // Safely fetch the JWT secret with fallback
    const secret = 'wuMTXyB2YAMUSOZZ5WVygkezaufs3LPSsvhPXLKZCpVX6P0ro9VwtINsq7yb3P24'

    if (!secret) {
      // Optional: Fail fast in development if JWT_SECRET is missing
      throw new Error('❌ JWT_SECRET is not defined in your environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret, // <- this must be a defined string
    });

    // this.logger.log(`✅ Using JWT secret from environment variables.`);
  }

  async validate(payload: any) {
    console.log('Validating JWT payload:', payload);
    // Attach same field names as used in your guards
    return {
      id: payload.sub,
      role_id: payload.role_id,
    };
  }

}
