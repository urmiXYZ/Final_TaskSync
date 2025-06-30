import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { SalaryService } from './salary.service';

@Controller('salary')
export class SalaryController {
  constructor(private salaryService: SalaryService) {}

  @Get('eligible')
  getEligibleEmployeesAndManagersWithSalary() {
    return this.salaryService.getEligibleEmployeesAndManagersWithSalary();
  }

@Post('initiate')
async initiatePayment(@Body() body: { userId: number; amount: number }) {
  const { userId, amount } = body;
  const clientSecret = await this.salaryService.initiatePayment(userId, amount);
  return { clientSecret }; 
}


  @Post('confirm')
  confirmPayment(@Body() body: { intentId: string }) {
    return this.salaryService.confirmPayment(body.intentId);
  }

  @Post('generate/:userId')
  generateSalary(@Param('userId', ParseIntPipe) userId: number) {
    return this.salaryService.generateSalaryForUser(userId);
  }

  @Get()
  getAllSalaries() {
    return this.salaryService.findAll();
  }

  @Patch('mark-paid/:id')
  markAsPaid(@Param('id', ParseIntPipe) id: number, @Body() body: { transactionId: string }) {
    return this.salaryService.markSalaryAsPaid(id, body.transactionId);
  }

@Get('current/:userId')
getCurrentSalary(@Param('userId', ParseIntPipe) userId: number) {
  return this.salaryService.getLiveSalary(userId);
}

@Get('latest/:userId')
getLatestSalary(@Param('userId', ParseIntPipe) userId: number) {
  return this.salaryService.getLatestSalaryForUser(userId);
}
}
