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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách dịch vụ cho Admin (hỗ trợ phân trang, lọc, tìm kiếm)' })
  findAllForAdmin(@Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: QueryServiceDto) {
    // queryDto đã chứa categoryId nhờ việc ta đã update QueryServiceDto
    return this.servicesService.findAllForAdmin(queryDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một dịch vụ mới' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
    // Lưu ý: createServiceDto bây giờ chứa categoryId thay vì category string
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy chi tiết một dịch vụ bằng ID (bao gồm tất cả bản dịch)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOneForAdmin(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Cập nhật một dịch vụ' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một dịch vụ (chỉ Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }
}