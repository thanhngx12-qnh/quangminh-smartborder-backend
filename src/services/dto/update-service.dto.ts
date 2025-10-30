// dir: ~/quangminh-smart-border/backend/src/services/dto/update-service.dto.ts
import { IsString, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceTranslationDto } from './service-translation.dto';

// DTO này mô tả các trường CÓ THỂ được gửi lên khi cập nhật.
// Tất cả các trường đều là optional và KHÔNG có giá trị mặc định.
export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'transport_pro' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Vận Tải Cao Cấp' })
  @IsString()
  @IsOptional()
  category?: string;

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