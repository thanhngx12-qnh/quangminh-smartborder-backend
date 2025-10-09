// dir: ~/quangminh-smart-border/backend/src/news/entities/news.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsTranslation } from './news-translation.entity'; // Sẽ tạo sau

export enum NewsStatus {
  DRAFT = 'DRAFT', // Bản nháp
  PUBLISHED = 'PUBLISHED', // Đã xuất bản
}

@Entity('news') // Đặt tên bảng là 'news'
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  coverImage: string; // URL ảnh bìa của bài viết

  @Column({ default: false })
  featured: boolean; // Bài viết nổi bật (để hiển thị trên trang chủ)

  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.DRAFT,
  })
  status: NewsStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date; // Thời điểm xuất bản, có thể lên lịch

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NewsTranslation, (translation) => translation.news, {
    cascade: true, // Tự động lưu/xóa bản dịch khi bài viết được lưu/xóa
    eager: true, // Tự động load các bản dịch khi truy vấn News
  })
  translations: NewsTranslation[];
}