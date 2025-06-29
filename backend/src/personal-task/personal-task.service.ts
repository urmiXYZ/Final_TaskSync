import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonalTaskDto } from './dto/create-personal-task.dto';
import { PersonalTask } from 'src/user/entities/personal-task.entity';
import { User } from 'src/user/entities/user.entity';


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


  async createTask(user: User, dto: CreatePersonalTaskDto): Promise<PersonalTask> {
    const task = this.taskRepo.create({ ...dto, user });
    return this.taskRepo.save(task);
  }
}
