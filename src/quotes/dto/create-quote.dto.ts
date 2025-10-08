// dir: ~/quangminh-smart-border/backend/src/quotes/dto/create-quote.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  customerName: string; // Tên khách hàng

  @IsEmail()
  @IsNotEmpty()
  email: string; // Email liên hệ

  @IsString()
  @IsOptional()
  @Length(5, 50)
  phone?: string; // Số điện thoại liên hệ

  @IsNumber()
  @IsOptional()
  serviceId?: number; // ID dịch vụ mà khách hàng quan tâm

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  details: string; // Mô tả chi tiết yêu cầu

  // status và aiSuggestedPrice sẽ được backend tự động thiết lập hoặc tính toán
}