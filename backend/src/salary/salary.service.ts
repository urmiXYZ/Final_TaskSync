import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Salary } from 'src/user/entities/salary.entity';
import { Task } from 'src/user/entities/task.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepository: Repository<Salary>,

    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

async generateSalaryForUser(userId: number): Promise<Salary> {
  // Find the user by ID first
  await this.salaryRepository.delete({ userId });
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  // Define base salary and bonus per completed task
  const baseAmount = 10000;
  const bonusPerTask = 500;

  // Fetch all completed tasks created by this user
  const tasks = await this.taskRepository.find({
    where: {
      createdById: userId,
      status: 'done',
    },
  });

  // Calculate bonus and total salary
  const bonus = tasks.length * bonusPerTask;
  const total = baseAmount + bonus;

  // Create a new Salary entity instance
  const salary = this.salaryRepository.create({
    userId,
    baseAmount,
    bonusAmount: bonus,
    totalAmount: total,
  });

  // Save the Salary entity to the database
  return await this.salaryRepository.save(salary);
}


  findAll() {
    return this.salaryRepository.find({ order: { generatedAt: 'DESC' } });
  }

  async markSalaryAsPaid(id: number, transactionId: string) {
    const salary = await this.salaryRepository.findOne({ where: { id } });
    if (!salary) throw new NotFoundException('Salary record not found');

    salary.isPaid = true;
    salary.stripeTransactionId = transactionId;

    return this.salaryRepository.save(salary);
  }

  async getLiveSalary(userId: number) {
  const baseAmount = 10000;
  const bonusPerTask = 500;

  const completedTasks = await this.taskRepository.count({
    where: { createdById: userId, status: 'done' },
  });

  const bonus = completedTasks * bonusPerTask;
  const total = baseAmount + bonus;

  return { totalSalary: total, base: baseAmount, bonus, completedTasks };
}

async getLatestSalaryForUser(userId: number) {
  let latestSalary = await this.salaryRepository.findOne({
    where: { userId },
    order: { generatedAt: 'DESC' },
  });

 if (!latestSalary) {
  latestSalary = await this.generateSalaryForUser(userId);
  // Return the generated salary entity, not an object with totalAmount null
  return latestSalary;
}


  return latestSalary;
}


}