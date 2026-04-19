// dir: ~/quangminh-smart-border/backend/src/services/dto/update-service.dto.ts
import { IsString, IsBoolean, IsOptional, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceTranslationDto } from './service-translation.dto';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'transport_pro' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'ID của danh mục' })
  @IsNumber()
  @IsOptional()
  categoryId?: number; // Đã đổi từ category: string thành categoryId: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ type: [ServiceTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceTranslationDto)
  @IsOptional()
  translations?: ServiceTranslationDto[];
}