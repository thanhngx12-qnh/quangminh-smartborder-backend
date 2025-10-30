// dir: ~/quangminh-smart-border/backend/src/services/dto/query-service.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Transform } from 'class-transformer';

export class QueryServiceDto extends PaginationQueryDto {
  // `q` (search) đã được kế thừa từ PaginationQueryDto
  // Nó sẽ được dùng để tìm kiếm theo `code`, `category`, `title`

  @ApiPropertyOptional({
    description: 'Lọc dịch vụ nổi bật',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Chuyển đổi query string 'true'/'false'
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc theo danh mục dịch vụ',
    example: 'Kho Cảng Cạn',
  })
  @IsOptional()
  @IsString()
  category?: string;
}