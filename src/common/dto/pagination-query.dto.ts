// dir: ~/quangminh-smart-border/backend/src/common/dto/pagination-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Số trang hiện tại',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng item trên mỗi trang',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Giới hạn tối đa 100 item/trang để bảo vệ hiệu năng
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm chung',
    type: String,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Cột để sắp xếp',
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;
  
  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC'; // Mặc định là mới nhất
}