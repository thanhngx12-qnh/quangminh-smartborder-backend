// dir: ~/quangminh-smart-border/backend/src/consignments/dto/update-consignment.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConsignmentDto } from './create-consignment.dto';

// Tất cả các trường trong CreateConsignmentDto đều trở thành optional
export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {}