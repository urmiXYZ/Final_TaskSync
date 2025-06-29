import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
