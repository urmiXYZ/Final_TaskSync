import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private authService: AuthService;

  constructor(private moduleRef: ModuleRef) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    if (!this.authService) {
      this.authService = this.moduleRef.get(AuthService, { strict: false });
    }

    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    const blacklisted = await this.authService.isBlacklisted(token);
    if (blacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
