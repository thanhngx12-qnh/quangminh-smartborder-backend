// dir: ~/quangminh-smart-border/backend/src/consignments/entities/consignment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TrackingEvent } from './tracking-event.entity'; // Sẽ tạo sau

@Entity('consignments') // Đặt tên bảng là 'consignments'
export class Consignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  @Index({ unique: true }) // Đảm bảo AWB là duy nhất và có index để tìm kiếm nhanh
  awb: string; // Air Waybill hoặc mã vận đơn

  @Column({ nullable: true })
  customerId?: number; // ID khách hàng liên quan (nếu có, sau này tích hợp Auth)

  @Column({ length: 255 })
  origin: string; // Điểm xuất phát của hàng hóa

  @Column({ length: 255 })
  destination: string; // Điểm đến của hàng hóa

  @Column({ length: 50, default: 'PENDING' })
  status: string; // Trạng thái hiện tại: PENDING, IN_TRANSIT, DELIVERED, EXCEPTION, etc.

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate?: Date; // Ngày giờ giao hàng dự kiến

  @Column({ type: 'float', nullable: true })
  aiPredictedEta?: number; // Thời gian đến dự kiến bằng AI (ví dụ: số giờ còn lại)

  @Column({ type: 'jsonb', nullable: true })
  metadata?: object; // Dữ liệu bổ sung dưới dạng JSON (ví dụ: loại hàng, trọng lượng, số lượng)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TrackingEvent, (event) => event.consignment, {
    cascade: true, // Tự động lưu/xóa các sự kiện khi vận đơn được lưu/xóa
  })
  events: TrackingEvent[]; // Mối quan hệ một-nhiều với các sự kiện theo dõi
}