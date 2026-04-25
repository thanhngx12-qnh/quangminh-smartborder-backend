// src/categories/categories.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTranslation)
    private translationRepository: Repository<CategoryTranslation>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { translations, ...categoryData } = createCategoryDto;
    
    // 1. Tạo Category core
    const category = this.categoryRepository.create(categoryData);
    await this.categoryRepository.save(category);

    // 2. Tạo các bản dịch
    const savedTranslations = translations.map(trans => 
      this.translationRepository.create({ ...trans, categoryId: category.id })
    );
    await this.translationRepository.save(savedTranslations);

    return this.findOne(category.id);
  }

  async findAll(queryDto: QueryCategoryDto) {
    const { page, limit, type, parentId } = queryDto;
    const skip = (page - 1) * limit;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations');

    if (type) queryBuilder.andWhere('category.type = :type', { type });
    if (parentId) queryBuilder.andWhere('category.parentId = :parentId', { parentId });

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ 
      where: { id },
      relations: ['translations', 'children'] 
    });
    if (!category) throw new NotFoundException(`Category with ID ${id} not found.`);
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const { translations, ...categoryData } = updateCategoryDto;

    // Cập nhật thông tin core
    this.categoryRepository.merge(category, categoryData);
    await this.categoryRepository.save(category);

    // Cập nhật bản dịch nếu có
    if (translations) {
      for (const transDto of translations) {
        let translation = category.translations.find(t => t.locale === transDto.locale);
        if (translation) {
          this.translationRepository.merge(translation, transDto);
          await this.translationRepository.save(translation);
        } else {
          const newTrans = this.translationRepository.create({ ...transDto, categoryId: category.id });
          await this.translationRepository.save(newTrans);
        }
      }
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Category with ID ${id} not found.`);
  }
}