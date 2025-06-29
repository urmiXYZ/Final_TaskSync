import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set(); 
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
 

    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = { sub: user.id, role: user.role.name, name: user.name };


    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name, 
      },
    };
  }
  async logout(token: string) {
    this.blacklistedTokens.add(token);  
    return { message: 'Successfully logged out' };
  }
  blacklistToken(token: string) {
    this.blacklistedTokens.add(token);
  }
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
  
}

