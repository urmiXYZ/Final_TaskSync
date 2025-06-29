import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "src/user/entities/project.entity";
import { TeamMember } from "src/user/entities/teamMembers.entity";
import { Repository } from "typeorm";

@Injectable()
export class TeamMemberService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepo: Repository<TeamMember>,

    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,  
  ) {}

async assignTeam(projectId: number, members: { userId: number; isLeader: boolean }[]) {
  await this.teamMemberRepo.delete({ project: { id: projectId } });

  const newMembers = members.map(m =>
    this.teamMemberRepo.create({
      project: { id: projectId },
      user: { id: m.userId },
      isLeader: m.isLeader,
    }),
  );


  await this.teamMemberRepo.save(newMembers);

  const leader = members.find(m => m.isLeader);

  if (leader) {

    await this.projectRepo.update(projectId, { owner: { id: leader.userId } });
  }

  return newMembers;
}


  async getTeam(projectId: number) {
    return this.teamMemberRepo.find({
      where: { project: { id: projectId } },
      relations: ['user'],
    });
  }
}
