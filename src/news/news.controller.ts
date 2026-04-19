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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  findAllForAdmin(@Query() queryDto: any) { 
    // Thay vì truyền 9 tham số, ta truyền nguyên object queryDto để khớp với Service
    return this.newsService.findAllForAdmin(queryDto);
  }

  @Get()
  findAllPublished(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
    @Query('locale') locale?: string,
    @Query('featured') featured?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    let isFeatured: boolean | undefined;
    if (featured === 'true') isFeatured = true;
    else if (featured === 'false') isFeatured = false;

    const catId = categoryId ? parseInt(categoryId, 10) : undefined;

    return this.newsService.findAll(page, limit, locale, NewsStatus.PUBLISHED, isFeatured, catId);
  }

  @Get('slug/:locale/:slug')
  @HttpCode(HttpStatus.OK)
  findOneBySlug(@Param('locale') locale: string, @Param('slug') slug: string) {
    return this.newsService.findOneBySlug(locale, slug);
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }
}