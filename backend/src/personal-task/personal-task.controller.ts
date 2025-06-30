import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { PersonalTaskService } from './personal-task.service';
import { CreatePersonalTaskDto } from './dto/create-personal-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePersonalTaskDto } from './dto/update-personal-task.dto';

@Controller('personal-tasks')
@UseGuards(JwtAuthGuard)
export class PersonalTaskController {
  constructor(private personalTaskService: PersonalTaskService) {}

  @Get()
  async getMyTasks(@Req() req) {
    const user = req.user;
    return this.personalTaskService.getTasksForUser(user);
  }

  @Post()
  async createTask(@Req() req, @Body() dto: CreatePersonalTaskDto) {
    const user = req.user;
    return this.personalTaskService.createTask(user, dto);
  }

  // Delete single task by id
  @Delete(':id')
  async deleteTask(@Param('id', ParseIntPipe) id: number) {
    return this.personalTaskService.remove(id);
  }

  // Delete multiple tasks by ids from request body
  @Delete()
  async deleteTasks(@Body('ids') ids: number[]) {
    return this.personalTaskService.removeMultiple(ids);
  }

@Patch(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePersonalTaskDto) {
  return this.personalTaskService.update(id, updateDto);
}


}
