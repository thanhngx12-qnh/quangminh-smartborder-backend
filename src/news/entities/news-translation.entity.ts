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
@Index(['news', 'locale'], { unique: true })
export class NewsTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  // --- Thêm các trường SEO ---
  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  metaKeywords: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ogImage: string;
  // --------------------------

  @ManyToOne(() => News, (news) => news.translations, {
    onDelete: 'CASCADE',
  })
  news: News;
}