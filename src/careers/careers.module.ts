// dir: ~/quangminh-smart-border/backend/src/careers/careers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Import
import { v2 as cloudinary } from 'cloudinary'; // <-- Import
import { CloudinaryStorage } from 'multer-storage-cloudinary'; // <-- Import
import { JobPosting } from './entities/job-posting.entity';
import { JobApplication } from './entities/job-application.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, JobApplication]),
    
    // NÂNG CẤP LỚN Ở ĐÂY: Cấu hình Multer với CloudinaryStorage
    MulterModule.registerAsync({
      imports: [ConfigModule], // Cần ConfigModule để đọc biến môi trường
      useFactory: (configService: ConfigService) => {
        cloudinary.config({
          cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.get<string>('CLOUDINARY_API_KEY'),
          api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
        });

        const storage = new CloudinaryStorage({
          cloudinary: cloudinary,
          params: {
            folder: 'cvs', // Thư mục trên Cloudinary để lưu file CV
            allowed_formats: ['pdf', 'doc', 'docx'],
          } as any, // Dùng `as any` để bỏ qua lỗi type không tương thích (nếu có)
        });

        return {
          storage: storage,
          limits: {
            fileSize: 1024 * 1024 * 5, // Vẫn giữ giới hạn 5 MB
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CareersService],
  controllers: [CareersController],
  exports: [CareersService],
})
export class CareersModule {}