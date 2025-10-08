// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from './entities/consignment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';
import { AiEtaService } from './ai-eta.service'; // Import AI ETA Service

@Injectable()
export class ConsignmentsService {
  constructor(
    @InjectRepository(Consignment)
    private consignmentsRepository: Repository<Consignment>,
    @InjectRepository(TrackingEvent)
    private trackingEventsRepository: Repository<TrackingEvent>,
    private readonly aiEtaService: AiEtaService, // Inject AI ETA Service
  ) {}

  /**
   * Tạo một vận đơn mới.
   * @param createConsignmentDto Dữ liệu để tạo vận đơn.
   * @returns Vận đơn đã tạo.
   */
  async create(createConsignmentDto: CreateConsignmentDto): Promise<Consignment> {
    const { awb, ...rest } = createConsignmentDto;

    // Kiểm tra xem AWB đã tồn tại chưa
    const existingConsignment = await this.consignmentsRepository.findOne({ where: { awb } });
    if (existingConsignment) {
      throw new ConflictException(`Consignment with AWB '${awb}' already exists.`);
    }

    const consignment = this.consignmentsRepository.create(createConsignmentDto);
    await this.consignmentsRepository.save(consignment);

    // Dự đoán ETA ban đầu
    const predictedEta = await this.aiEtaService.predictEta(consignment, []);
    consignment.aiPredictedEta = predictedEta === null ? undefined : predictedEta;
    await this.consignmentsRepository.save(consignment); // Lưu lại ETA

    return consignment;
  }

  /**
   * Lấy danh sách tất cả vận đơn (chỉ nên dùng cho Admin).
   * @returns Mảng các vận đơn.
   */
  async findAll(): Promise<Consignment[]> {
    return this.consignmentsRepository.find({
      relations: ['events'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tra cứu vận đơn theo mã AWB.
   * @param awb Mã vận đơn.
   * @returns Vận đơn tìm thấy cùng với các sự kiện theo dõi.
   * @throws NotFoundException nếu không tìm thấy vận đơn.
   */
  async findOneByAwb(awb: string): Promise<Consignment> {
    const consignment = await this.consignmentsRepository.findOne({
      where: { awb },
      relations: ['events'], // Nạp kèm các sự kiện theo dõi
      order: { events: { eventTime: 'ASC' } }, // Sắp xếp sự kiện theo thời gian tăng dần
    });

    if (!consignment) {
      throw new NotFoundException(`Consignment with AWB '${awb}' not found.`);
    }

    return consignment;
  }

  /**
   * Cập nhật thông tin vận đơn.
   * @param awb Mã vận đơn cần cập nhật.
   * @param updateConsignmentDto Dữ liệu cập nhật.
   * @returns Vận đơn đã cập nhật.
   * @throws NotFoundException nếu không tìm thấy vận đơn.
   */
  async update(awb: string, updateConsignmentDto: UpdateConsignmentDto): Promise<Consignment> {
    const consignment = await this.consignmentsRepository.findOne({ where: { awb } });
    if (!consignment) {
      throw new NotFoundException(`Consignment with AWB '${awb}' not found.`);
    }

    this.consignmentsRepository.merge(consignment, updateConsignmentDto);
    await this.consignmentsRepository.save(consignment);

    // Dự đoán lại ETA sau khi cập nhật thông tin vận đơn
    const predictedEta = await this.aiEtaService.predictEta(consignment, consignment.events);
    consignment.aiPredictedEta = predictedEta === null ? undefined : predictedEta;
    await this.consignmentsRepository.save(consignment); // Lưu lại ETA

    return consignment;
  }

  /**
   * Thêm một sự kiện theo dõi vào vận đơn.
   * @param awb Mã vận đơn.
   * @param addTrackingEventDto Dữ liệu sự kiện theo dõi.
   * @returns Sự kiện theo dõi đã thêm.
   * @throws NotFoundException nếu không tìm thấy vận đơn.
   */
  async addTrackingEvent(awb: string, addTrackingEventDto: AddTrackingEventDto): Promise<TrackingEvent> {
    const consignment = await this.consignmentsRepository.findOne({
      where: { awb },
      relations: ['events'], // Cần load events để truyền vào AI ETA service
    });
    if (!consignment) {
      throw new NotFoundException(`Consignment with AWB '${awb}' not found.`);
    }

    const event = this.trackingEventsRepository.create({
      ...addTrackingEventDto,
      eventTime: addTrackingEventDto.eventTime ? new Date(addTrackingEventDto.eventTime) : new Date(),
      consignment: consignment,
    });
    await this.trackingEventsRepository.save(event);

    // Cập nhật trạng thái vận đơn nếu sự kiện là trạng thái cuối cùng
    if (event.eventCode === 'DELIVERED') {
      consignment.status = 'DELIVERED';
      consignment.estimatedDeliveryDate = event.eventTime; // Cập nhật ngày giao thực tế
    } else if (event.eventCode === 'ARRIVED' && event.location === consignment.destination) {
      consignment.status = 'ARRIVED_AT_DESTINATION';
    } else if (event.eventCode === 'DEPARTED') {
        consignment.status = 'IN_TRANSIT';
    }
    // Cập nhật AI Predicted ETA sau khi có sự kiện mới
    const predictedEta = await this.aiEtaService.predictEta(consignment, [...consignment.events, event]);
    consignment.aiPredictedEta = predictedEta === null ? undefined : predictedEta;
    await this.consignmentsRepository.save(consignment);

    return event;
  }

  /**
   * Xóa một vận đơn theo mã AWB.
   * @param awb Mã vận đơn cần xóa.
   * @throws NotFoundException nếu không tìm thấy vận đơn.
   */
  async remove(awb: string): Promise<void> {
    const result = await this.consignmentsRepository.delete({ awb });
    if (result.affected === 0) {
      throw new NotFoundException(`Consignment with AWB '${awb}' not found.`);
    }
  }
}