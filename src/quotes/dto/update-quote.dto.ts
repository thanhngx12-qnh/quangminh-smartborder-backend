// dir: ~/quangminh-smart-border/backend/src/quotes/dto/update-quote.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';

// Kế thừa từ CreateQuoteDto để có các trường chung
export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @IsString()
  @IsOptional()
  status?: string; // Trạng thái cập nhật (ví dụ: 'APPROVED', 'REJECTED', 'CONTACTED')

  @IsNumber()
  @IsOptional()
  aiSuggestedPrice?: number; // Có thể cập nhật lại hoặc ghi đè giá gợi ý

  @IsString()
  @IsOptional()
  adminNotes?: string; // Ghi chú của quản trị viên
}