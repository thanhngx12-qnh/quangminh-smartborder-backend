// dir: ~/quangminh-smart-border/backend/src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'locale', required: true, description: 'Ngôn ngữ hiện tại (vi, en, zh)' })
  search(@Query('q') query: string, @Query('locale') locale: string) {
    return this.searchService.search(query, locale);
  }
}