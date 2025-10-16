// dir: ~/quangminh-smart-border/backend/src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { News, NewsStatus } from 'src/news/entities/news.entity'; // <-- Import thêm NewsStatus
import { Service } from 'src/services/entities/service.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async search(query: string, locale: string) {
    if (!query || query.trim().length < 2) {
      return { services: [], news: [] };
    }

    const searchQuery = `%${query}%`;

    const [services, news] = await Promise.all([
      this.servicesRepository.find({
        relations: ['translations'],
        where: {
          translations: {
            title: ILike(searchQuery),
            locale: locale,
          },
        },
        take: 5,
      }),
      
      // SỬA LỖI Ở ĐÂY
      this.newsRepository.find({
        relations: ['translations'],
        where: {
          // Sử dụng enum thay vì string
          status: NewsStatus.PUBLISHED,
          translations: {
            title: ILike(searchQuery),
            locale: locale,
          },
        },
        take: 5,
      }),
    ]);

    return { services, news };
  }
}