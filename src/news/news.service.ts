// dir: ~/quangminh-smart-border/backend/src/news/news.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './entities/news.entity';
import { NewsTranslation } from './entities/news-translation.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(NewsTranslation)
    private translationsRepository: Repository<NewsTranslation>,
  ) {}

  /**
   * Tạo một bài viết mới cùng với các bản dịch.
   */
  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const { translations, ...newsData } = createNewsDto;
    
    // Xử lý logic thời gian xuất bản
    if (newsData.status === NewsStatus.PUBLISHED && !newsData.publishedAt) {
      newsData.publishedAt = new Date().toISOString();
    }
    
    const news = this.newsRepository.create({
        ...newsData,
        publishedAt: newsData.publishedAt ? new Date(newsData.publishedAt) : undefined,
    });
    
    await this.newsRepository.save(news);

    // Lưu các bản dịch
    const savedTranslations: NewsTranslation[] = [];
    for (const translationDto of translations) {
      const translation = this.translationsRepository.create({
        ...translationDto,
        news: news,
      });
      savedTranslations.push(await this.translationsRepository.save(translation));
    }

    news.translations = savedTranslations;
    return news;
  }

  /**
   * Lấy danh sách tất cả bài viết, có thể lọc.
   */
  async findAll(locale?: string, status?: NewsStatus, featured?: boolean): Promise<News[]> {
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.translations', 'translation');

    if (locale) {
      queryBuilder.andWhere('translation.locale = :locale', { locale });
    }

    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }
    
    if (featured !== undefined) {
      queryBuilder.andWhere('news.featured = :featured', { featured });
    }
    
    queryBuilder.orderBy('news.publishedAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Lấy chi tiết một bài viết theo ID.
   */
  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
    return news;
  }
  
  /**
   * Lấy chi tiết một bài viết đã PUBLISHED theo slug và ngôn ngữ.
   */
  async findOneBySlug(locale: string, slug: string): Promise<News> {
    const queryBuilder = this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.translations', 'translation')
      .where('translation.locale = :locale', { locale })
      .andWhere('translation.slug = :slug', { slug })
      .andWhere('news.status = :status', { status: NewsStatus.PUBLISHED }); // Đảm bảo chỉ lấy bài đã xuất bản
      
    const news = await queryBuilder.getOne();

    if (!news) {
      throw new NotFoundException(`News article with slug '${slug}' in locale '${locale}' not found.`);
    }

    // Lọc lại để chỉ trả về đúng bản dịch được yêu cầu
    news.translations = news.translations.filter(t => t.locale === locale);

    return news;
  }

  /**
   * Cập nhật một bài viết.
   */
  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    const { translations, ...newsData } = updateNewsDto;
    
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['translations'], // Phải load cả relations để xử lý cập nhật bản dịch
    });
    
    if (!news) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }

    // Xử lý logic thời gian xuất bản khi chuyển trạng thái
    if (newsData.status === NewsStatus.PUBLISHED && !news.publishedAt) {
      newsData.publishedAt = new Date().toISOString();
    }
    
    this.newsRepository.merge(news, {
      ...newsData,
      publishedAt: newsData.publishedAt ? new Date(newsData.publishedAt) : news.publishedAt,
    });
    
    await this.newsRepository.save(news);
    
    // Cập nhật các bản dịch
    if (translations) {
      for (const translationDto of translations) {
        let existing = news.translations.find(t => t.locale === translationDto.locale);
        if (existing) {
          // Cập nhật
          this.translationsRepository.merge(existing, translationDto);
          await this.translationsRepository.save(existing);
        } else {
          // Tạo mới
          const newTranslation = this.translationsRepository.create({ ...translationDto, news });
          await this.translationsRepository.save(newTranslation);
        }
      }
    }

    return this.findOne(id); // Trả về bài viết đã được cập nhật đầy đủ
  }

  /**
   * Xóa một bài viết theo ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
  }
}