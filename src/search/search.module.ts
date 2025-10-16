// dir: ~/quangminh-smart-border/backend/src/search/search.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/services/entities/service.entity';
import { News } from 'src/news/entities/news.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, News])], // Cung cấp các repository cần thiết
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}