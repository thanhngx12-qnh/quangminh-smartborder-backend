// dir: ~/quangminh-smart-border/backend/src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  uploadImage(file: Express.Multer.File) {
    // Logic chính đã được Multer và CloudinaryStorage xử lý
    // File đã được upload, và `file.path` chính là URL chúng ta cần.
    return {
      url: file.path,
    };
  }
}