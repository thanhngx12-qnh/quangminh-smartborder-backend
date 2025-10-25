// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,ILike } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Service } from 'src/services/entities/service.entity'; // Import Service entity
import { PaginatedResult } from 'src/common/types/pagination.types';
import { QueryQuoteDto } from './dto/query-quote.dto';

export type PaginatedQuotesResult = PaginatedResult<Quote>;

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
    // Inject ServiceRepository để có thể tìm và gắn Service
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  /**
   * Tạo một yêu cầu báo giá mới.
   */
  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const { serviceId, ...quoteData } = createQuoteDto;
    
    // Tạo một instance Quote mới từ dữ liệu cơ bản
    const newQuote = this.quotesRepository.create(quoteData);

    // Nếu client có cung cấp serviceId, tìm và gắn đối tượng Service
    if (serviceId) {
      const service = await this.servicesRepository.findOne({ where: { id: serviceId } });
      if (!service) {
        // Ném lỗi nếu không tìm thấy Service, ngăn việc tạo Quote không hợp lệ
        throw new NotFoundException(`Service with ID ${serviceId} not found.`);
      }
      newQuote.service = service;
    }

    // Các logic khác
    newQuote.aiSuggestedPrice = this.generateMockAiPrice(serviceId, createQuoteDto.details);
    newQuote.status = 'PENDING';

    // Lưu Quote vào database
    return this.quotesRepository.save(newQuote);
  }

  // HÀM MỚI CHO ADMIN (thay thế hàm `findAll` cũ)
  async findAllForAdmin(queryDto: QueryQuoteDto): Promise<PaginatedQuotesResult> {
    const { page, limit, q, sortBy, sortOrder, status } = queryDto;

    const allowedSortBy = ['id', 'customerName', 'email', 'status', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const skip = (page - 1) * limit;
    
    // Sử dụng `where` để có thể kết hợp điều kiện OR cho tìm kiếm
    const where: any = {};

    if (q) {
      where.customerName = ILike(`%${q}%`); // Tìm kiếm không phân biệt hoa thường
      // Có thể thêm tìm kiếm theo email
      // where = [ { customerName: ILike(`%${q}%`) }, { email: ILike(`%${q}%`) } ];
    }
    
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.quotesRepository.findAndCount({
      where,
      relations: { service: { translations: true } }, // Nạp kèm thông tin dịch vụ
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    const lastPage = Math.ceil(total / limit);

    return { data, total, page, limit, lastPage };
  }

  /**
   * Lấy tất cả yêu cầu báo giá (cho Admin), bao gồm cả thông tin Service liên quan.
   */
  async findAll(status?: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      // `relations` sẽ tự động join và nạp dữ liệu từ bảng `services`
      relations: {
        service: true,
      },
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForAdmin(id: number): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: { service: { translations: true } },
    });
    if (!quote) {
      throw new NotFoundException(`Không tìm thấy yêu cầu báo giá với ID ${id}`);
    }
    return quote;
  }

  /**
   * Lấy chi tiết một yêu cầu báo giá, bao gồm cả thông tin Service.
   */
  async findOne(id: number): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id },
      relations: {
        service: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }
    return quote;
  }

  /**
   * Cập nhật một yêu cầu báo giá.
   */
  async update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    // `preload` sẽ nạp entity hiện có và merge các thay đổi mới
    // Nó không nạp relations, vì vậy chúng ta cần xử lý serviceId riêng
    const { serviceId, ...restOfUpdates } = updateQuoteDto;
    
    const quote = await this.quotesRepository.preload({
      id,
      ...restOfUpdates,
    });
    
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }

    // Nếu có serviceId mới được cung cấp trong DTO, cập nhật mối quan hệ
    if (serviceId !== undefined) {
      if(serviceId === null) {
        quote.service = null; // Cho phép ngắt kết nối với service
      } else {
        const service = await this.servicesRepository.findOne({ where: { id: serviceId } });
        if (!service) {
          throw new NotFoundException(`Service with ID ${serviceId} not found.`);
        }
        quote.service = service;
      }
    }

    return this.quotesRepository.save(quote);
  }

  /**
   * Xóa một yêu cầu báo giá.
   */
  async remove(id: number): Promise<void> {
    const result = await this.quotesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }
  }

  /**
   * Hàm giả lập giá gợi ý.
   */
  private generateMockAiPrice(serviceId?: number, details?: string): number {
    let basePrice = 1000;
    if (serviceId) {
      basePrice += serviceId * 100;
    }
    if (details && details.length > 50) {
      basePrice += 500;
    }
    const variance = Math.random() * 200 - 100;
    return parseFloat((basePrice + variance).toFixed(2));
  }

  // Hàm `update` cũ sẽ trở thành `updateForAdmin`
  async updateForAdmin(id: number, updateDto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.quotesRepository.preload({ id, ...updateDto });
    if (!quote) {
      throw new NotFoundException(`Không tìm thấy yêu cầu báo giá với ID ${id} để cập nhật`);
    }

    // Nếu muốn thay đổi service của quote
    if (updateDto.serviceId) {
      // Logic gán service (tương tự như lần trước chúng ta đã sửa)
    }

    return this.quotesRepository.save(quote);
  }

  // Hàm `remove` cũ sẽ trở thành `removeForAdmin`
  async removeForAdmin(id: number): Promise<void> {
    const result = await this.quotesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy yêu cầu báo giá với ID ${id}`);
    }
  }
}