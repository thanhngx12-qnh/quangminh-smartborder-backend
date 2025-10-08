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
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';

@Controller('services') // Base route cho tất cả các endpoint trong controller này là /services
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * @route POST /services
   * @description Tạo một dịch vụ mới cùng với các bản dịch.
   * @param createServiceDto Dữ liệu dịch vụ và bản dịch từ request body.
   * @returns Dịch vụ đã tạo.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Trả về mã 201 Created
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(createServiceDto);
  }

  /**
   * @route GET /services
   * @description Lấy danh sách tất cả dịch vụ.
   * @param locale (Query parameter, tùy chọn) Lọc bản dịch theo ngôn ngữ.
   * @param featured (Query parameter, tùy chọn) Lọc dịch vụ nổi bật (true/false).
   * @returns Mảng các dịch vụ.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('locale') locale?: string,
    @Query('featured') featured?: string, // Query params luôn là string, cần parse
  ): Promise<Service[]> {
    let featuredBoolean: boolean | undefined;
    if (featured !== undefined) {
      // Chuyển đổi string 'true'/'false' thành boolean
      featuredBoolean = featured.toLowerCase() === 'true';
    }
    return this.servicesService.findAll(locale, featuredBoolean);
  }

  /**
   * @route GET /services/:id
   * @description Lấy chi tiết một dịch vụ theo ID.
   * @param id ID của dịch vụ.
   * @param locale (Query parameter, tùy chọn) Lọc bản dịch theo ngôn ngữ.
   * @returns Dịch vụ tìm thấy.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number, // ParseIntPipe tự động chuyển đổi string param thành number
    @Query('locale') locale?: string,
  ): Promise<Service> {
    return this.servicesService.findOne(id, locale);
  }

  /**
   * @route GET /services/slug/:locale/:slug
   * @description Lấy chi tiết một dịch vụ theo slug và ngôn ngữ.
   * @param locale Ngôn ngữ của bản dịch.
   * @param slug Slug của dịch vụ.
   * @returns Dịch vụ tìm thấy.
   */
  @Get('slug/:locale/:slug') // Route riêng biệt để tránh xung đột với :id
  @HttpCode(HttpStatus.OK)
  async findOneBySlug(
    @Param('locale') locale: string,
    @Param('slug') slug: string,
  ): Promise<Service> {
    return this.servicesService.findOneBySlug(locale, slug);
  }

  /**
   * @route PATCH /services/:id
   * @description Cập nhật thông tin và/hoặc bản dịch của một dịch vụ.
   * @param id ID của dịch vụ cần cập nhật.
   * @param updateServiceDto Dữ liệu cập nhật từ request body.
   * @returns Dịch vụ đã cập nhật.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  /**
   * @route DELETE /services/:id
   * @description Xóa một dịch vụ theo ID.
   * @param id ID của dịch vụ cần xóa.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Trả về mã 204 No Content cho thao tác xóa thành công
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.servicesService.remove(id);
  }
}