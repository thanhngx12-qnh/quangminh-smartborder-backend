// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Service } from 'src/services/entities/service.entity'; // Import Service entity

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
}