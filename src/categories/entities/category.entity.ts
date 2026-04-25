// dir: src/categories/entities/category.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { Service } from '../../services/entities/service.entity';
import { CategoryTranslation } from './category-translation.entity';

export enum CategoryType {
  NEWS = 'NEWS',
  SERVICE = 'SERVICE',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  // Name, Slug, Description đã được chuyển sang bảng Translation

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => CategoryTranslation, (translation) => translation.category, {
    cascade: true,
    eager: true, // Tự động load bản dịch khi query Category
  })
  translations: CategoryTranslation[];

  @OneToMany(() => News, (news) => news.category)
  news: News[];

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}