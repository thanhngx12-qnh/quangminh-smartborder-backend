// dir: ~/quangminh-smart-border/backend/src/news/entities/news.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { NewsTranslation } from './news-translation.entity';
import { Category } from '../../categories/entities/category.entity';

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: false })
  featured: boolean;

  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.DRAFT,
  })
  status: NewsStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  // --- Thêm Category Relation ---
  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.news, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
  // ------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NewsTranslation, (translation) => translation.news, {
    cascade: true,
    eager: true,
  })
  translations: NewsTranslation[];
}