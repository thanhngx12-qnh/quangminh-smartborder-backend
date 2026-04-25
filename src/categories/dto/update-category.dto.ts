// src/categories/dto/update-category.dto.ts
import { IsOptional, IsEnum, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoryType } from '../entities/category.entity';
import { CategoryTranslationDto } from './create-category.dto';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ type: [CategoryTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  @IsOptional()
  translations?: CategoryTranslationDto[];
}