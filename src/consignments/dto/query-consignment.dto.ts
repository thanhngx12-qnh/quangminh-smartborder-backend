// dir: ~/quangminh-smart-border/backend/src/consignments/dto/query-consignment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryConsignmentDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái vận đơn',
    example: 'IN_TRANSIT',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo điểm xuất phát',
    example: 'Hà Nội',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo điểm đến',
    example: 'Bằng Tường',
  })
  @IsOptional()
  @IsString()
  destination?: string;
}