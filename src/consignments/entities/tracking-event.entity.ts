// dir: ~/quangminh-smart-border/backend/src/consignments/entities/tracking-event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn, // <-- Import JoinColumn
} from 'typeorm';
import { Consignment } from './consignment.entity';
import { User } from 'src/users/entities/user.entity'; // <-- Import User

@Entity('tracking_events')
@Index(['consignment', 'eventTime'])
export class TrackingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Consignment, (consignment) => consignment.events, {
    onDelete: 'CASCADE',
  })
  consignment: Consignment;

  @Column({ length: 50 })
  eventCode: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  eventTime: Date;

  @Column({ nullable: true })
  location?: string;
  
  @Column({ type: 'point', nullable: true })
  geo?: string;
  
  // SỬA LỖI Ở ĐÂY: Tạo mối quan hệ với User
  @ManyToOne(() => User, { 
    nullable: true, // Có thể có sự kiện tự động (NULL user)
    onDelete: 'SET NULL' // Nếu xóa user, giữ lại event nhưng createdBy là NULL
  })
  @JoinColumn({ name: 'createdById' }) // Tên cột khóa ngoại trong DB
  createdBy: User | null;
  
  // Vẫn giữ cột này để TypeORM dễ quản lý khóa ngoại,
  // và để tương thích với các DTO cũ hơn (nếu cần)
  @Column({ nullable: true })
  createdById: number;
}