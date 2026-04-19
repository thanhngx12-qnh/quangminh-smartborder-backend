// dir: ~/quangminh-smart-border/backend/src/services/dto/service-translation.dto.ts
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  locale: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  shortDesc?: string;

  @IsString()
  @IsOptional()
  content?: string;

  // --- BỔ SUNG CÁC TRƯỜNG SEO ---
  @ApiPropertyOptional({ description: 'SEO Title' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO Description' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'SEO Keywords' })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiPropertyOptional({ description: 'OG Image URL' })
  @IsString()
  @IsOptional()
  ogImage?: string;
  // ------------------------------
}