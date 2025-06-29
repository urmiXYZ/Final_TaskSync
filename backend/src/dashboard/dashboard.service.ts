import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/user/entities/project.entity';
import { TeamMember } from 'src/user/entities/teamMembers.entity';


@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(TeamMember)
    private readonly teamMemberRepo: Repository<TeamMember>,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepo.count();

    const totalManagers = await this.userRepo.count({
      where: { role: { name: 'manager' } },
    });

    const totalEmployees = await this.userRepo.count({
      where: { role: { name: 'employee' } },
    });

    const totalProjects = await this.projectRepo.count();

    const projectsWithTeamRaw = await this.teamMemberRepo
      .createQueryBuilder('tm')
      .select('DISTINCT tm.projectId', 'projectId')
      .getRawMany();

    const totalProjectsWithTeam = projectsWithTeamRaw.length;

    return {
      totalUsers,
      totalManagers,
      totalEmployees,
      totalProjects,
      totalProjectsWithTeam,
    };
  }
}
