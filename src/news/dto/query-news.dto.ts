// dir: ~/quangminh-smart-border/backend/src/news/dto/query-news.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { NewsStatus } from '../entities/news.entity';
import { Transform } from 'class-transformer';

export class QueryNewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái bài viết',
    enum: NewsStatus,
  })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional({
    description: 'Lọc các bài viết nổi bật',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  // --- Thêm lọc theo Category ---
  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
  // ------------------------------
}