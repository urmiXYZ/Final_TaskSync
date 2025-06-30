import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonalTaskDto } from './dto/create-personal-task.dto';
import { PersonalTask } from 'src/user/entities/personal-task.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdatePersonalTaskDto } from './dto/update-personal-task.dto';


@Injectable()
export class PersonalTaskService {
  constructor(
    @InjectRepository(PersonalTask)
    private taskRepo: Repository<PersonalTask>,
  ) {}

 async getTasksForUser(user: User): Promise<PersonalTask[]> {
  return this.taskRepo.find({
    where: { user: { id: user.id } }, // query by user id only
    order: { dueDate: 'ASC', time: 'ASC' },
  });
}

async remove(id: number): Promise<void> {
    await this.taskRepo.delete(id);
  }

  async createTask(user: User, dto: CreatePersonalTaskDto): Promise<PersonalTask> {
    const task = this.taskRepo.create({ ...dto, user });
    return this.taskRepo.save(task);
  }

  async removeMultiple(ids: number[]): Promise<void> {
  await this.taskRepo.delete(ids);
}

async update(id: number, dto: UpdatePersonalTaskDto): Promise<PersonalTask> {
  console.log('Updating task', id, dto);

  const task = await this.taskRepo.findOne({ where: { id } });
  if (!task) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

  Object.assign(task, dto);
  return this.taskRepo.save(task);
}


}
