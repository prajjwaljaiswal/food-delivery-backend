import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../enums/roles.enum';

@Injectable()
export class RestaurantJwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context) {
    const req = context.switchToHttp().getRequest();

    console.log('user', user, req.user);

    if (err || !user) {
      console.log('⛔ Restaurant not authenticated');
      throw err || new UnauthorizedException('Restaurant authentication required');
    }

    // Check if the authenticated user is a restaurant
    if (user.type !== 'restaurant' && user.role_id !== RoleEnum.RESTAURANT) {
      console.log('⛔ User is not a restaurant');
      throw new ForbiddenException('Restaurant access required');
    }

    console.log('✅ Restaurant JWT authenticated');
    return user;
  }
}

// Restaurant-specific decorator
export const RestaurantAuth = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Apply the restaurant JWT guard
    Reflect.defineMetadata('restaurant-auth', true, descriptor.value);
    return descriptor;
  };
};
