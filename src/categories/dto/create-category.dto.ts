import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tin tức' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tin-tuc' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ example: 'Mô tả danh mục' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  parentId?: number;
}