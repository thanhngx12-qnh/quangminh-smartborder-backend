// dir: ~/quangminh-smart-border/backend/src/quotes/dto/create-quote.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // SỬA LỖI Ở ĐÂY: Bỏ IsOptional, thêm IsNotEmpty
  @IsString()
  @IsNotEmpty()
  @Length(9, 50)
  phone: string;

  @IsNumber()
  @IsOptional()
  serviceId?: number; // Vẫn nhận serviceId từ frontend

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  details: string;
}