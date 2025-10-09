// dir: ~/quangminh-smart-border/backend/src/news/dto/create-news.dto.ts
import { IsString, IsBoolean, IsOptional, ValidateNested, IsArray, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { NewsTranslationDto } from './news-translation.dto';
import { NewsStatus } from '../entities/news.entity';

export class CreateNewsDto {
  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus = NewsStatus.DRAFT;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsTranslationDto)
  translations: NewsTranslationDto[];
}