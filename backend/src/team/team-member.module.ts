import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from 'src/user/entities/teamMembers.entity';
import { TeamMemberService } from './team.service';
import { Project } from 'src/user/entities/project.entity';


@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, Project])],
  providers: [TeamMemberService],
  exports: [TeamMemberService], 
})
export class TeamMemberModule {}
