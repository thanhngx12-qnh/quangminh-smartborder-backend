// dir: ~/quangminh-smart-border/backend/src/dashboard/dashboard.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from 'src/quotes/entities/quote.entity';
import { Consignment } from 'src/consignments/entities/consignment.entity';
import { JobApplication } from 'src/careers/entities/job-application.entity';
import { News, NewsStatus } from 'src/news/entities/news.entity'; // Import NewsStatus
import { Service } from 'src/services/entities/service.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Quote) private quotesRepository: Repository<Quote>,
    @InjectRepository(Consignment) private consignmentsRepository: Repository<Consignment>,
    @InjectRepository(JobApplication) private applicationsRepository: Repository<JobApplication>,
    @InjectRepository(News) private newsRepository: Repository<News>,
    @InjectRepository(Service) private servicesRepository: Repository<Service>,
  ) {}

  // --- API 1: Lấy Số liệu Thống kê Tổng quan ---
  async getSummary() {
    // Chạy các câu lệnh đếm song song để tối ưu tốc độ
    const [newQuotesCount, processingConsignmentsCount, pendingApplicationsCount, totalPublishedNews] = await Promise.all([
      this.quotesRepository.count({ where: { status: 'PENDING' } }),
      this.consignmentsRepository.count({ where: { status: 'IN_TRANSIT' } }),
      this.applicationsRepository.count(), // Đếm tất cả hồ sơ
      this.newsRepository.count({ where: { status: NewsStatus.PUBLISHED } }),
    ]);

    return { newQuotesCount, processingConsignmentsCount, pendingApplicationsCount, totalPublishedNews };
  }

  // --- API 2: Lấy Dữ liệu Chuỗi thời gian ---
  async getTimeSeries(metric: 'quotes' | 'consignments', range: 'last_7_days' | 'last_30_days') {
    const days = range === 'last_7_days' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    let repository: Repository<Quote> | Repository<Consignment>;
    if (metric === 'quotes') repository = this.quotesRepository;
    else if (metric === 'consignments') repository = this.consignmentsRepository;
    else throw new BadRequestException('Metric không hợp lệ');

    // Dùng QueryBuilder để nhóm theo ngày
    const results = await repository
      .createQueryBuilder("item")
      .select(`DATE("item"."createdAt") as date, COUNT("item"."id") as count`)
      .where(`"item"."createdAt" >= :startDate`, { startDate })
      .groupBy(`DATE("item"."createdAt")`)
      .orderBy('date', 'ASC')
      .getRawMany();

    // Chuẩn hóa dữ liệu: Tạo một map để tra cứu nhanh
    const dateMap = new Map(results.map(r => [new Date(r.date).toISOString().split('T')[0], parseInt(r.count, 10)]));
    
    const finalData = [];
    // Vòng lặp qua từng ngày trong khoảng thời gian để điền dữ liệu (kể cả ngày có count = 0)
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      finalData.push({
        date: dateString,
        count: dateMap.get(dateString) || 0,
      });
    }
    
    return finalData;
  }
  
  // --- API 3: Lấy Dữ liệu Phân loại ---
  async getCategorical(metric: 'consignment_status' | 'quote_status' | 'service_category') {
    let queryBuilder;
    
    // Xây dựng query tương ứng với từng metric
    switch (metric) {
      case 'consignment_status':
        queryBuilder = this.consignmentsRepository.createQueryBuilder("item")
          .select(`"item"."status" as category, COUNT("item"."id") as value`)
          .groupBy('category');
        break;
      case 'quote_status':
        queryBuilder = this.quotesRepository.createQueryBuilder("item")
          .select(`"item"."status" as category, COUNT("item"."id") as value`)
          .groupBy('category');
        break;
      case 'service_category':
        queryBuilder = this.servicesRepository.createQueryBuilder("item")
          .select(`"item"."category" as category, COUNT("item"."id") as value`)
          .groupBy('category');
        break;
      default:
        throw new BadRequestException('Metric không hợp lệ');
    }
    
    const results = await queryBuilder.getRawMany();
    // Chuyển đổi 'value' từ string thành number
    return results.map(r => ({ ...r, value: parseInt(r.value, 10) }));
  }

  // --- API 4: Lấy Hoạt động Gần đây ---
  async getRecentActivities() {
    const [recentQuotes, recentConsignments] = await Promise.all([
      this.quotesRepository.find({ order: { createdAt: 'DESC' }, take: 5, relations: ['service'] }),
      this.consignmentsRepository.find({ order: { updatedAt: 'DESC' }, take: 5 }),
    ]);

    return { recentQuotes, recentConsignments };
  }
}