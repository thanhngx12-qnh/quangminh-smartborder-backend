// dir: src/categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoryType } from '../entities/category.entity';

export class CategoryTranslationDto {
  @ApiProperty({ example: 'vi' })
  @IsString()
  @IsNotEmpty()
  locale: string;

  @ApiProperty({ example: 'Tin tức' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tin-tuc' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Mô tả danh mục' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ type: [CategoryTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  translations: CategoryTranslationDto[];
}