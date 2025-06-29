import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PersonalTaskService } from './personal-task.service';
import { CreatePersonalTaskDto } from './dto/create-personal-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('personal-tasks')
@UseGuards(JwtAuthGuard)
export class PersonalTaskController {
  constructor(private taskService: PersonalTaskService) {}

  @Get()
async getMyTasks(@Req() req) {
  console.log('User from req:', req.user);
  const user = req.user;
  return this.taskService.getTasksForUser(user);
}


  @Post()
  async createTask(@Req() req, @Body() dto: CreatePersonalTaskDto) {
    const user = req.user;
    return this.taskService.createTask(user, dto);
  }
}
