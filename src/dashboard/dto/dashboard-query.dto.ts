// dir: ~/quangminh-smart-border/backend/src/dashboard/dto/dashboard-query.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class TimeSeriesQueryDto {
  @ApiProperty({ 
    description: 'Chỉ số cần thống kê theo thời gian',
    enum: ['quotes', 'consignments'],
    example: 'quotes'
  })
  @IsIn(['quotes', 'consignments'])
  @IsNotEmpty()
  metric: 'quotes' | 'consignments';

  @ApiPropertyOptional({ 
    description: 'Khoảng thời gian thống kê',
    enum: ['last_7_days', 'last_30_days'], 
    default: 'last_7_days' 
  })
  @IsOptional()
  @IsIn(['last_7_days', 'last_30_days'])
  range: 'last_7_days' | 'last_30_days' = 'last_7_days';
}

export class CategoricalQueryDto {
  @ApiProperty({ 
    description: 'Chỉ số cần thống kê theo danh mục',
    enum: ['consignment_status', 'quote_status', 'service_category'],
    example: 'consignment_status'
  })
  @IsIn(['consignment_status', 'quote_status', 'service_category'])
  @IsNotEmpty()
  metric: 'consignment_status' | 'quote_status' | 'service_category';
}