// dir: ~/quangminh-smart-border/backend/src/quotes/entities/quote.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quotes') // Đặt tên bảng là 'quotes'
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  customerName: string; // Tên khách hàng

  @Column({ length: 255 })
  email: string; // Email liên hệ

  @Column({ length: 50, nullable: true })
  phone?: string; // Số điện thoại liên hệ

  @Column({ nullable: true })
  serviceId?: number; // ID dịch vụ mà khách hàng quan tâm (liên kết với Service Entity)

  @Column({ type: 'text' })
  details: string; // Mô tả chi tiết yêu cầu của khách hàng

  @Column({ length: 50, default: 'PENDING' })
  status: string; // Trạng thái của yêu cầu báo giá: PENDING, APPROVED, REJECTED, CONTACTED, etc.

  @Column({ type: 'float', nullable: true })
  aiSuggestedPrice?: number; // Giá gợi ý bằng AI (tạm thời sẽ là giá giả lập)

  @Column({ type: 'text', nullable: true })
  adminNotes?: string; // Ghi chú của Admin/Sales

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}