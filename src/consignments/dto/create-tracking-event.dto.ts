// dir: ~/quangminh-smart-border/backend/src/consignments/dto/create-tracking-event.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrackingEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  eventTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}