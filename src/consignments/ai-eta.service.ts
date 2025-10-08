// dir: ~/quangminh-smart-border/backend/src/consignments/ai-eta.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Consignment } from './entities/consignment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';

@Injectable()
export class AiEtaService {
  private readonly logger = new Logger(AiEtaService.name);

  /**
   * Giả lập việc dự đoán thời gian đến dự kiến (ETA) bằng AI.
   * Trong thực tế, đây sẽ là một mô hình học máy phức tạp.
   * Hiện tại, nó sẽ trả về một giá trị ngẫu nhiên hoặc dựa trên logic đơn giản.
   * @param consignment Dữ liệu vận đơn.
   * @param events Các sự kiện theo dõi hiện có.
   * @returns Số giờ còn lại đến đích.
   */
  async predictEta(
    consignment: Consignment,
    events: TrackingEvent[],
  ): Promise<number | null> {
    this.logger.log(`Predicting ETA for AWB: ${consignment.awb}`);

    // Logic giả lập:
    // Nếu đã có sự kiện "DELIVERED", ETA là 0
    if (events.some(event => event.eventCode === 'DELIVERED')) {
      return 0;
    }

    // Nếu có sự kiện "ARRIVED" tại destination, ETA là một giá trị nhỏ (ví dụ: 1-5 giờ)
    if (events.some(event => event.eventCode === 'ARRIVED' && event.location === consignment.destination)) {
        return Math.floor(Math.random() * 5) + 1; // 1-5 giờ
    }

    // Nếu đang "IN_TRANSIT", đưa ra một số giờ ngẫu nhiên
    if (consignment.status === 'IN_TRANSIT') {
      const remainingTime = Math.floor(Math.random() * 72) + 6; // 6-78 giờ
      return remainingTime;
    }

    // Các trường hợp khác: khoảng thời gian lớn hơn
    const initialEta = Math.floor(Math.random() * 120) + 24; // 24-144 giờ
    return initialEta;
  }
}