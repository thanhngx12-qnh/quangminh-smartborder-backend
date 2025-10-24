// dir: ~/quangminh-smart-border/backend/src/consignments/dto/update-consignment.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateConsignmentDto } from './create-consignment.dto';
import { CreateTrackingEventDto } from './create-tracking-event.dto';

export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {
  @ApiPropertyOptional({ type: [CreateTrackingEventDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackingEventDto)
  events?: CreateTrackingEventDto[];
}