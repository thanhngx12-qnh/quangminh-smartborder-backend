// dir: ~/quangminh-smart-border/backend/src/quotes/dto/update-quote.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { CreateQuoteDto } from './create-quote.dto';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @ApiPropertyOptional({ description: "Trạng thái mới của yêu cầu", example: "CONTACTED" })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Ghi chú của quản trị viên" })
  @IsString()
  @IsOptional()
  adminNotes?: string;
  
  // Các trường khác như customerName, email cũng có thể được cập nhật nếu cần
}