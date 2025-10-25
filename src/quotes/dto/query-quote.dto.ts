// dir: ~/quangminh-smart-border/backend/src/quotes/dto/query-quote.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryQuoteDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái yêu cầu',
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status?: string;
  
  // `q` trong PaginationQueryDto sẽ được dùng để tìm kiếm theo customerName hoặc email
}