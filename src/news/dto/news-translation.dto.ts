// dir: ~/quangminh-smart-border/backend/src/news/dto/news-translation.dto.ts
import { IsString, IsNotEmpty, IsLocale, Length, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NewsTranslationDto {
  @IsLocale() // Kiểm tra xem có phải là mã ngôn ngữ hợp lệ không (ví dụ: 'en-US', 'vi-VN', 'zh-CN')
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  @Length(20, 1000)
  excerpt: string; // Tóm tắt

  @IsString()
  @IsNotEmpty()
  content: string;

  // --- Thêm các trường SEO ---
  @ApiPropertyOptional({ description: 'Tiêu đề SEO' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Mô tả SEO' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Từ khóa SEO' })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiPropertyOptional({ description: 'Ảnh hiển thị khi share (OG Image)' })
  @IsString()
  @IsOptional()
  ogImage?: string;
  // --------------------------
}