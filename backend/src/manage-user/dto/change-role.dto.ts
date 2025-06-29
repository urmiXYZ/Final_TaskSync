import { IsIn } from 'class-validator';

export class ChangeRoleDto {
  @IsIn(['manager', 'employee'])
  role: 'manager' | 'employee';
}
