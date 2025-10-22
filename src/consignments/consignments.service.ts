// dir: ~/quangminh-smart-border/backend/src/consignments/consignments.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Consignment } from './entities/consignment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';
import { AiEtaService } from './ai-eta.service'; // Import AI ETA Service
import { User } from 'src/users/entities/user.entity'; 
import { PaginatedResult } from 'src/common/types/pagination.types'; // Import kiểu phân trang

export type PaginatedConsignmentsResult = PaginatedResult<Consignment>;

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
  async addTrackingEvent(
    awb: string, 
    addTrackingEventDto: AddTrackingEventDto,
    user: User, // <-- Nhận thêm đối tượng User
  ): Promise<TrackingEvent> {
    const consignment = await this.consignmentsRepository.findOne({
      where: { awb },
      relations: ['events'],
    });
    if (!consignment) {
      throw new NotFoundException(`Consignment with AWB '${awb}' not found.`);
    }

    const event = this.trackingEventsRepository.create({
      ...addTrackingEventDto,
      eventTime: addTrackingEventDto.eventTime ? new Date(addTrackingEventDto.eventTime) : new Date(),
      consignment: consignment,
      createdBy: user, // <-- Gán đối tượng User vào mối quan hệ
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

  /**
   * Tra cứu một hoặc nhiều vận đơn theo (các) mã AWB.
   * @param awbs Chuỗi các mã AWB, cách nhau bởi dấu phẩy, chấm phẩy hoặc khoảng trắng.
   * @returns Mảng các vận đơn tìm thấy.
   */
  async findByAwbs(awbs: string): Promise<Consignment[]> {
    if (!awbs || awbs.trim() === '') {
      return []; // Trả về mảng rỗng nếu chuỗi tìm kiếm rỗng
    }

    // Xử lý chuỗi input: Tách chuỗi bằng dấu phẩy, chấm phẩy hoặc khoảng trắng/xuống dòng.
    // Sau đó loại bỏ khoảng trắng thừa ở mỗi mã và lọc ra các mã rỗng.
    const awbList = awbs.split(/[,;\s\n]+/).map(awb => awb.trim()).filter(Boolean);

    if (awbList.length === 0) {
      return []; // Trả về mảng rỗng nếu không có mã AWB hợp lệ nào
    }

    const consignments = await this.consignmentsRepository.find({
      where: { 
        // Sử dụng toán tử In() để tạo query `WHERE "awb" IN (...)`
        awb: In(awbList) 
      },
      // Vẫn nạp kèm các sự kiện và thông tin người tạo
      relations: {
        events: {
          createdBy: true,
        },
      },
      // Sắp xếp để kết quả nhất quán
      order: { 
        createdAt: 'DESC', 
        events: { eventTime: 'ASC' } 
      },
    });
    
    // Luôn trả về một mảng, ngay cả khi không tìm thấy.
    // Frontend sẽ tự quyết định hiển thị thông báo "Không tìm thấy".
    return consignments;
  }

  async findAllForAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<PaginatedConsignmentsResult> {
    const skip = (page - 1) * limit;

    // Xây dựng các điều kiện truy vấn
    const whereConditions = {};
    if (search) {
      // Tìm kiếm không phân biệt chữ hoa/thường theo mã AWB
      whereConditions['awb'] = ILike(`%${search}%`);
    }

    const [data, total] = await this.consignmentsRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip: skip,
      take: limit,
      relations: {
        events: true, // Nạp kèm các sự kiện
      },
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async findOneForAdmin(id: number): Promise<Consignment> {
    const consignment = await this.consignmentsRepository.findOne({
      where: { id },
      relations: {
        events: {
          createdBy: true, // Nạp cả thông tin người tạo sự kiện
        },
      },
      order: {
        events: { eventTime: 'ASC' }
      }
    });

    if (!consignment) {
      throw new NotFoundException(`Consignment with ID #${id} not found.`);
    }
    return consignment;
  }

  /**
   * (Admin) Cập nhật thông tin một vận đơn.
   */
  async updateForAdmin(id: number, updateDto: UpdateConsignmentDto): Promise<Consignment> {
    const consignment = await this.consignmentsRepository.preload({
      id,
      ...updateDto,
    });
    
    if (!consignment) {
      throw new NotFoundException(`Consignment with ID #${id} not found.`);
    }
    
    return this.consignmentsRepository.save(consignment);
  }

  /**
   * (Admin) Xóa một vận đơn.
   */
  async removeForAdmin(id: number): Promise<void> {
    const result = await this.consignmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Consignment with ID #${id} not found.`);
    }
  }
}