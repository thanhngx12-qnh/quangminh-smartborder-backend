// dir: ~/quangminh-smart-border/backend/src/services/dto/update-service.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Hoặc @nestjs/swagger nếu bạn dùng Swagger
import { CreateServiceDto } from './create-service.dto';

// PartialType giúp tất cả các trường trong CreateServiceDto trở thành optional
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
