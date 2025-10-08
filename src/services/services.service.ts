// dir: ~/quangminh-smart-border/backend/src/services/services.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceTranslation } from './entities/service-translation.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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
ßsw
  /**
   * Lấy danh sách tất cả dịch vụ.
   * Có thể lọc theo ngôn ngữ (locale) và trạng thái nổi bật (featured).
   * @param locale Lọc bản dịch theo ngôn ngữ.
   * @param featured Lọc dịch vụ nổi bật.
   * @returns Mảng các dịch vụ.
   */
  async findAll(locale?: string, featured?: boolean): Promise<Service[]> {
    const queryBuilder = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translation');

    if (locale) {
      queryBuilder.andWhere('translation.locale = :locale', { locale });
    } else {
        // Nếu không có locale, chỉ lấy bản dịch mặc định (ví dụ: 'vi') hoặc tất cả
        // Để đơn giản, hiện tại nếu không có locale sẽ trả về tất cả bản dịch của mỗi service.
        // Bạn có thể tùy chỉnh logic này sau.
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('service.featured = :featured', { featured });
    }

    return queryBuilder.getMany();
  }

  /**
   * Lấy chi tiết một dịch vụ theo ID.
   * @param id ID của dịch vụ.
   * @param locale Lọc bản dịch theo ngôn ngữ.
   * @returns Dịch vụ tìm thấy.
   * @throws NotFoundException nếu không tìm thấy dịch vụ.
   */
  async findOne(id: number, locale?: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    // Nếu có locale, chỉ trả về bản dịch cho locale đó
    if (locale) {
      service.translations = service.translations.filter(t => t.locale === locale);
    }

    return service;
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
}