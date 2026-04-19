// dir: ~/quangminh-smart-border/backend/src/news/dto/update-news.dto.ts
import { IsString, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NewsTranslationDto } from './news-translation.dto';
import { NewsStatus } from '../entities/news.entity';

export class UpdateNewsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ enum: NewsStatus })
  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsString()
  @IsOptional()
  publishedAt?: string;

  // --- Thêm Category ID ---
  @ApiPropertyOptional({ description: 'ID của danh mục' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
  // ------------------------

  @ApiPropertyOptional({ type: [NewsTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsTranslationDto)
  @IsOptional()
  translations?: NewsTranslationDto[];
}