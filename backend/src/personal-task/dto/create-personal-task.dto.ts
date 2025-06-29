import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePersonalTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  time?: string;
}
