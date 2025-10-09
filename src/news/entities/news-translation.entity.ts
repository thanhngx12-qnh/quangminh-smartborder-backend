// dir: ~/quangminh-smart-border/backend/src/news/entities/news-translation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { News } from './news.entity';

@Entity('news_translations')
@Index(['news', 'locale'], { unique: true }) // Mỗi bài viết chỉ có một bản dịch cho mỗi ngôn ngữ
export class NewsTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string; // 'vi', 'en', 'zh-CN'

  @Column()
  title: string; // Tiêu đề bài viết

  @Column({ unique: true })
  slug: string; // Slug cho URL, ví dụ: 'chinh-sach-moi-tai-cua-khau-ta-lung'

  @Column({ type: 'text' })
  excerpt: string; // Đoạn tóm tắt/mô tả ngắn của bài viết

  @Column({ type: 'text' })
  content: string; // Nội dung chi tiết của bài viết

  @ManyToOne(() => News, (news) => news.translations, {
    onDelete: 'CASCADE', // Xóa bản dịch khi bài viết bị xóa
  })
  news: News;
}