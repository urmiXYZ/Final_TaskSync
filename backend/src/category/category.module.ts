import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { User } from 'src/user/entities/user.entity'; 
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User]),AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
