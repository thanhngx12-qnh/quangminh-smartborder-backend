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
  DefaultValuePipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger'; 
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'categoryId', required: false, type: Number }) // Thêm query param
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('locale') locale?: string,
    @Query('featured') featured?: string,
    @Query('categoryId') categoryId?: string, // Nhận vào là string từ query
  ) {
    const featuredBoolean = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;

    return this.servicesService.findAll(page, limit, locale, featuredBoolean, catId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('locale') locale?: string,
  ): Promise<Service> {
    return this.servicesService.findOne(id, locale);
  }

  @Get('slug/:locale/:slug')
  @HttpCode(HttpStatus.OK)
  async findOneBySlug(
    @Param('locale') locale: string,
    @Param('slug') slug: string,
  ): Promise<Service> {
    return this.servicesService.findOneBySlug(locale, slug);
  }
}