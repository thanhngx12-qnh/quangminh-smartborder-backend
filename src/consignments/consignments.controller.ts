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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConsignmentsService } from './consignments.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';
import { Consignment } from './entities/consignment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';

@Controller('consignments') // Base route: /consignments
export class ConsignmentsController {
  constructor(private readonly consignmentsService: ConsignmentsService) {}

  /**
   * @route POST /consignments
   * @description Tạo một vận đơn mới.
   * @param createConsignmentDto Dữ liệu vận đơn từ request body.
   * @returns Vận đơn đã tạo.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConsignmentDto: CreateConsignmentDto): Promise<Consignment> {
    return this.consignmentsService.create(createConsignmentDto);
  }

  /**
   * @route GET /consignments
   * @description Lấy danh sách tất cả vận đơn (chỉ cho Admin).
   * @returns Mảng các vận đơn.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Consignment[]> {
    return this.consignmentsService.findAll();
  }

  /**
   * @route GET /consignments/lookup/:awb
   * @description Tra cứu vận đơn theo mã AWB.
   * @param awb Mã vận đơn.
   * @returns Vận đơn tìm thấy cùng với các sự kiện theo dõi.
   */
  @Get('lookup/:awb')
  @HttpCode(HttpStatus.OK)
  async findOneByAwb(@Param('awb') awb: string): Promise<Consignment> {
    return this.consignmentsService.findOneByAwb(awb);
  }

  /**
   * @route PATCH /consignments/:awb
   * @description Cập nhật thông tin vận đơn.
   * @param awb Mã vận đơn cần cập nhật.
   * @param updateConsignmentDto Dữ liệu cập nhật.
   * @returns Vận đơn đã cập nhật.
   */
  @Patch(':awb')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('awb') awb: string,
    @Body() updateConsignmentDto: UpdateConsignmentDto,
  ): Promise<Consignment> {
    return this.consignmentsService.update(awb, updateConsignmentDto);
  }

  /**
   * @route POST /consignments/:awb/events
   * @description Thêm một sự kiện theo dõi vào vận đơn.
   * @param awb Mã vận đơn.
   * @param addTrackingEventDto Dữ liệu sự kiện theo dõi.
   * @returns Sự kiện theo dõi đã thêm.
   */
  @Post(':awb/events')
  @HttpCode(HttpStatus.CREATED)
  async addTrackingEvent(
    @Param('awb') awb: string,
    @Body() addTrackingEventDto: AddTrackingEventDto,
  ): Promise<TrackingEvent> {
    return this.consignmentsService.addTrackingEvent(awb, addTrackingEventDto);
  }

  /**
   * @route DELETE /consignments/:awb
   * @description Xóa một vận đơn theo mã AWB.
   * @param awb Mã vận đơn cần xóa.
   */
  @Delete(':awb')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('awb') awb: string): Promise<void> {
    await this.consignmentsService.remove(awb);
  }
}