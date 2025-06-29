
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Role } from './entities/role.entity';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import { RequestUser } from './entities/request-user.entity';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, PasswordResetRequest, RequestUser]),
    forwardRef(() => AuthModule),  EmailModule,
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
