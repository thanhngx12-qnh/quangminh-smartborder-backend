// dir: ~/quangminh-smart-border/backend/src/news/dto/update-news.dto.ts
import { IsString, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NewsTranslationDto } from './news-translation.dto';
import { NewsStatus } from '../entities/news.entity';

// DTO này không có bất kỳ giá trị mặc định nào
export class UpdateNewsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  // Thuộc tính `status` giờ đây không có giá trị mặc định
  @ApiPropertyOptional({ enum: NewsStatus })
  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsString()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({ type: [NewsTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewsTranslationDto)
  @IsOptional()
  translations?: NewsTranslationDto[];
}