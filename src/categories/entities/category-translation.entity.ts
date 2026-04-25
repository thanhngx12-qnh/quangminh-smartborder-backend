// dir: src/categories/entities/category-translation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('category_translations')
@Index(['category', 'locale'], { unique: true }) // Mỗi danh mục chỉ có 1 bản dịch cho mỗi ngôn ngữ
export class CategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string; // 'vi', 'en', 'zh'

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;
}