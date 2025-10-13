// dir: ~/quangminh-smart-border/backend/src/services/services.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards, // <-- Thêm import UseGuards
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';     // <-- Import JwtAuthGuard
// import { RolesGuard } from 'src/auth/guards/roles.guard';         // <-- Import RolesGuard
// import { Roles } from 'src/auth/decorators/roles.decorator';      // <-- Import Roles decorator
// import { UserRole } from 'src/users/entities/user.entity';        // <-- Import UserRole enum

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * @route POST /services
   * @description Tạo dịch vụ mới (Yêu cầu quyền ADMIN hoặc CONTENT_MANAGER).
   * @param createServiceDto Dữ liệu dịch vụ và bản dịch từ request body.
   * @returns Dịch vụ đã tạo.
   */
  @Post()
  @UseGuards(JwtAuthGuard) // Áp dụng cả hai Guard
  // @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER) // Chỉ định các vai trò được phép
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(createServiceDto);
  }

  /**
   * @route GET /services (Công khai)
   * @description Lấy danh sách tất cả dịch vụ.
   * @param locale (Query parameter, tùy chọn) Lọc bản dịch theo ngôn ngữ.
   * @param featured (Query parameter, tùy chọn) Lọc dịch vụ nổi bật (true/false).
   * @returns Mảng các dịch vụ.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('locale') locale?: string,
    @Query('featured') featured?: string,
  ): Promise<Service[]> {
    let featuredBoolean: boolean | undefined;
    if (featured !== undefined) {
      featuredBoolean = featured.toLowerCase() === 'true';
    }
    return this.servicesService.findAll(locale, featuredBoolean);
  }

  /**
   * @route GET /services/:id (Công khai)
   * @description Lấy chi tiết một dịch vụ theo ID.
   * @param id ID của dịch vụ.
   * @param locale (Query parameter, tùy chọn) Lọc bản dịch theo ngôn ngữ.
   * @returns Dịch vụ tìm thấy.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('locale') locale?: string,
  ): Promise<Service> {
    return this.servicesService.findOne(id, locale);
  }

  /**
   * @route GET /services/slug/:locale/:slug (Công khai)
   * @description Lấy chi tiết một dịch vụ theo slug và ngôn ngữ.
   * @param locale Ngôn ngữ của bản dịch.
   * @param slug Slug của dịch vụ.
   * @returns Dịch vụ tìm thấy.
   */
  @Get('slug/:locale/:slug')
  @HttpCode(HttpStatus.OK)
  async findOneBySlug(
    @Param('locale') locale: string,
    @Param('slug') slug: string,
  ): Promise<Service> {
    return this.servicesService.findOneBySlug(locale, slug);
  }

  /**
   * @route PATCH /services/:id
   * @description Cập nhật dịch vụ (Yêu cầu quyền ADMIN hoặc CONTENT_MANAGER).
   * @param id ID của dịch vụ cần cập nhật.
   * @param updateServiceDto Dữ liệu cập nhật từ request body.
   * @returns Dịch vụ đã cập nhật.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  /**
   * @route DELETE /services/:id
   * @description Xóa dịch vụ (Chỉ yêu cầu quyền ADMIN).
   * @param id ID của dịch vụ cần xóa.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles(UserRole.ADMIN) // Chỉ ADMIN mới có quyền xóa
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicesService.remove(id);
  }
}