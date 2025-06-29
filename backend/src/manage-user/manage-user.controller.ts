import {
  Controller,
  Post,
  Param,
  Get,
  Query,
  UseGuards,
  Res,
  Patch,
  Body,
} from '@nestjs/common';

import { ManageUserService } from './manage-user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Response } from 'express';
import { ChangeRoleDto } from './dto/change-role.dto';

@Controller('manage-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ManageUserController {
constructor(
    private readonly service: ManageUserService,
  ) {}

@Get('/request-users')
getAllRequestUsers() {
  return this.service.getAllRequestUsers();
}

@Patch('change-role/:id')
changeRole(
  @Param('id') id: number,
  @Body() dto: ChangeRoleDto
) {
  return this.service.changeUserRole(+id, dto.role);
}


  @Post('add-manager/:id')
  addManager(@Param('id') id: number) {
    return this.service.addUserFromRequest(id, 'manager');
  }

  @Post('add-employee/:id')
  addEmployee(@Param('id') id: number) {
    return this.service.addUserFromRequest(id, 'employee');
  }

  @Get('all-managers')
  getAllManagers() {
    return this.service.getUsersByRole('manager');
  }

  @Get('all-employees')
  getAllEmployees() {
    return this.service.getUsersByRole('employee');
  }

  @Get('search')
  searchUsers(@Query('term') term: string) {
    return this.service.searchUsers(term);
  }

  @Get('search-managers')
searchManagers(@Query('term') term: string) {
  return this.service.searchUsersByRole(term, 'manager');
}

@Get('search-employees')
searchEmployees(@Query('term') term: string) {
  return this.service.searchUsersByRole(term, 'employee');
}


  @Get('filter-by-date')
filterByDate(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
    return this.service.filterUsersByDate(startDate, endDate);

}

@Get('filter-managers-by-date')
filterManagersByDate(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  return this.service.filterUsersByRoleAndDate('manager', startDate, endDate);
}

@Get('filter-employees-by-date')
filterEmployeesByDate(
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  return this.service.filterUsersByRoleAndDate('employee', startDate, endDate);
}


@Get('export-all-csv')
exportAllUsers(@Res() res: Response) {
  return this.service.exportAllUsersToCSV(res);
}

  @Get('export-csv-by-role')
  async exportCSVByRole(
    @Query('role') role: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.service.exportUsersByRoleToCSV(role, res);
  }

  @Patch('disable/:id')
disableUser(@Param('id') id: number) {
  return this.service.setDisabledStatus(id, true);
}

@Patch('enable/:id')
enableUser(@Param('id') id: number) {
  return this.service.setDisabledStatus(id, null);
}

}
