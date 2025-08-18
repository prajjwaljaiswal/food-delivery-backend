import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../enums/roles.enum';

// Guard for JWT authentication
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    const req = context.switchToHttp().getRequest();

    if (err || !user) {
      console.log('⛔ User not authenticated');
      throw err || new UnauthorizedException('Unauthorized');
    }

    return user; // This gets attached to req.user
  }
}

// Custom decorator to set roles metadata
export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);

// Role-based authorization guard
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('⚠️ No specific roles required. Allowing access.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: number | string; role_id: RoleEnum };

    console.log('→ Logged-in user:', user);

    if (!user || !user.role_id) {
      console.log('⛔ User or role_id missing');
      throw new ForbiddenException('Access denied');
    }
    const hasRole = requiredRoles.includes(Number(user.role_id));


    console.log(`✅ Role check result: ${hasRole}`);

    if (!hasRole) {
      console.log('⛔ User role not authorized');
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}
