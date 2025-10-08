// dir: ~/quangminh-smart-border/backend/src/consignments/dto/create-consignment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateConsignmentDto {
  @IsString()
  @IsNotEmpty()
  awb: string; // Mã vận đơn, ví dụ: "QMSB-123456789"

  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsString()
  @IsNotEmpty()
  origin: string; // Ví dụ: "Hà Nội, Việt Nam"

  @IsString()
  @IsNotEmpty()
  destination: string; // Ví dụ: "Bằng Tường, Trung Quốc"

  @IsString()
  @IsOptional()
  status?: string = 'PENDING'; // Mặc định là PENDING

  @IsOptional()
  estimatedDeliveryDate?: Date; // Có thể được cung cấp hoặc tính toán

  @IsObject()
  @IsOptional()
  metadata?: object; // Dữ liệu bổ sung dạng JSON
}