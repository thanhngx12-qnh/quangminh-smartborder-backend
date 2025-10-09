// dir: ~/quangminh-smart-border/backend/src/careers/careers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, JobStatus } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingsRepository: Repository<JobPosting>,
    @InjectRepository(JobApplication)
    private jobApplicationsRepository: Repository<JobApplication>,
  ) {}

  // --- Methods for Job Postings ---

  createJobPosting(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = this.jobPostingsRepository.create(createJobPostingDto);
    return this.jobPostingsRepository.save(jobPosting);
  }

  findAllJobPostings(status?: JobStatus): Promise<JobPosting[]> {
    const where = status ? { status } : {};
    return this.jobPostingsRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOneJobPosting(id: number): Promise<JobPosting> {
    const jobPosting = await this.jobPostingsRepository.findOne({ where: { id }, relations: ['applications'] });
    if (!jobPosting) {
      throw new NotFoundException(`Job Posting with ID ${id} not found.`);
    }
    return jobPosting;
  }
  
  async updateJobPosting(id: number, updateJobPostingDto: UpdateJobPostingDto): Promise<JobPosting> {
    const jobPosting = await this.jobPostingsRepository.preload({
      id,
      ...updateJobPostingDto,
    });
    if (!jobPosting) {
      throw new NotFoundException(`Job Posting with ID ${id} not found.`);
    }
    return this.jobPostingsRepository.save(jobPosting);
  }

  async removeJobPosting(id: number): Promise<void> {
    const result = await this.jobPostingsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job Posting with ID ${id} not found.`);
    }
  }

  // --- Methods for Job Applications ---
  
  async applyForJob(
    jobPostingId: number,
    applicationDto: { applicantName: string; email: string; phone: string; coverLetter?: string },
    cvFilePath: string,
  ): Promise<JobApplication> {
    const jobPosting = await this.findOneJobPosting(jobPostingId); // Dùng lại hàm cũ để kiểm tra
    if(jobPosting.status === JobStatus.CLOSED) {
      throw new NotFoundException('This job posting is closed.');
    }

    const application = this.jobApplicationsRepository.create({
      ...applicationDto,
      cvPath: cvFilePath,
      jobPosting: jobPosting,
    });
    return this.jobApplicationsRepository.save(application);
  }

  findAllApplications(): Promise<JobApplication[]> {
    return this.jobApplicationsRepository.find({ order: { appliedAt: 'DESC' }, relations: ['jobPosting'] });
  }

  async findOneApplication(id: number): Promise<JobApplication> {
    const application = await this.jobApplicationsRepository.findOne({ where: { id }, relations: ['jobPosting'] });
    if(!application){
      throw new NotFoundException(`Application with ID ${id} not found.`);
    }
    return application;
  }
}