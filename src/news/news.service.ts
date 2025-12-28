// dir: ~/quangminh-smart-border/backend/src/news/news.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News, NewsStatus } from './entities/news.entity';
import { NewsTranslation } from './entities/news-translation.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { QueryNewsDto } from './dto/query-news.dto';

export interface PaginatedNewsResult {
  data: News[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export type PaginatedNewsResult_ = PaginatedResult<News>;

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

  // HÀM MỚI CHO ADMIN PANEL
  async findAllForAdmin(queryDto: QueryNewsDto): Promise<PaginatedNewsResult_> {
    const { page, limit, q, sortBy, sortOrder, status, featured } = queryDto;

    const allowedSortBy = ['id', 'status', 'featured', 'publishedAt', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    if (q) {
      // Join và tìm kiếm trong title của bản dịch
      queryBuilder
        .innerJoin('news.translations', 'translation')
        .where('translation.title ILIKE :q', { q: `%${q}%` });
    }

    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('news.featured = :featured', { featured });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy(`news.${sortBy || 'createdAt'}`, sortOrder)
      .leftJoinAndSelect('news.translations', 'translations') // Luôn lấy tất cả bản dịch
      .skip(skip)
      .take(limit);

    const data = await queryBuilder.getMany();
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }

  // HÀM MỚI CHO ADMIN: Tìm theo ID, không quan tâm status
  async findOneForAdmin(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
        where: { id },
        relations: ['translations'],
    });
    if (!news) {
        throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }
    return news;
  }

  /**
   * Lấy danh sách tất cả bài viết, có thể lọc.
   */
  async findAll(
    page: number = 1,
    limit: number = 9,
    locale?: string,
    status?: NewsStatus,
    featured?: boolean
  ): Promise<PaginatedNewsResult> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    // --- SỬA Ở ĐÂY ---
    // Di chuyển điều kiện locale vào trong câu lệnh Join
    queryBuilder.leftJoinAndSelect(
      'news.translations',
      'translation',
      locale ? 'translation.locale = :locale' : undefined, 
      { locale }
    );

    queryBuilder
      .orderBy('news.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Bỏ đoạn if (locale) cũ ở dưới đi vì đã xử lý trong Join rồi
    
    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }
    if (featured !== undefined) {
      queryBuilder.andWhere('news.featured = :featured', { featured });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
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
    // --- SỬA LẠI LOGIC Ở ĐÂY ---
    
    // 1. Tìm bài viết cần cập nhật
    const newsToUpdate = await this.newsRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
    
    if (!newsToUpdate) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}.`);
    }

    // 2. Tách riêng các phần của DTO
    const { translations, ...newsDataToUpdate } = updateNewsDto;

    // 3. Xử lý logic thời gian xuất bản (chỉ khi status được gửi lên)
    if (newsDataToUpdate.status === NewsStatus.PUBLISHED && !newsToUpdate.publishedAt) {
      newsDataToUpdate.publishedAt = new Date().toISOString();
    }
    
    // 4. Merge các thay đổi từ DTO vào đối tượng đã có
    // TypeORM's merge rất thông minh, nó sẽ bỏ qua các trường `undefined` trong DTO
    this.newsRepository.merge(newsToUpdate, newsDataToUpdate);

    // 5. Lưu lại đối tượng đã được merge
    await this.newsRepository.save(newsToUpdate);
    
    // 6. Cập nhật các bản dịch (nếu có)
    if (translations) {
      for (const translationDto of translations) {
        let existingTranslation = newsToUpdate.translations.find(t => t.locale === translationDto.locale);
        if (existingTranslation) {
          this.translationsRepository.merge(existingTranslation, translationDto);
          await this.translationsRepository.save(existingTranslation);
        } else {
          const newTranslation = this.translationsRepository.create({ ...translationDto, news: newsToUpdate });
          await this.translationsRepository.save(newTranslation);
        }
      }
    }

    // 7. Trả về bài viết đã được cập nhật hoàn chỉnh
    // Gọi findOneForAdmin để đảm bảo tất cả relations đều được load lại
    return this.findOneForAdmin(id);
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