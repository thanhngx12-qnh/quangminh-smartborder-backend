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
  UseGuards, // <-- Import
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // <-- Import
import { RolesGuard } from 'src/auth/guards/roles.guard';     // <-- Import
import { Roles } from 'src/auth/decorators/roles.decorator';  // <-- Import
import { UserRole } from 'src/users/entities/user.entity';    // <-- Import

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /**
   * Endpoint này công khai để khách hàng gửi yêu cầu
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES) // ADMIN và SALES có thể xem
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('status') status?: string) {
    return this.quotesService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES) // ADMIN và SALES có thể xem
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES) // ADMIN và SALES có thể cập nhật
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Chỉ ADMIN được xóa
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.quotesService.remove(id);
  }
}