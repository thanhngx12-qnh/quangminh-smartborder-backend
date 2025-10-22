// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.admin.controller.ts
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConsignmentsService } from './consignments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { QueryConsignmentDto } from './dto/query-consignment.dto';

@ApiTags('Admin - Consignments')
@Controller('admin/consignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConsignmentsAdminController {
  constructor(private readonly consignmentsService: ConsignmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPS, UserRole.SALES) // Mở-rộng-quyền-xem-cho-Sales
  // Dùng-ValidationPipe-để-kích-hoạt-DTO-query
  findAllForAdmin(@Query(new ValidationPipe({ transform: true })) queryDto: QueryConsignmentDto) {
    return this.consignmentsService.findAllForAdmin(queryDto);
  }
}