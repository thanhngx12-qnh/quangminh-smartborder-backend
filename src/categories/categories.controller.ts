// dir: ~/quangminh-smart-border/backend/src/categories/categories.controller.ts (PUBLIC)
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categories (Public)')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục (Dùng cho dropdown/menu)' })
  findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}