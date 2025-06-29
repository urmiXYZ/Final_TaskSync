import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/entities/role.entity';
import { PasswordResetRequest } from 'src/user/entities/password-reset-request.entity';
import { RequestUser } from 'src/user/entities/request-user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Project } from 'src/user/entities/project.entity';
import { TeamMember } from 'src/user/entities/teamMembers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role,  TeamMember, PasswordResetRequest, RequestUser,Project]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

