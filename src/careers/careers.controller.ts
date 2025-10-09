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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // <-- Import FileInterceptor
import { CareersService } from './careers.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobStatus } from './entities/job-posting.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  // --- Job Posting Endpoints (Admin) ---

  @Post('postings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createJobPosting(@Body() createJobPostingDto: CreateJobPostingDto) {
    return this.careersService.createJobPosting(createJobPostingDto);
  }

  @Get('postings/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllJobPostingsForAdmin() {
    return this.careersService.findAllJobPostings();
  }

  // --- Public Job Posting Endpoints ---

  @Get('postings')
  findAllOpenJobPostings() {
    // Chỉ hiển thị các tin đang MỞ cho người dùng công khai
    return this.careersService.findAllJobPostings(JobStatus.OPEN);
  }

  @Get('postings/:id')
  findOneJobPosting(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.findOneJobPosting(id);
  }

  // --- Admin Job Posting Management ---

  @Patch('postings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateJobPosting(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobPostingDto: UpdateJobPostingDto,
  ) {
    return this.careersService.updateJobPosting(id, updateJobPostingDto);
  }

  @Delete('postings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeJobPosting(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.removeJobPosting(id);
  }

  // --- Job Application Endpoints ---

  @Post('postings/:id/apply')
  @UseInterceptors(FileInterceptor('cv')) // <-- 'cv' là tên field trong form-data
  applyForJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() createApplicationDto: CreateJobApplicationDto,
    @UploadedFile() // <-- Lấy thông tin file đã upload
    file: Express.Multer.File, // <-- Kiểu dữ liệu của file
  ) {
    // Validation: Đảm bảo file đã được upload
    if (!file) {
      throw new Error('CV file is required');
    }

    // `file.path` sẽ là đường dẫn lưu file trên server, ví dụ: 'uploads/cvs/random_name.pdf'
    // Chúng ta chỉ cần lưu đường dẫn này vào database
    return this.careersService.applyForJob(id, createApplicationDto, file.path);
  }

  // --- Admin Job Application Management ---
  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllApplications() {
    return this.careersService.findAllApplications();
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOneApplication(@Param('id', ParseIntPipe) id: number) {
    return this.careersService.findOneApplication(id);
  }
}