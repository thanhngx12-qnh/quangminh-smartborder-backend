// dir: ~/quangminh-smart-border/backend/src/services/entities/service-translation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_translations') // Đặt tên bảng là 'service_translations'
@Index(['service', 'locale'], { unique: true }) // Đảm bảo mỗi dịch vụ chỉ có một bản dịch cho mỗi ngôn ngữ
export class ServiceTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string; // Ví dụ: 'vi', 'en', 'zh-CN'

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string; // Slug cho URL, ví dụ: 'van-tai-bien-gioi'

  @Column({ type: 'text', nullable: true })
  shortDesc: string;

  @Column({ type: 'text', nullable: true })
  content: string; // Nội dung chi tiết của dịch vụ (có thể là Markdown)

  @ManyToOne(() => Service, (service) => service.translations, {
    onDelete: 'CASCADE', // Xóa bản dịch khi dịch vụ bị xóa
  })
  service: Service; // Mối quan hệ nhiều-một với Service
}