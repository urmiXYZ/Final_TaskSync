import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamMemberService } from 'src/team/team.service';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly teamMemberService: TeamMemberService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAll() {
    return this.projectService.findAll();  // no search param, returns all projects
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchProjects(@Query('term') term: string) {
    return this.projectService.searchProjects(term);
  }
  
 @UseGuards(JwtAuthGuard)
  @Post('create')
  async createProject(@Body() body: { name: string; description: string }) {
    return this.projectService.createProject(body.name, body.description);
  }
 @UseGuards(JwtAuthGuard)
  @Post(':id/team')
  async assignTeam(
    @Param('id') projectId: number,
    @Body() body: { members: { userId: number; isLeader: boolean }[] },
  ) {
    return this.teamMemberService.assignTeam(projectId, body.members);
  }
 @UseGuards(JwtAuthGuard)
  @Get(':id/team')
  async getTeam(@Param('id') projectId: number) {
    return this.teamMemberService.getTeam(projectId);
  }
  
}
