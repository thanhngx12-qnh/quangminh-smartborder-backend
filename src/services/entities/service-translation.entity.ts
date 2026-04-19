// dir: ~/quangminh-smart-border/backend/src/services/entities/service-translation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_translations')
@Index(['service', 'locale'], { unique: true })
export class ServiceTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  shortDesc: string;

  @Column({ type: 'text', nullable: true })
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

  @ManyToOne(() => Service, (service) => service.translations, {
    onDelete: 'CASCADE',
  })
  service: Service;
}