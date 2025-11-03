// dir: ~/quangminh-smart-border/backend/src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Import tất cả các Entity mà Dashboard cần để thống kê
import { Quote } from 'src/quotes/entities/quote.entity';
import { Consignment } from 'src/consignments/entities/consignment.entity';
import { JobApplication } from 'src/careers/entities/job-application.entity';
import { News } from 'src/news/entities/news.entity';
import { Service } from 'src/services/entities/service.entity';

@Module({
  imports: [
    // Dòng này cung cấp các Repository cần thiết cho DashboardService
    TypeOrmModule.forFeature([
      Quote, 
      Consignment, 
      JobApplication, 
      News,
      Service,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}