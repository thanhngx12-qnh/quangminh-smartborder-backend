// dir: ~/quangminh-smart-border/backend/src/careers/entities/job-posting.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { JobApplication } from './job-application.entity';

export enum JobStatus {
  OPEN = 'OPEN', // Đang tuyển
  CLOSED = 'CLOSED', // Đã đóng
}

@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string; // Vị trí tuyển dụng, ví dụ: "Nhân viên Vận hành Kho"

  @Column({ length: 100 })
  location: string; // Địa điểm làm việc, ví dụ: "Tà Lùng, Cao Bằng"

  @Column({ type: 'text' })
  description: string; // Mô tả công việc

  @Column({ type: 'text' })
  requirements: string; // Yêu cầu ứng viên

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @OneToMany(() => JobApplication, application => application.jobPosting)
  applications: JobApplication[];
}