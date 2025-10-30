// dir: ~/quangminh-smart-border/backend/src/services/services.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginatedResult } from 'src/common/types/pagination.types';
import { QueryServiceDto } from './dto/query-service.dto'; 

// Export kiểu dữ liệu cụ thể cho Service
export type PaginatedServiceResult = PaginatedResult<Service>;

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(ServiceTranslation)
    private translationsRepository: Repository<ServiceTranslation>,
  ) {}

  /**
   * Tạo một dịch vụ mới cùng với các bản dịch của nó.
   * @param createServiceDto Dữ liệu để tạo dịch vụ.
   * @returns Dịch vụ đã được tạo.
   */
  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { translations, ...serviceData } = createServiceDto;

    // Kiểm tra xem code dịch vụ đã tồn tại chưa
    const existingService = await this.servicesRepository.findOne({ where: { code: serviceData.code } });
    if (existingService) {
      throw new ConflictException(`Service with code '${serviceData.code}' already exists.`);
    }

    const service = this.servicesRepository.create(serviceData);
    await this.servicesRepository.save(service);

    // Lưu các bản dịch
    if (translations && translations.length > 0) {
      for (const translationDto of translations) {
        const translation = this.translationsRepository.create({
          ...translationDto,
          service: service,
        });
        await this.translationsRepository.save(translation);
      }
    }

    const createdService = await this.servicesRepository.findOne({
      where: { id: service.id },
      relations: ['translations'],
    });
    if (!createdService) {
      throw new NotFoundException(`Service with ID ${service.id} not found after creation.`);
    }
    return createdService;
  }

  /**
   * Lấy danh sách tất cả dịch vụ, hỗ trợ phân trang và lọc.
   * @returns Mảng các dịch vụ.
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    locale?: string,
    featured?: boolean,
  ): Promise<PaginatedServiceResult> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.servicesRepository
      .createQueryBuilder('service')
      // Quan trọng: Sử dụng leftJoinAndSelect để nạp kèm bản dịch
      .leftJoinAndSelect('service.translations', 'translation')
      .orderBy('service.createdAt', 'DESC'); // Sắp xếp theo ngày tạo mới nhất
      
    // Áp dụng các bộ lọc
    if (locale) {
      // Logic này chưa tối ưu, nó sẽ lọc bản dịch sau khi query.
      // Một cách tốt hơn là `andWhere('translation.locale = :locale', { locale })`
      // Nhưng điều đó sẽ chỉ trả về các service CÓ bản dịch đó.
      // Tạm thời giữ nguyên để đảm bảo trả về tất cả service.
    }
    if (featured !== undefined) {
      queryBuilder.andWhere('service.featured = :featured', { featured });
    }

    // Lấy tổng số lượng trước khi phân trang
    const total = await queryBuilder.getCount();

    // Áp dụng phân trang
    queryBuilder.skip(skip).take(limit);

    // Lấy dữ liệu của trang hiện tại
    const data = await queryBuilder.getMany();
    
    // Xử lý lọc locale phía server (nếu được cung cấp)
    if(locale) {
        data.forEach(service => {
            service.translations = service.translations.filter(t => t.locale === locale)
        })
    }
    
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
   * Lấy chi tiết một dịch vụ theo slug và ngôn ngữ.
   * @param locale Ngôn ngữ của bản dịch.
   * @param slug Slug của dịch vụ.
   * @returns Dịch vụ tìm thấy.
   * @throws NotFoundException nếu không tìm thấy dịch vụ.
   */
  async findOneBySlug(locale: string, slug: string): Promise<Service> {
    const service = await this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translation')
      .where('translation.locale = :locale', { locale })
      .andWhere('translation.slug = :slug', { slug })
      .getOne();

    if (!service) {
      throw new NotFoundException(`Service with slug '${slug}' in locale '${locale}' not found.`);
    }

    // Đảm bảo chỉ trả về bản dịch của locale yêu cầu
    service.translations = service.translations.filter(t => t.locale === locale);

    return service;
  }

  async findOne(id: number, locale?: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    // Nếu có locale, chỉ trả về bản dịch cho locale đó
    if (locale && service.translations) {
      service.translations = service.translations.filter(t => t.locale === locale);
    }

    return service;
  }

  /**
   * Cập nhật thông tin và/hoặc bản dịch của một dịch vụ.
   * @param id ID của dịch vụ cần cập nhật.
   * @param updateServiceDto Dữ liệu cập nhật.
   * @returns Dịch vụ đã cập nhật.
   * @throws NotFoundException nếu không tìm thấy dịch vụ.
   */
  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations'], // Cần load bản dịch để xử lý cập nhật
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    const { translations, ...serviceData } = updateServiceDto;

    // Cập nhật thông tin cơ bản của dịch vụ
    this.servicesRepository.merge(service, serviceData);
    await this.servicesRepository.save(service);

    // Xử lý cập nhật bản dịch
    if (translations) {
      for (const translationDto of translations) {
        let existingTranslation = service.translations.find(
          (t) => t.locale === translationDto.locale,
        );

        if (existingTranslation) {
          // Cập nhật bản dịch hiện có
          this.translationsRepository.merge(existingTranslation, translationDto);
          await this.translationsRepository.save(existingTranslation);
        } else {
          // Tạo bản dịch mới nếu chưa tồn tại
          const newTranslation = this.translationsRepository.create({
            ...translationDto,
            service: service,
          });
          await this.translationsRepository.save(newTranslation);
        }
      }
    }

    const updatedService = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!updatedService) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }
    return updatedService;
  }

  /**
   * Xóa một dịch vụ theo ID.
   * @param id ID của dịch vụ cần xóa.
   * @throws NotFoundException nếu không tìm thấy dịch vụ.
   */
  async remove(id: number): Promise<void> {
    const result = await this.servicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }
  }

  // --- HÀM MỚI DÀNH RIÊNG CHO ADMIN PANEL ---
  async findAllForAdmin(queryDto: QueryServiceDto): Promise<PaginatedServiceResult> {
    const { page, limit, q, sortBy, sortOrder, featured, category } = queryDto;
    const skip = (page - 1) * limit;

    const allowedSortBy = ['id', 'code', 'category', 'featured', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const queryBuilder = this.servicesRepository.createQueryBuilder('service');
    
    // Nếu có query tìm kiếm `q`
    if (q) {
      // Dùng innerJoin để chỉ lấy các service có translation khớp
      // Dùng leftJoin để lấy tất cả service có service-level fields khớp
      queryBuilder.leftJoin('service.translations', 'translation');
      queryBuilder.where(
        '(service.code ILIKE :q OR service.category ILIKE :q OR translation.title ILIKE :q)',
        { q: `%${q}%` }
      );
    }
    
    // Lọc theo `featured`
    if (featured !== undefined) {
      queryBuilder.andWhere('service.featured = :featured', { featured });
    }
    // Lọc theo `category`
    if (category) {
      queryBuilder.andWhere('service.category = :category', { category });
    }
    
    // Đếm tổng số kết quả
    const total = await queryBuilder.getCount();

    // Áp dụng sắp xếp và phân trang
    queryBuilder
      .orderBy(`service.${sortBy || 'createdAt'}`, sortOrder)
      .leftJoinAndSelect('service.translations', 'all_translations') // Luôn nạp tất cả bản dịch
      .skip(skip)
      .take(limit);

    const data = await queryBuilder.getMany();
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }
}