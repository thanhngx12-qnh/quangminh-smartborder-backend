// dir: ~/quangminh-smart-border/backend/src/news/news.admin.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@ApiTags('Admin - News')
@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NewsAdminController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách tin tức (phân trang, lọc, tìm kiếm)' })
  findAllForAdmin(@Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: QueryNewsDto) {
    return this.newsService.findAllForAdmin(queryDto);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Lấy chi tiết một bài viết bằng ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOneForAdmin(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiOperation({ summary: 'Cập nhật một bài viết' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một bài viết' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}