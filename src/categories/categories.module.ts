// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesAdminController } from './categories.admin.controller';
import { CategoryTranslation } from './entities/category-translation.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryTranslation])],
  controllers: [CategoriesController, CategoriesAdminController],
  providers: [CategoriesService],
  exports: [CategoriesService], // Export để các module khác (News, Service) có thể dùng
})
export class CategoriesModule {}
