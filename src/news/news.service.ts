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
    const savedTranslations: NewsTranslation[] =[];
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
   * Lấy danh sách cho Admin (Sử dụng QueryNewsDto để lọc theo categoryId)
   */
  async findAllForAdmin(queryDto: QueryNewsDto): Promise<PaginatedNewsResult_> {
    const { page, limit, q, sortBy, sortOrder, status, featured, categoryId } = queryDto;

    const allowedSortBy =['id', 'status', 'featured', 'publishedAt', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');
    
    // Join category để hiển thị thông tin danh mục trong danh sách Admin
    queryBuilder.leftJoinAndSelect('news.category', 'category');

    if (q) {
      queryBuilder
        .innerJoin('news.translations', 'translation')
        .andWhere('translation.title ILIKE :q', { q: `%${q}%` });
    }

    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('news.featured = :featured', { featured });
    }

    // --- BỔ SUNG: Lọc theo categoryId ---
    if (categoryId) {
      queryBuilder.andWhere('news.categoryId = :categoryId', { categoryId });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy(`news.${sortBy || 'createdAt'}`, sortOrder)
      .leftJoinAndSelect('news.translations', 'translations') 
      .skip(skip)
      .take(limit);

    const data = await queryBuilder.getMany();
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }

  async findOneForAdmin(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
        where: { id },
        relations: ['translations', 'category'], // Load thêm category
    });
    if (!news) {
        throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }
    return news;
  }

  /**
   * Lấy danh sách cho Public (Công khai)
   */
  async findAll(
    page: number = 1,
    limit: number = 9,
    locale: string = 'vi', // Đặt mặc định là vi nếu không truyền
    status?: NewsStatus,
    featured?: boolean,
    categoryId?: number
  ): Promise<PaginatedNewsResult> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    // 1. Sử dụng INNER JOIN: Chỉ lấy bài viết CÓ bản dịch cho ngôn ngữ này
    // Điều này đảm bảo 'total' và 'limit' luôn chính xác
    queryBuilder.innerJoinAndSelect(
      'news.translations',
      'translation',
      'translation.locale = :locale',
      { locale }
    );

    // 2. Join Category và bản dịch của Category tương ứng
    queryBuilder
      .leftJoinAndSelect('news.category', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'category_trans',
        'category_trans.locale = :locale',
        { locale }
      );

    queryBuilder
      .orderBy('news.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);
    
    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }
    
    if (featured !== undefined) {
      queryBuilder.andWhere('news.featured = :featured', { featured });
    }

    if (categoryId) {
      queryBuilder.andWhere('news.categoryId = :categoryId', { categoryId });
    }

    // getManyAndCount sẽ trả về con số 'total' chính xác dựa trên ngôn ngữ
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

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({ 
      where: { id },
      relations: ['translations', 'category'] // Load thêm category
    });
    if (!news) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
    return news;
  }
  
  async findOneBySlug(locale: string, slug: string): Promise<News> {
    const queryBuilder = this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.translations', 'translation')
      .leftJoinAndSelect('news.category', 'category') // Load thêm category
      .where('translation.locale = :locale', { locale })
      .andWhere('translation.slug = :slug', { slug })
      .andWhere('news.status = :status', { status: NewsStatus.PUBLISHED });
      
    const news = await queryBuilder.getOne();

    if (!news) {
      throw new NotFoundException(`News article with slug '${slug}' in locale '${locale}' not found.`);
    }

    news.translations = news.translations.filter(t => t.locale === locale);

    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto): Promise<News> {
    const newsToUpdate = await this.newsRepository.findOne({
      where: { id },
      relations: ['translations', 'category'],
    });
    
    if (!newsToUpdate) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}.`);
    }

    // TÁCH categoryId ra khỏi các trường merge tự động
    const { translations, categoryId, ...newsDataToUpdate } = updateNewsDto;

    // 1. Xử lý logic thời gian xuất bản
    if (newsDataToUpdate.status === NewsStatus.PUBLISHED && !newsToUpdate.publishedAt) {
      newsDataToUpdate.publishedAt = new Date().toISOString();
    }
    
    // 2. Merge các trường còn lại (coverImage, featured, status, v.v.)
    this.newsRepository.merge(newsToUpdate, newsDataToUpdate);

    // 3. ÉP BUỘC cập nhật categoryId (Xử lý triệt để lỗi TypeORM relation)
    if (categoryId !== undefined) {
      newsToUpdate.categoryId = categoryId;
      // Dòng này rất quan trọng: Ép TypeORM bỏ qua object cũ để nhận giá trị categoryId mới
      newsToUpdate.category = null as any; 
    }

    // 4. Lưu lại vào database
    await this.newsRepository.save(newsToUpdate);
    
    // 5. Cập nhật các bản dịch (giữ nguyên logic cũ)
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

    // Trả về dữ liệu mới nhất (sẽ tự động join lấy thông tin category mới)
    return this.findOneForAdmin(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`News article with ID ${id} not found.`);
    }
  }
}