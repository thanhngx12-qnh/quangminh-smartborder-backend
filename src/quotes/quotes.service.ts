// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private quotesRepository: Repository<Quote>,
  ) {}

  /**
   * Tạo một yêu cầu báo giá mới từ khách hàng.
   * @param createQuoteDto Dữ liệu yêu cầu báo giá từ client.
   * @returns Yêu cầu báo giá đã tạo.
   */
  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const quote = this.quotesRepository.create(createQuoteDto);

    // Tạm thời, giả lập giá gợi ý bằng AI
    quote.aiSuggestedPrice = this.generateMockAiPrice(createQuoteDto.serviceId, createQuoteDto.details);
    quote.status = 'PENDING'; // Trạng thái ban đầu

    await this.quotesRepository.save(quote);
    return quote;
  }

  /**
   * Lấy danh sách tất cả yêu cầu báo giá. (Chỉ cho Admin)
   * @param status (Tùy chọn) Lọc theo trạng thái.
   * @returns Mảng các yêu cầu báo giá.
   */
  async findAll(status?: string): Promise<Quote[]> {
    const findOptions: any = {};
    if (status) {
      findOptions.where = { status };
    }
    return this.quotesRepository.find({
      ...findOptions,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết một yêu cầu báo giá theo ID.
   * @param id ID của yêu cầu báo giá.
   * @returns Yêu cầu báo giá tìm thấy.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }
    return quote;
  }

  /**
   * Cập nhật yêu cầu báo giá. (Chỉ cho Admin)
   * @param id ID của yêu cầu báo giá cần cập nhật.
   * @param updateQuoteDto Dữ liệu cập nhật.
   * @returns Yêu cầu báo giá đã cập nhật.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }

    this.quotesRepository.merge(quote, updateQuoteDto);
    await this.quotesRepository.save(quote);
    return quote;
  }

  /**
   * Xóa một yêu cầu báo giá theo ID. (Chỉ cho Admin)
   * @param id ID của yêu cầu báo giá cần xóa.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async remove(id: number): Promise<void> {
    const result = await this.quotesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Quote with ID ${id} not found.`);
    }
  }

  /**
   * Hàm giả lập để tạo giá gợi ý bằng AI.
   * Trong thực tế, đây sẽ là một hàm phức tạp hơn, có thể gọi một AI service khác.
   */
  private generateMockAiPrice(serviceId?: number, details?: string): number {
    // Logic giả lập: giá sẽ khác nhau tùy thuộc vào serviceId và độ dài của details
    let basePrice = 1000; // Giá cơ bản
    if (serviceId) {
      basePrice += serviceId * 100; // Tăng giá dựa trên ID dịch vụ
    }
    if (details && details.length > 50) {
      basePrice += 500; // Tăng giá nếu yêu cầu chi tiết
    }
    const variance = Math.random() * 200 - 100; // Cộng trừ ngẫu nhiên
    return parseFloat((basePrice + variance).toFixed(2));
  }
}