import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdatePersonalTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;  // <-- MUST match entity field name

  @IsOptional()
  @IsString()
  description?: string;
}
