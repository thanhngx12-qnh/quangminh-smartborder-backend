// dir: ~/quangminh-smart-border/backend/src/careers/entities/job-application.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { JobPosting } from './job-posting.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ length: 255 })
  applicantName: string; // Tên ứng viên

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  coverLetter?: string; // Thư giới thiệu

  @Column()
  cvPath: string; // Đường dẫn tới file CV đã upload
  
  @CreateDateColumn()
  appliedAt: Date;

  @ManyToOne(() => JobPosting, jobPosting => jobPosting.applications, { onDelete: 'SET NULL', nullable: true })
  jobPosting: JobPosting;
}