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

// JWT Auth Guard: Checks if JWT token is valid
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    const req = context.switchToHttp().getRequest();
    // console.log('→ Checking JWT Auth Guard', req);
    const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      console.log('⛔ No token provided');
      throw new UnauthorizedException('No token provided');
    }

    if (err || !user) {
      console.log('⛔ Invalid token or user not found');
      throw err || new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}

// Decorator to set roles for an endpoint
export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);

// Role Guard: Checks if the user has the required role
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: number | string; role_id: RoleEnum };

    // ✅ If no roles are specified, deny by default
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('⛔ No roles specified, denying access');
      throw new ForbiddenException('Access denied: No roles allowed');
    }

    if (!user || user.role_id === undefined) {
      console.log('⛔ User not found or role missing');
      throw new ForbiddenException('Access denied');
    }

    // ✅ Strict role matching
    const hasRole = requiredRoles.includes(Number(user.role_id));

    console.log(`→ Required Roles: ${requiredRoles}, User Role: ${user.role_id}, Allowed: ${hasRole}`);

    if (!hasRole) {
      console.log('⛔ User role not authorized');
      throw new ForbiddenException('Forbidden resource: Role not allowed');
    }

    return true;
  }
}
