import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { Salary } from 'src/user/entities/salary.entity';
import { User } from 'src/user/entities/user.entity';
import { Task } from 'src/user/entities/task.entity';
import { SalaryPayment } from 'src/user/entities/salary-payment.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Salary, User, Task, SalaryPayment])],
  controllers: [SalaryController],
  providers: [SalaryService],
})
export class SalaryModule {}





