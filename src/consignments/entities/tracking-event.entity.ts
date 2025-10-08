// dir: ~/quangminh-smart-border/backend/src/consignments/entities/tracking-event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Consignment } from './consignment.entity';

@Entity('tracking_events') // Đặt tên bảng là 'tracking_events'
@Index(['consignment', 'eventTime']) // Index cho tìm kiếm sự kiện theo vận đơn và thời gian
export class TrackingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Consignment, (consignment) => consignment.events, {
    onDelete: 'CASCADE', // Xóa sự kiện khi vận đơn bị xóa
  })
  consignment: Consignment; // Mối quan hệ nhiều-một với Consignment

  @Column({ length: 50 })
  eventCode: string; // Mã sự kiện (ví dụ: 'ORIGIN_SCAN', 'DEPARTED', 'ARRIVED', 'DELIVERED')

  @Column({ type: 'text' })
  description: string; // Mô tả chi tiết của sự kiện

  @CreateDateColumn({ type: 'timestamp' }) // Thời gian diễn ra sự kiện
  eventTime: Date;

  @Column({ nullable: true })
  location?: string; // Địa điểm diễn ra sự kiện

  @Column({ type: 'point', nullable: true }) // Dữ liệu địa lý (lat, long)
  geo?: string; // TypeORM không hỗ trợ 'point' trực tiếp, lưu dưới dạng 'X,Y' hoặc JSON string nếu cần

  @Column({ nullable: true })
  createdBy?: number; // ID người tạo sự kiện (nếu là nhân viên nội bộ)
}