// dir: ~/quangminh-smart-border/backend/src/services/services.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { QueryServiceDto } from './dto/query-service.dto';

export type PaginatedServiceResult = PaginatedResult<Service>;
export type PaginatedServiceResult_ = PaginatedResult<Service>;

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(ServiceTranslation)
    private translationsRepository: Repository<ServiceTranslation>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { translations, ...serviceData } = createServiceDto;

    try {
      // 1. Kiểm tra code trùng (đã có)
      const existingService = await this.servicesRepository.findOne({ where: { code: serviceData.code } });
      if (existingService) {
        throw new ConflictException(`Service with code '${serviceData.code}' already exists.`);
      }

      // 2. Tạo và lưu service
      const service = this.servicesRepository.create(serviceData);
      await this.servicesRepository.save(service);

      // 3. Lưu các bản dịch
      if (translations && translations.length > 0) {
        for (const translationDto of translations) {
          const translation = this.translationsRepository.create({
            ...translationDto,
            service: service,
          });
          await this.translationsRepository.save(translation);
        }
      }

      return this.findOneForAdmin(service.id);
    } catch (error) {
      // BẮT LỖI DATABASE Ở ĐÂY
      if (error.code === '23505') { // Mã lỗi Unique Violation của PostgreSQL
        throw new ConflictException('Dịch vụ hoặc Slug bản dịch đã tồn tại. Vui lòng chọn giá trị khác.');
      }
      throw error; // Nếu là lỗi khác thì cứ để nó throw
    }
  }

  async findAllForAdmin(queryDto: QueryServiceDto): Promise<PaginatedServiceResult_> {
    const { page, limit, q, sortBy, sortOrder, featured, categoryId } = queryDto;
    const skip = (page - 1) * limit;

    const allowedSortBy = ['id', 'code', 'featured', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const queryBuilder = this.servicesRepository.createQueryBuilder('service');
    queryBuilder.leftJoinAndSelect('service.category', 'category');

    if (q) {
      queryBuilder.leftJoin('service.translations', 'translation');
      queryBuilder.andWhere(
        '(service.code ILIKE :q OR translation.title ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('service.featured = :featured', { featured });
    }

    if (categoryId) {
      queryBuilder.andWhere('service.categoryId = :categoryId', { categoryId });
    }
    
    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy(`service.${sortBy || 'createdAt'}`, sortOrder)
      .leftJoinAndSelect('service.translations', 'translations')
      .skip(skip)
      .take(limit);

    const data = await queryBuilder.getMany();
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }

  async findOneForAdmin(id: number): Promise<Service> {
    const service = await this.servicesRepository.findOne({
        where: { id },
        relations: ['translations', 'category'],
    });
    if (!service) {
        throw new NotFoundException(`Không tìm thấy dịch vụ với ID ${id}`);
    }
    return service;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    locale?: string,
    featured?: boolean,
    categoryId?: number
  ): Promise<PaginatedServiceResult> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.servicesRepository.createQueryBuilder('service');

    queryBuilder.leftJoinAndSelect(
      'service.translations',
      'translation',
      locale ? 'translation.locale = :locale' : undefined, 
      { locale }
    );
    queryBuilder.leftJoinAndSelect('service.category', 'category');

    queryBuilder
      .orderBy('service.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    
    if (featured !== undefined) {
      queryBuilder.andWhere('service.featured = :featured', { featured });
    }
    if (categoryId) {
      queryBuilder.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }

  async findOne(id: number, locale?: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations', 'category'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    if (locale && service.translations) {
      service.translations = service.translations.filter(t => t.locale === locale);
    }

    return service;
  }

  async findOneBySlug(locale: string, slug: string): Promise<Service> {
    const service = await this.servicesRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translation')
      .leftJoinAndSelect('service.category', 'category')
      .where('translation.locale = :locale', { locale })
      .andWhere('translation.slug = :slug', { slug })
      .getOne(); // Đã thêm AWAIT để trả về Service thay vì Builder

    if (!service) {
      throw new NotFoundException(`Service with slug '${slug}' in locale '${locale}' not found.`);
    }

    service.translations = service.translations.filter(t => t.locale === locale);
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations', 'category'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    const { translations, ...serviceData } = updateServiceDto;

    this.servicesRepository.merge(service, serviceData);
    await this.servicesRepository.save(service);

    if (translations) {
      for (const translationDto of translations) {
        let existingTranslation = service.translations.find(
          (t) => t.locale === translationDto.locale,
        );

        if (existingTranslation) {
          this.translationsRepository.merge(existingTranslation, translationDto);
          await this.translationsRepository.save(existingTranslation);
        } else {
          const newTranslation = this.translationsRepository.create({
            ...translationDto,
            service: service,
          });
          await this.translationsRepository.save(newTranslation);
        }
      }
    }

    return this.findOneForAdmin(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.servicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }
  }
}