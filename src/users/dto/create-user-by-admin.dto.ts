// dir: ~/quangminh-smart-border/backend/src/users/dto/create-user-by-admin.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'new.user@phuanh.vn' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Nhân Viên Mới' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.OPS })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}