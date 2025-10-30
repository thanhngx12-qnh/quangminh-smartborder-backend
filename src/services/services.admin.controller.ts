// dir: ~/quangminh-smart-border/backend/src/services/services.admin.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  ValidationPipe, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Admin - Services')
@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ tất cả các route trong controller này
@ApiBearerAuth()
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ cho Admin (hỗ trợ phân trang, lọc, tìm kiếm)' })
  findAllForAdmin(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) 
    queryDto: QueryServiceDto
  ) {
    return this.servicesService.findAllForAdmin(queryDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một dịch vụ mới' })
  create(@Body() createServiceDto: CreateServiceDto) {
    // Tái sử dụng hàm `create` hiện có
    return this.servicesService.create(createServiceDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy chi tiết một dịch vụ bằng ID (bao gồm tất cả bản dịch)' })
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    // Tái sử dụng hàm `findOne` đã được cập nhật
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Cập nhật một dịch vụ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    // Tái sử dụng hàm `update` hiện có
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Chỉ Admin mới có quyền xóa dịch vụ
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một dịch vụ (chỉ Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    // Tái sử dụng hàm `remove` hiện có
    return this.servicesService.remove(id);
  }
}