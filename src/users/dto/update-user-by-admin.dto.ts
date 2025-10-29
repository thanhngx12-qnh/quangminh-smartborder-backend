// dir: ~/quangminh-smart-border/backend/src/users/dto/update-user-by-admin.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UpdateUserByAdminDto {
  @ApiPropertyOptional({ example: 'Nhân Viên Mới A' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.SALES })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}