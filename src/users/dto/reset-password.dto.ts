// dir: ~/quangminh-smart-border/backend/src/users/dto/reset-password.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Mật khẩu mới cho người dùng. Phải có ít nhất 8 ký tự.',
    example: 'newStrongPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
  newPassword: string;
}