import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageUserController } from './manage-user.controller';
import { ManageUserService } from './manage-user.service';
import { RequestUser } from '../user/entities/request-user.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([RequestUser, User, Role]), AuthModule],
  controllers: [ManageUserController],
  providers: [ManageUserService],
})
export class ManageUserModule {}
