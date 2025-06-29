import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );
  if (!requiredRoles) {
    return true;
  }

  const { user } = context.switchToHttp().getRequest();

  console.log('RolesGuard - requiredRoles:', requiredRoles);
  console.log('RolesGuard - user:', user);
  console.log('RolesGuard - user.role:', user?.role);

  const userRoleName = typeof user?.role === 'object' ? user.role.name : user?.role;
  console.log('RolesGuard - userRoleName:', userRoleName);

  const allowed = requiredRoles.includes(userRoleName);
  console.log('RolesGuard - allowed:', allowed);

  return allowed;
}

}

