import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';  
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: 'secretKey123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],  
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtAuthGuard,
    JwtModule,   // <--- exports JwtModule so JwtService is available
  ],
})
export class AuthModule {}
