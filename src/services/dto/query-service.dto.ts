// dir: ~/quangminh-smart-border/backend/src/services/dto/query-service.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Transform } from 'class-transformer';

export class QueryServiceDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc dịch vụ nổi bật',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc theo danh mục dịch vụ (ID)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: number; // Đã đổi từ category: string thành categoryId: number
}