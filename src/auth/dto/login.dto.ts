// dir: ~/quangminh-smart-border/backend/src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <-- Import

export class LoginDto {
  @ApiProperty({ example: 'admin@talunglogistics.com', description: 'The email address of the user' }) // <-- Thêm mô tả và ví dụ
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongpassword123', description: 'The password of the user (at least 8 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}