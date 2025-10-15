// dir: ~/quangminh-smart-border/backend/src/quotes/entities/quote.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne, // <-- Import ManyToOne
  JoinColumn, // <-- Import JoinColumn (good practice)
} from 'typeorm';
import { Service } from 'src/services/entities/service.entity'; // <-- Import Service

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  customerName: string;

  @Column({ length: 255 })
  email: string;

  // SỬA LỖI Ở ĐÂY: Bỏ `nullable: true` để biến nó thành bắt buộc
  @Column({ length: 50 })
  phone: string;

  @Column({ type: 'text' })
  details: string;

  @Column({ length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'float', nullable: true })
  aiSuggestedPrice?: number;

  @Column({ type: 'text', nullable: true })
  adminNotes?: string;
  
  // SỬA LỖI Ở ĐÂY: Tạo mối quan hệ thực sự với Service
  @ManyToOne(() => Service, {
    nullable: true, // Cho phép yêu cầu báo giá chung, không trỏ đến dịch vụ cụ thể
    onDelete: 'SET NULL', // Nếu xóa Service, chỉ set serviceId trong quote thành NULL
  })
  @JoinColumn({ name: 'serviceId' }) // Chỉ định rõ tên cột khóa ngoại
  service: Service | null;
  
  @Column({ nullable: true })
  serviceId: number; // Vẫn giữ cột này để TypeORM quản lý khóa ngoại

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}