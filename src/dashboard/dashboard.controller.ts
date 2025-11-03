// dir: ~/quangminh-smart-border/backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { TimeSeriesQueryDto, CategoricalQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Admin - Dashboard')
@Controller('stats') // Sử dụng prefix /stats theo yêu cầu
@UseGuards(JwtAuthGuard) // Bảo vệ tất cả các endpoint trong controller này
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Lấy các số liệu thống kê tổng quan (KPIs)' })
  getSummary() {
    // Không cần tham số, gọi thẳng vào service
    return this.dashboardService.getSummary();
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Lấy dữ liệu chuỗi thời gian cho biểu đồ đường/cột' })
  getTimeSeries(
    @Query(new ValidationPipe({ transform: true })) 
    query: TimeSeriesQueryDto
  ) {
    // DTO đã được validate, chỉ cần truyền vào service
    return this.dashboardService.getTimeSeries(query.metric, query.range);
  }
  
  @Get('categorical')
  @ApiOperation({ summary: 'Lấy dữ liệu phân loại cho biểu đồ tròn' })
  getCategorical(
    @Query(new ValidationPipe({ transform: true })) 
    query: CategoricalQueryDto
  ) {
    // DTO đã được validate
    return this.dashboardService.getCategorical(query.metric);
  }

  // Đổi tên endpoint từ `/activities/recent` cho nhất quán với prefix `stats`
  @Get('recent-activities') 
  @ApiOperation({ summary: 'Lấy các hoạt động gần đây (5 quotes, 5 consignments)' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }
}