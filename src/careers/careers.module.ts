// dir: ~/quangminh-smart-border/backend/src/careers/careers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express'; // <-- Import MulterModule
import { diskStorage } from 'multer'; // <-- Import diskStorage từ multer
import { extname } from 'path'; // <-- Import extname từ path
import { JobPosting } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller'; // Đã được CLI thêm vào

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, JobApplication]),
    // Cấu hình Multer
    MulterModule.register({
      storage: diskStorage({
        // 1. Destination: Nơi lưu file
        destination: './uploads/cvs', // Tạo thư mục con 'cvs' để tổ chức tốt hơn
        // 2. Filename: Cách đặt tên file để tránh trùng lặp
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // 3. File Filter: Kiểm tra định dạng file
      fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file PDF và DOC/DOCX
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          // Trả về lỗi nếu file không hợp lệ
          return cb(new Error('Only PDF and DOC/DOCX files are allowed!'), false);
        }
        cb(null, true);
      },
      // 4. Limits: Giới hạn kích thước file
      limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
      },
    }),
  ],
  providers: [CareersService],
  controllers: [CareersController], // Đã được CLI thêm vào
  exports: [CareersService],
})
export class CareersModule {}