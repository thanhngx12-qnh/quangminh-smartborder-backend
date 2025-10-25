// dir: ~/quangminh-smart-border/backend/src/news/news.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsTranslation } from './entities/news-translation.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller'; // Đã được CLI thêm vào
import { NewsAdminController } from './news.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, NewsTranslation]),
  ],
  providers: [NewsService],
  controllers: [NewsController, NewsAdminController], // Đã được CLI thêm vào
  exports: [TypeOrmModule, NewsService],
})
export class NewsModule {}