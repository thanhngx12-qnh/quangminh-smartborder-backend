// dir: ~/quangminh-smart-border/backend/src/services/dto/service-translation.dto.ts
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class ServiceTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  locale: string; // 'vi', 'en', 'zh-CN'

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string; // Ví dụ: 'van-tai-bien-gioi'

  @IsString()
  @IsOptional() // Có thể không có short description
  shortDesc?: string;

  @IsString()
  @IsOptional() // Có thể không có content
  content?: string;
}