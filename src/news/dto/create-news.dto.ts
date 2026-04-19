// dir: ~/quangminh-smart-border/backend/src/news/dto/create-news.dto.ts
import { IsString, IsBoolean, IsOptional, ValidateNested, IsArray, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Đã thêm ApiProperty
import { NewsTranslationDto } from './news-translation.dto';
import { NewsStatus } from '../entities/news.entity';

export class CreateNewsDto {
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
  status?: NewsStatus = NewsStatus.DRAFT;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({ description: 'ID của danh mục' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ type: [NewsTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsTranslationDto)
  translations: NewsTranslationDto[];
}