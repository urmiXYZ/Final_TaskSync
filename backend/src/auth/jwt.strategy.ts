import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
  (req: Request) => req?.cookies?.access_token, // 🍪 frontend (HttpOnly cookie)
  ExtractJwt.fromAuthHeaderAsBearerToken(),     // 🔐 Postman or other API clients
]),

      ignoreExpiration: false,
      secretOrKey: 'secretKey123',
    });
  }

  async validate(payload: any) {
  
  const user = await this.userRepository.findOne({ where: { id: payload.sub },
    relations: ['role'], });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  return user; 
}


}
