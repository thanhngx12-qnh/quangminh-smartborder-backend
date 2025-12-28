// dir: ~/quangminh-smart-border/backend/src/news/news.controller.ts
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
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { NewsStatus } from './entities/news.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * @route POST /news (ADMIN, CONTENT_MANAGER)
   * @description Tạo một bài viết mới.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  /**
   * @route GET /news/all (ADMIN, CONTENT_MANAGER)
   * @description Lấy tất cả bài viết, bao gồm cả bản nháp, cho trang quản trị.
   */
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  findAllForAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('locale') locale?: string,
    @Query('status') status?: NewsStatus
  ) {
    return this.newsService.findAll(page, limit, locale, status);
  }

  /**
   * @route GET /news (CÔNG KHAI)
   * @description Lấy danh sách bài viết đã PUBLISHED cho trang công khai.
   */
 @Get()
  findAllPublished(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
    @Query('locale') locale?: string,
    @Query('featured') featured?: string // Nhận vào là string
  ) {
    // Logic chuyển đổi đúng:
    // 1. Nếu featured = 'true' -> true
    // 2. Nếu featured = 'false' -> false
    // 3. Nếu không truyền -> undefined (để Service lấy tất cả)
    
    let isFeatured: boolean | undefined;
    if (featured === 'true') isFeatured = true;
    else if (featured === 'false') isFeatured = false;

    return this.newsService.findAll(page, limit, locale, NewsStatus.PUBLISHED, isFeatured);
  }


  /**
   * @route GET /news/slug/:locale/:slug (CÔNG KHAI)
   * @description Lấy chi tiết một bài viết đã PUBLISHED theo slug.
   */
  @Get('slug/:locale/:slug')
  @HttpCode(HttpStatus.OK)
  findOneBySlug(@Param('locale') locale: string, @Param('slug') slug: string) {
    return this.newsService.findOneBySlug(locale, slug);
  }
  
  /**
   * @route GET /news/:id (ADMIN, CONTENT_MANAGER)
   * @description Lấy chi tiết một bài viết theo ID (dùng trong trang quản trị).
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }
  
  /**
   * @route PATCH /news/:id (ADMIN, CONTENT_MANAGER)
   * @description Cập nhật một bài viết.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }
  
  /**
   * @route DELETE /news/:id (ADMIN, CONTENT_MANAGER)
   * @description Xóa một bài viết.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}