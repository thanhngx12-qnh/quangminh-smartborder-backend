// dir: ~/quangminh-smart-border/backend/src/services/entities/service.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ServiceTranslation } from './service-translation.entity'; // Sẽ tạo sau

@Entity('services') // Đặt tên bảng là 'services'
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // Ví dụ: 'transport', 'warehouse', 'ecommerce'

  @Column({ length: 50 })
  category: string; // Ví dụ: 'Vận Tải', 'Kho Bãi', 'TMĐT'

  @Column({ nullable: true })
  coverImage: string; // URL ảnh bìa

  @Column({ default: false })
  featured: boolean; // Dịch vụ nổi bật

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ServiceTranslation, (translation) => translation.service, {
    cascade: true, // Tự động lưu/xóa bản dịch khi dịch vụ được lưu/xóa
  })
  translations: ServiceTranslation[]; // Mối quan hệ một-nhiều với bản dịch
}