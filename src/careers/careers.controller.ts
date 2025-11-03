// dir: ~/quangminh-smart-border/backend/src/careers/careers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors, // <-- Import UseInterceptors
  UploadedFile,     // <-- Import UploadedFile
  ParseFilePipe,    // <-- Import các Pipe để validate file
  FileTypeValidator,
  MaxFileSizeValidator,
  DefaultValuePipe,
  BadRequestException,
  ValidationPipe, 
  HttpCode, 
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // <-- Import FileInterceptor
import { CareersService, PaginatedJobPostingsResult } from './careers.service'; // Import thêm 
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobStatus } from './entities/job-posting.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { QueryJobPostingDto } from './dto/query-job-posting.dto';
import { QueryJobApplicationDto } from './dto/query-job-application.dto';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}
  
  // --- Public Job Posting Endpoints ---
  @Get('postings')
  @ApiOperation({ summary: 'Get open job postings (paginated) - Public' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllOpenJobPostings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
  ) {
    return this.careersService.findAllJobPostings(page, limit, JobStatus.OPEN);
  }

  @Get('postings/:id')
  findOneJobPosting(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.findOneJobPosting(id);
  }

  // --- Job Application Endpoints ---
@Post('postings/:id/apply')
  @UseInterceptors(FileInterceptor('cv')) // Dòng này giữ nguyên
  @ApiOperation({ summary: 'Apply for a job opening and upload CV' })
  @ApiConsumes('multipart/form-data') // Thêm để Swagger hiển thị nút upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        applicantName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        cv: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  applyForJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() createApplicationDto: CreateJobApplicationDto,
    @UploadedFile() file: Express.Multer.File, // Giữ nguyên
  ) {
    if (!file) {
      throw new BadRequestException('CV file is required.'); // Dùng lỗi HTTP chuẩn
    }

    // `file.path` bây giờ sẽ là URL từ Cloudinary, ví dụ: "https://res.cloudinary.com/..."
    return this.careersService.applyForJob(id, createApplicationDto, file.path);
  }

  @Get('postingss/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả tin tuyển dụng' })
  // Decorator của Swagger vẫn giữ nguyên, rất tốt cho tài liệu
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllJobPostingsForAdmin(
    // SỬA LẠI HOÀN TOÀN:
    // 1. Nhận các filter (string, enum) vào DTO
    @Query() queryDto: QueryJobPostingDto, 
    // 2. Nhận các tham số cần parse riêng
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    // 3. Gộp chúng lại trước khi gửi vào service
    queryDto.page = page;
    queryDto.limit = limit;
    return this.careersService.findAllJobPostingsForAdmin(queryDto);
  }


  @Post('postings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Tạo tin tuyển dụng mới' })
  createJobPosting(@Body() createDto: CreateJobPostingDto) {
    return this.careersService.createJobPosting(createDto);
  }

  // === Job Applications ===
  
  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Lấy danh sách hồ sơ ứng tuyển' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'jobPostingId', required: false, type: Number })
  findAllApplicationsForAdmin(
    // Áp dụng cách sửa tương tự
    @Query() queryDto: QueryJobApplicationDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('jobPostingId', new ParseIntPipe({ optional: true })) jobPostingId?: number
  ) {
    queryDto.page = page;
    queryDto.limit = limit;
    queryDto.jobPostingId = jobPostingId; // Gán lại jobPostingId đã được parse
    return this.careersService.findAllApplicationsForAdmin(queryDto);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Lấy chi tiết một hồ sơ ứng tuyển' })
  findOneApplicationForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.findOneApplicationForAdmin(id);
  }
  
  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Xóa một hồ sơ ứng tuyển' })
  removeApplicationForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.removeApplicationForAdmin(id);
  }

  @Patch('postings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Cập nhật tin tuyển dụng' })
  updateJobPosting(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobPostingDto: UpdateJobPostingDto,
  ) {
    return this.careersService.updateJobPosting(id, updateJobPostingDto);
  }

  @Delete('postings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Chỉ Admin được xóa
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT) // Chuẩn RESTful cho DELETE thành công
  @ApiOperation({ summary: '[Admin] Xóa tin tuyển dụng' })
  removeJobPosting(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.careersService.removeJobPosting(id);
  }
}