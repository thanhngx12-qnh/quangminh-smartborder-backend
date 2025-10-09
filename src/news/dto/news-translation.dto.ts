// dir: ~/quangminh-smart-border/backend/src/news/dto/news-translation.dto.ts
import { IsString, IsNotEmpty, IsLocale, Length } from 'class-validator';

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
}