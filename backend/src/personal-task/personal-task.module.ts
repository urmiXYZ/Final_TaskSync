import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersonalTaskService } from './personal-task.service';
import { PersonalTaskController } from './personal-task.controller';
import { PersonalTask } from 'src/user/entities/personal-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalTask])],
  providers: [PersonalTaskService],
  controllers: [PersonalTaskController],
  exports: [PersonalTaskService],
})
export class PersonalTaskModule {}
