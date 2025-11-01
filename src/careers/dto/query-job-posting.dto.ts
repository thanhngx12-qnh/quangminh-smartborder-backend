// dir: ~/quangminh-smart-border/backend/src/careers/dto/query-job-posting.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JobStatus } from '../entities/job-posting.entity';

export class QueryJobPostingDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái tin tuyển dụng',
    enum: JobStatus,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
  
  // `q` trong PaginationQueryDto sẽ dùng để tìm theo `title`
}