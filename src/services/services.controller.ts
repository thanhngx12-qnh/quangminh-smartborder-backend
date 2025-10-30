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
  UseGuards,
  DefaultValuePipe, // <-- Thêm import UseGuards
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger'; 
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

  @Get()
  // THÊM CÁC DECORATOR Ở ĐÂY
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng trên mỗi trang' })
  @ApiQuery({ name: 'locale', required: false, type: String, description: 'Ngôn ngữ (vi, en, zh)' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Lọc dịch vụ nổi bật' })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('locale') locale?: string,
    @Query('featured') featured?: string,
  ) {
    const featuredBoolean = featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.servicesService.findAll(page, limit, locale, featuredBoolean);
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

}