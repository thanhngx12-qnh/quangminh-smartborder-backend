// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.admin.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsignmentsService } from './consignments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { QueryConsignmentDto } from './dto/query-consignment.dto';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';

@ApiTags('Admin - Consignments')
@Controller('admin/consignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConsignmentsAdminController {
  constructor(private readonly consignmentsService: ConsignmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPS, UserRole.SALES)
  @ApiOperation({ summary: 'Lấy danh sách vận đơn (phân trang, lọc, tìm kiếm)' })
  findAllForAdmin(@Query(new ValidationPipe({ transform: true })) queryDto: QueryConsignmentDto) {
    return this.consignmentsService.findAllForAdmin(queryDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một vận đơn mới' })
  create(@Body() createConsignmentDto: CreateConsignmentDto) {
    return this.consignmentsService.createForAdmin(createConsignmentDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPS, UserRole.SALES)
  @ApiOperation({ summary: 'Lấy chi tiết một vận đơn bằng ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.consignmentsService.findOneForAdmin(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPS)
  @ApiOperation({ summary: 'Cập nhật một vận đơn' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsignmentDto: UpdateConsignmentDto,
  ) {
    return this.consignmentsService.updateForAdmin(id, updateConsignmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một vận đơn (chỉ Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.consignmentsService.removeForAdmin(id);
  }
}