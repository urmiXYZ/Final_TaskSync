import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from 'src/user/entities/project.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TeamMemberModule } from 'src/team/team-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    AuthModule, 
     TeamMemberModule,
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
