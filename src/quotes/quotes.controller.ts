// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './entities/quote.entity';

@Controller('quotes') // Base route: /quotes
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /**
   * @route POST /quotes
   * @description Gửi một yêu cầu báo giá mới từ phía khách hàng.
   * @param createQuoteDto Dữ liệu yêu cầu báo giá.
   * @returns Yêu cầu báo giá đã tạo.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQuoteDto: CreateQuoteDto): Promise<Quote> {
    return this.quotesService.create(createQuoteDto);
  }

  /**
   * @route GET /quotes
   * @description Lấy danh sách tất cả yêu cầu báo giá. (Chỉ cho Admin)
   * @param status (Query parameter, tùy chọn) Lọc theo trạng thái yêu cầu báo giá.
   * @returns Mảng các yêu cầu báo giá.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('status') status?: string): Promise<Quote[]> {
    return this.quotesService.findAll(status);
  }

  /**
   * @route GET /quotes/:id
   * @description Lấy chi tiết một yêu cầu báo giá theo ID. (Chỉ cho Admin)
   * @param id ID của yêu cầu báo giá.
   * @returns Yêu cầu báo giá tìm thấy.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Quote> {
    return this.quotesService.findOne(id);
  }

  /**
   * @route PATCH /quotes/:id
   * @description Cập nhật một yêu cầu báo giá. (Chỉ cho Admin)
   * @param id ID của yêu cầu báo giá cần cập nhật.
   * @param updateQuoteDto Dữ liệu cập nhật.
   * @returns Yêu cầu báo giá đã cập nhật.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ): Promise<Quote> {
    return this.quotesService.update(id, updateQuoteDto);
  }

  /**
   * @route DELETE /quotes/:id
   * @description Xóa một yêu cầu báo giá theo ID. (Chỉ cho Admin)
   * @param id ID của yêu cầu báo giá cần xóa.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.quotesService.remove(id);
  }
}