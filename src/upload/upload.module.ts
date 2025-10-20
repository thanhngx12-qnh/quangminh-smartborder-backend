// dir: ~/quangminh-smart-border/backend/src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    CloudinaryModule, // Import module cloudinary đã có
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        cloudinary.config({
          cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.get<string>('CLOUDINARY_API_KEY'),
          api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
        });

        const storage = new CloudinaryStorage({
          cloudinary: cloudinary,
          params: {
            folder: 'site_assets', // Thư mục chung cho ảnh bìa, ảnh trong bài viết
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
          } as any,
        });

        return {
          storage: storage,
          limits: {
            fileSize: 1024 * 1024 * 5, // 5 MB
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}