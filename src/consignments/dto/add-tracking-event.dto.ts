// dir: ~/quangminh-smart-border/backend/src/consignments/dto/add-tracking-event.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class AddTrackingEventDto {
  @IsString()
  @IsNotEmpty()
  eventCode: string; // Ví dụ: 'ORIGIN_SCAN', 'DEPARTED', 'ARRIVED', 'DELIVERED'

  @IsString()
  @IsNotEmpty()
  description: string; // Mô tả chi tiết

  @IsDateString() // Đảm bảo input là một chuỗi ngày hợp lệ
  @IsOptional() // Có thể không gửi, server sẽ dùng thời gian hiện tại
  eventTime?: string; // Thời gian diễn ra sự kiện

  @IsString()
  @IsOptional()
  location?: string; // Ví dụ: "Cửa khẩu Tà Lùng"

  @IsString()
  @IsOptional() // Lưu dưới dạng string "lat,long"
  geo?: string; // Dữ liệu địa lý (ví dụ: "22.805,106.821")

  @IsNumber()
  @IsOptional()
  createdBy?: number; // ID của người tạo sự kiện (nếu là nhân viên nội bộ)
}