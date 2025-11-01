// dir: ~/quangminh-smart-border/backend/src/careers/careers.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { JobPosting, JobStatus } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { PaginatedResult } from 'src/common/types/pagination.types'; 
import { QueryJobPostingDto } from './dto/query-job-posting.dto';
import { QueryJobApplicationDto } from './dto/query-job-application.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

export type PaginatedJobPostingsResult = PaginatedResult<JobPosting>;
export type PaginatedJobApplicationsResult = PaginatedResult<JobApplication>;
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

  // Nâng cấp hàm `findAllJobPostings` thành hàm cho admin.
  async findAllJobPostingsForAdmin(queryDto: QueryJobPostingDto): Promise<PaginatedJobPostingsResult> {
    const { page, limit, q, sortBy, sortOrder, status } = queryDto;
    const skip = (page - 1) * limit;

    const allowedSortBy = ['id', 'title', 'location', 'status', 'createdAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const where: FindOptionsWhere<JobPosting> = {};
    if (q) where.title = ILike(`%${q}%`);
    if (status) where.status = status;

    const [data, total] = await this.jobPostingsRepository.findAndCount({
      where,
      order: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'DESC' },
      skip, take: limit,
    });
    
    return { data, total, page, limit, lastPage: Math.ceil(total / limit) };
  }

  async findAllJobPostings(
    page: number = 1,
    limit: number = 10,
    status?: JobStatus,
  ): Promise<PaginatedJobPostingsResult> {
    const skip = (page - 1) * limit;

    const findOptions = {
      where: status ? { status } : {},
      order: { createdAt: 'DESC' as const },
      skip: skip,
      take: limit,
    };
    
    // getManyAndCount là cách hiệu quả để lấy cả dữ liệu và tổng số lượng
    const [data, total] = await this.jobPostingsRepository.findAndCount(findOptions);
    
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
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

  async findAllApplicationsForAdmin(queryDto: QueryJobApplicationDto): Promise<PaginatedJobApplicationsResult> {
    const { page, limit, q, sortBy, sortOrder, jobPostingId } = queryDto;
    const skip = (page - 1) * limit;

    const allowedSortBy = ['id', 'applicantName', 'email', 'appliedAt'];
    if (sortBy && !allowedSortBy.includes(sortBy)) {
        throw new BadRequestException(`Cột sắp xếp không hợp lệ: ${sortBy}`);
    }

    const queryBuilder = this.jobApplicationsRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.jobPosting', 'jobPosting');

    if (q) {
      queryBuilder.where('(application.applicantName ILIKE :q OR application.email ILIKE :q)', { q: `%${q}%` });
    }
    if (jobPostingId) {
      queryBuilder.andWhere('application.jobPostingId = :jobPostingId', { jobPostingId });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder.orderBy(`application.${sortBy || 'appliedAt'}`, sortOrder);
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    return { data, total, page, limit, lastPage: Math.ceil(total / limit) };
  }

  // TẠO MỚI hàm này. Hàm cũ sẽ được đổi tên
  async findOneApplicationForAdmin(id: number): Promise<JobApplication> {
    const application = await this.jobApplicationsRepository.findOne({ where: { id }, relations: ['jobPosting'] });
    if (!application) {
      throw new NotFoundException(`Không tìm thấy hồ sơ với ID ${id}`);
    }
    return application;
  }
  
  // TẠO MỚI
  async removeApplicationForAdmin(id: number): Promise<void> {
    const result = await this.jobApplicationsRepository.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`Không tìm thấy hồ sơ với ID ${id}`);
    }
  }
}