// dir: ~/quangminh-smart-border/backend/src/careers/dto/query-job-application.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryJobApplicationDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc hồ sơ theo ID của tin tuyển dụng',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  jobPostingId?: number;

  // `q` trong PaginationQueryDto sẽ dùng để tìm theo `applicantName` hoặc `email`
}