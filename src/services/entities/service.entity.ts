// dir: ~/quangminh-smart-border/backend/src/services/entities/service.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceTranslation } from './service-translation.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  // @Column({ length: 50 }) // Cột cũ sẽ được thay thế bằng category_id trong migration
  // category: string; 

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: false })
  featured: boolean;

  // --- Thêm Category Relation ---
  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.services, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
  // ------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ServiceTranslation, (translation) => translation.service, {
    cascade: true,
  })
  translations: ServiceTranslation[];
}