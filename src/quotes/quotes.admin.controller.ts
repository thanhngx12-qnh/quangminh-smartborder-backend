// dir: ~/quangminh-smart-border/backend/src/quotes/quotes.admin.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { QueryQuoteDto } from './dto/query-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@ApiTags('Admin - Quotes')
@Controller('admin/quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuotesAdminController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES) // Chỉ Admin và Sales được xem
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu báo giá (phân trang, lọc, tìm kiếm)' })
  findAllForAdmin(@Query(new ValidationPipe({ transform: true })) queryDto: QueryQuoteDto) {
    return this.quotesService.findAllForAdmin(queryDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @ApiOperation({ summary: 'Lấy chi tiết một yêu cầu báo giá' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findOneForAdmin(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @ApiOperation({ summary: 'Cập nhật một yêu cầu báo giá (trạng thái, ghi chú)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.updateForAdmin(id, updateQuoteDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Chỉ Admin được xóa
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa một yêu cầu báo giá (chỉ Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.removeForAdmin(id);
  }
}