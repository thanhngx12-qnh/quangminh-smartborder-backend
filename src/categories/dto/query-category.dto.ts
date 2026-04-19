// src/categories/dto/query-category.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CategoryType } from '../entities/category.entity';

export class QueryCategoryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  parentId?: number;
}