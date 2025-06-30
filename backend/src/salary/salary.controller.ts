import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Get,
  Body,
  Patch,
} from '@nestjs/common';
import { SalaryService } from './salary.service';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

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

  // salary.controller.ts
@Get('current/:userId')
getCurrentSalary(@Param('userId', ParseIntPipe) userId: number) {
  return this.salaryService.getLiveSalary(userId);
}

@Get('latest/:userId')
getLatestSalary(@Param('userId', ParseIntPipe) userId: number) {
  return this.salaryService.getLatestSalaryForUser(userId);
}


}