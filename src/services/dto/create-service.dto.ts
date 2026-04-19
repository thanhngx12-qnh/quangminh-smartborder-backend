// dir: ~/quangminh-smart-border/backend/src/services/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceTranslationDto } from './service-translation.dto';

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'ID của danh mục' })
  @IsNumber()
  @IsOptional()
  categoryId?: number; // Đã đổi từ category: string thành categoryId: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;

  @ApiProperty({ type: [ServiceTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  translations: ServiceTranslationDto[];
}