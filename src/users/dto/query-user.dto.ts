// dir: ~/quangminh-smart-border/backend/src/users/dto/query-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UserRole } from '../entities/user.entity';

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo email hoặc họ tên',
    example: 'admin@quangminh.vn',
  })
  @IsOptional()
  @IsString()
  // `q` đã có trong PaginationQueryDto và sẽ được dùng cho mục đích này
  
  @ApiPropertyOptional({
    description: 'Lọc theo vai trò người dùng',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}