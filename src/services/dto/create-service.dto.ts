// dir: ~/quangminh-smart-border/backend/src/services/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceTranslationDto } from './service-translation.dto'; // Import DTO bản dịch

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  code: string; // Ví dụ: 'transport'

  @IsString()
  @IsNotEmpty()
  category: string; // Ví dụ: 'Vận Tải'

  @IsString()
  @IsOptional()
  coverImage?: string; // URL ảnh bìa

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false; // Mặc định là false

  @IsArray()
  @ValidateNested({ each: true }) // Validate từng phần tử trong mảng
  @Type(() => ServiceTranslationDto) // Chuyển đổi thành ServiceTranslationDto
  translations: ServiceTranslationDto[]; // Các bản dịch của dịch vụ
}