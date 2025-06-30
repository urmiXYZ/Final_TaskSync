import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Salary } from 'src/user/entities/salary.entity';
import { Task } from 'src/user/entities/task.entity';
import { SalaryPayment } from 'src/user/entities/salary-payment.entity';
import Stripe from 'stripe';

@Injectable()
export class SalaryService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-05-28.basil',
  });
  constructor(
    @InjectRepository(Salary)
    private salaryRepo: Repository<Salary>,

    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
    
    @InjectRepository(SalaryPayment) private paymentRepo: Repository<SalaryPayment>,
  ) {}

async getEligibleEmployeesAndManagersWithSalary(): Promise<{ user: User; amount: number }[]> {
  const rolesToInclude = [2, 3]; 
    const users = await this.userRepo.find({
    where: { role: { id: In(rolesToInclude) } },
  });

  const result: { user: User; amount: number }[] = [];

  for (const user of users) {
    const hasPaidPayment = await this.paymentRepo.findOne({
      where: { user: { id: user.id }, paid: true },
    });

    if (!hasPaidPayment) {
      const salary = await this.generateSalaryForUser(user.id);
      result.push({ user, amount: salary.totalAmount });
    }
  }

  return result;
}


  async initiatePayment(userId: number, amount: number) {
  const user = await this.userRepo.findOneBy({ id: userId });
  if (!user) throw new NotFoundException('User not found');

  const intent = await this.stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: { userId: user.id.toString() },
  });

  const salary = this.salaryRepo.create({
    userId: user.id,
    baseAmount: 0,
    bonusAmount: 0,
    totalAmount: amount,
    isPaid: false,
  });
  await this.salaryRepo.save(salary);

  const payment = this.paymentRepo.create({
    user,
    amount,
    stripePaymentIntentId: intent.id,
    paid: false,
  });
  await this.paymentRepo.save(payment);

  return intent.client_secret;
}


 async confirmPayment(intentId: string) {
  const intent = await this.stripe.paymentIntents.retrieve(intentId);

  if (intent.status === 'succeeded') {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: intentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    if (!payment.paid) {
      payment.paid = true;
      if ('paidAt' in payment) {
        (payment as any).paidAt = new Date();
      }
      await this.paymentRepo.save(payment);
    }
  } else {
    throw new BadRequestException('Payment not successful.');
  }


  }

  async generateSalaryForUser(userId: number): Promise<Salary> {
 
  await this.salaryRepo.delete({ userId });
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  const baseAmount = 10000;
  const bonusPerTask = 500;

  const tasks = await this.taskRepo.find({
    where: {
      createdById: userId,
      status: 'done',
    },
  });

  const bonus = tasks.length * bonusPerTask;
  const total = baseAmount + bonus;

  const salary = this.salaryRepo.create({
    userId,
    baseAmount,
    bonusAmount: bonus,
    totalAmount: total,
  });
  return await this.salaryRepo.save(salary);
}


  findAll() {
    return this.salaryRepo.find({ order: { generatedAt: 'DESC' } });
  }

  async markSalaryAsPaid(id: number, transactionId: string) {
    const salary = await this.salaryRepo.findOne({ where: { id } });
    if (!salary) throw new NotFoundException('Salary record not found');

    salary.isPaid = true;
    salary.stripeTransactionId = transactionId;

    return this.salaryRepo.save(salary);
  }

  async getLiveSalary(userId: number) {
  const baseAmount = 10000;
  const bonusPerTask = 500;

  const completedTasks = await this.taskRepo.count({
    where: { createdById: userId, status: 'done' },
  });

  const bonus = completedTasks * bonusPerTask;
  const total = baseAmount + bonus;

  return { totalSalary: total, base: baseAmount, bonus, completedTasks };
}

async getLatestSalaryForUser(userId: number) {
  let latestSalary = await this.salaryRepo.findOne({
    where: { userId },
    order: { generatedAt: 'DESC' },
  });

 if (!latestSalary) {
  latestSalary = await this.generateSalaryForUser(userId);
  return latestSalary;
}


  return latestSalary;
}


}