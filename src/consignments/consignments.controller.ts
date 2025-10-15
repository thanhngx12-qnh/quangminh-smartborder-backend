// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.controller.ts
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
  UseGuards, // <-- Import
  Request,  // <-- Import
} from '@nestjs/common';
import { ConsignmentsService } from './consignments.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // <-- Import
import { RolesGuard } from 'src/auth/guards/roles.guard';     // <-- Import
import { Roles } from 'src/auth/decorators/roles.decorator';  // <-- Import
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/entities/user.entity';    // <-- Import

@Controller('consignments')
export class ConsignmentsController {
  constructor(private readonly consignmentsService: ConsignmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPS) // ADMIN và OPS có thể tạo
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConsignmentDto: CreateConsignmentDto) {
    return this.consignmentsService.create(createConsignmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPS, UserRole.SALES) // ADMIN, OPS, SALES có thể xem
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.consignmentsService.findAll();
  }
  
  /**
   * Endpoint này công khai để khách hàng tra cứu
   */
  @Get('lookup/:awb')
  @HttpCode(HttpStatus.OK)
  async findOneByAwb(@Param('awb') awb: string) {
    return this.consignmentsService.findOneByAwb(awb);
  }

  @Patch(':awb')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPS) // ADMIN và OPS có thể cập nhật
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('awb') awb: string,
    @Body() updateConsignmentDto: UpdateConsignmentDto,
  ) {
    return this.consignmentsService.update(awb, updateConsignmentDto);
  }

  /**
   * @route POST /consignments/:awb/events
   * @description Thêm một sự kiện theo dõi vào vận đơn.
   */
  @Post(':awb/events')
  @UseGuards(JwtAuthGuard, RolesGuard) // Đảm bảo endpoint này được bảo vệ
  @Roles(UserRole.ADMIN, UserRole.OPS)  // Chỉ Admin và Ops được thêm event
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async addTrackingEvent(
    @Param('awb') awb: string,
    @Body() addTrackingEventDto: AddTrackingEventDto,
    @Request() req: { user: User }, // <-- Lấy user từ request
  ): Promise<TrackingEvent> {
    return this.consignmentsService.addTrackingEvent(awb, addTrackingEventDto, req.user);
  }

  @Delete(':awb')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Chỉ ADMIN được xóa
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('awb') awb: string) {
    await this.consignmentsService.remove(awb);
  }
}