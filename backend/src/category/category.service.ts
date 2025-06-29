import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCategoryDto, adminUserPayload) {
  const adminUser = await this.userRepository.findOne({ where: { id: adminUserPayload.userId } });
  
  if (!adminUser) {
    throw new Error('Admin user not found');
  }

  const category = this.categoryRepository.create({
    ...dto,
    createdBy: adminUser,
  });

  return this.categoryRepository.save(category);
}

  
  async findAll() {
    const categories = await this.categoryRepository.find({
      relations: ['createdBy'],
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          id: true,
          username: true,
        }
      }
    });
    return categories;
  }

  async update(id: number, dto: CreateCategoryDto) {
    await this.categoryRepository.update(id, dto);
    return { message: 'Category updated successfully' };
  }

  async delete(id: number) {
    await this.categoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }

  async getAllCategoriesSortedByName(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: {
        name: 'ASC', 
      },
    });
  }
  
}
