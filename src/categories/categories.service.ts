// src/categories/categories.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { slug: createCategoryDto.slug } });
    if (existing) throw new ConflictException(`Slug '${createCategoryDto.slug}' already exists.`);
    
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(queryDto: QueryCategoryDto) {
    const { page, limit, type, parentId } = queryDto;
    const skip = (page - 1) * limit;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

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
      relations: ['children'] 
    });
    if (!category) throw new NotFoundException(`Category with ID ${id} not found.`);
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    this.categoryRepository.merge(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Category with ID ${id} not found.`);
  }
}