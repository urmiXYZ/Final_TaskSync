import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateCategoryDto, @Req() req) {
    console.log('Logged-in user:', req.user);
    return this.categoryService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.update(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(+id);
  }

  @Get('all-sorted')
getSortedCategories() {
  return this.categoryService.getAllCategoriesSortedByName();
}

}
